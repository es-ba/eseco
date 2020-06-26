import * as React from "react";
import * as ReactDOM from "react-dom";
import {  
    FocusOpts, ICON, RenderPrincipal, 
    clsx, memoize
} from "./render-general";
import {Bloque, CasilleroBase, CasoState, Filtro, ForPk, Formulario, IContenido, 
    Opcion, OpcionMultiple, OpcionNo, OpcionSi, Pregunta, PreguntaSimple, Respuestas, Valor, PreguntaConOpcionesMultiples
} from "./tipos";
import {dmTraerDatosFormulario, dispatchers } from "./redux-formulario";
import { useState, useEffect, useRef} from "react";
import { Provider, useSelector, useDispatch } from "react-redux"; 
import * as memoizeBadTyped from "memoize-one";
import * as likeAr from "like-ar";

import {
    AppBar, Badge, Button, ButtonGroup, Card, Chip, CircularProgress, CssBaseline, 
    Dialog, DialogActions, DialogContent, DialogContentText, 
    DialogTitle, Divider, Fab, Grid, IconButton, InputBase, 
    Link, List, ListItem, ListItemIcon, ListItemText, Drawer, 
    Menu, MenuItem, Paper, 
    Step, Stepper, StepContent, StepLabel, 
    SvgIcon, Switch, 
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Theme, Toolbar, Typography, Zoom,
    useScrollTrigger,
    createStyles, makeStyles
} from "@material-ui/core";

var useStyles = makeStyles((_theme: Theme) =>
    createStyles({
        root:{},
        errorCasillero:{
            backgroundColor:'#FDA'
        },
        F:{
            fontSize:'2rem'
        },
        aclaracion:{
            color:'gray'
        },
        idOpcionM:{
            fontWeight:'bold',
            margin:'4px',
            color:'gray'
        },
        idOpcion:{
            fontWeight:'bold',
            margin:'6px',
            color:'gray'
        },
        textoOpcion:{
            margin:'6px'
        },
        buttonOpcion:{
            padding:'0px',
            paddingLeft:'3px',
            textTransform: 'none',
            color:'inherit'
        },
        itemOpcion:{
            padding:'6px',
        },
        itemOpciones:{
            border:'1px dashed red'
        },
        salto:{
            textAlign:'center',
            fontSize:'80%',
            '&::before':{
                content:'->'
            },
            '::before':{
                content:'=>'
            },
        }
    })
);

/*
// const takeElementOrDefault<K, T extends [K in], D>()
function isIn<V, T>(k:keyof T, object:T): object[k] is V{
    return true
}
*/
function takeElementOrDefault<V,K extends string,KO extends string>(k:K, object:{[k in KO]:V}, defaultValue:V):V{
    return k in object ? 
        // @ts-expect-error por alguna razón TS no quiere entender que si k está en object, object[k] existe
        object[k] 
    : defaultValue
}

function DespliegueEncabezado(props:{casillero:CasilleroBase}){
    const {casillero} = props;
    var classes = useStyles();
    return <Grid container alignItems="center">
        <Grid item>
            <Button variant="outlined" className={takeElementOrDefault(casillero.tipoc, classes, classes.root)}>{casillero.ver_id || casillero.casillero}</Button>
        </Grid>
        <Grid item>
            <Typography className={takeElementOrDefault(casillero.tipoc, classes, classes.root)}>{casillero.nombre}</Typography>
            {casillero.aclaracion?
                <Typography className={classes.aclaracion}>{casillero.aclaracion}</Typography>
            :null}
        </Grid>
    </Grid>
}

function OpcionDespliegue(props:{casillero:CasilleroBase, valorOpcion:number, variable:string, forPk:ForPk, elegida:boolean}){
    const {casillero} = props;
    var classes = useStyles();
    var dispatch = useDispatch();
    return <Grid className={classes.itemOpcion}> 
        <Button 
            variant={props.elegida?"contained":"outlined"}
            className={classes.buttonOpcion}
            onClick={()=>{
                dispatch(dispatchers.REGISTRAR_RESPUESTA({respuesta:props.valorOpcion, variable:props.variable,forPk:props.forPk}))
            }}
        >
            <Grid container>
                <Grid className={classes.idOpcion}>
                    {casillero.ver_id || casillero.casillero}
                </Grid>
                <Grid className={classes.textoOpcion}>
                    <Typography>{casillero.nombre}</Typography>
                    {casillero.aclaracion?
                        <Typography className={classes.aclaracion}>{casillero.aclaracion}</Typography>
                    :null}
                </Grid>
            </Grid>
        </Button>
        {casillero.salto?
            <Typography className={classes.salto}>{casillero.salto}</Typography>
        :null}
    </Grid>
}

function SiNoDespliegue(props:{casilleros:[OpcionSi, OpcionNo], variable:string, forPk:ForPk, valorActual:Valor}){
    return <Grid container wrap="nowrap">{
        (props.casilleros as Opcion[]).map((opcion:Opcion)=>
            <Grid key={opcion.casillero} item>
                <OpcionDespliegue 
                    casillero={opcion} 
                    variable={props.variable} 
                    valorOpcion={opcion.casillero} 
                    forPk={props.forPk} 
                    elegida={opcion.casillero==props.valorActual}
                />
            </Grid>
        )
    }</Grid>
}

function OpcionMultipleDespliegue(props:{opcionM:OpcionMultiple, forPk:ForPk, valorActual:Valor}){
    const {opcionM} = props;
    var classes = useStyles();
    return <div className="multiple">
        <div className="id">
            {opcionM.ver_id || opcionM.casillero}
        </div>
        <div className="nombre-div">
            <div className="nombre">{opcionM.nombre}</div>
            {opcionM.aclaracion?
                <div className="aclaracion">{opcionM.aclaracion}</div>
            :null}
        </div>
        <Grid container>
            <SiNoDespliegue 
                casilleros={opcionM.casilleros} 
                variable={opcionM.var_name} 
                forPk={props.forPk}
                valorActual={props.valorActual}
            />
        </Grid>
    </div>
}

function EncabezadoDespliegue(props:{casillero:CasilleroBase}){
    var {casillero} = props;
    var key=casillero.ver_id!='-' && casillero.ver_id || casillero.casillero;
    return <div className="encabezado">
        <div className="id">
            {key}
        </div>
        <div className="nombre-div">
            <div className="nombre">{casillero.nombre}</div>
            <div className="aclaracion">{casillero.aclaracion}</div>
        </div>
    </div>
}

function Campo(props:{pregunta:PreguntaSimple, valor:Valor, onChange:(valor:Valor)=>void}){
    var {pregunta} = props;
    var [valor, setValor] = useState(props.valor);
    return <TextField className="variable" var-length={pregunta.longitud} value={valor}
        onChange={(event)=>setValor(event.target.value)}
        onBlur={(event)=>props.onChange(event.target.value)}
    />
}

function PreguntaDespliegue(props:{pregunta:Pregunta, forPk:ForPk, valorActual:Valor, respuestas:Respuestas|null}){
    var {pregunta} = props;
    var dispatch=useDispatch();
    return <div className="pregunta" nuestro-tipovar={pregunta.tipovar||"multiple"}>
        <EncabezadoDespliegue casillero={pregunta}/>
        <div className="casilleros">{
            pregunta.tipovar=="si_no"?<Grid container>
                <SiNoDespliegue 
                    casilleros={pregunta.casilleros} 
                    variable={pregunta.var_name} 
                    forPk={props.forPk} 
                    valorActual={props.valorActual}
                />
            </Grid>:
            pregunta.tipovar=="opciones" ?<Grid container direction="column">{
                pregunta.casilleros.map((opcion:Opcion)=>
                    <Grid key={opcion.casillero} item>
                        <OpcionDespliegue 
                            casillero={opcion} 
                            valorOpcion={opcion.casillero} 
                            variable={pregunta.var_name} 
                            forPk={props.forPk} 
                            elegida={props.valorActual==opcion.casillero}
                        />
                    </Grid>
                )
            }</Grid>:
            pregunta.tipovar==null?
                pregunta.casilleros.map((opcionMultiple)=>
                    <OpcionMultipleDespliegue 
                        opcionM={opcionMultiple} 
                        forPk={props.forPk} 
                        valorActual={props.respuestas?.[opcionMultiple.var_name]!}
                    />
                )
            :
            <Campo 
                pregunta={pregunta}
                valor={props.valorActual}
                onChange={(nuevoValor)=>
                    dispatch(dispatchers.REGISTRAR_RESPUESTA({forPk:props.forPk, variable:pregunta.var_name, respuesta:nuevoValor}))
                }
            />
        }</div>
    </div>
}

function FiltroDespliegue(props:{filtro:Filtro}){
    var {filtro} = props;
    return <Paper>
        <DespliegueEncabezado casillero={filtro}/>
    </Paper>
}

function CasilleroDesconocido(props:{casillero:CasilleroBase}){
    var classes = useStyles();
    return <Paper className={classes.errorCasillero}>
        <Typography>Tipo de casillero no implementado: "{props.casillero.tipoc}" para "{props.casillero.casillero}"</Typography>
        <DespliegueEncabezado casillero={props.casillero}/>
    </Paper>
}

function DesplegarContenidoInternoBloqueOFormulario(props:{bloqueOFormulario:Bloque|Formulario}){
    var respuestas = useSelector((state:CasoState)=>state.datos.respuestas);
    return <div className="casilleros">{
        props.bloqueOFormulario.casilleros.map((casillero)=>
            <Grid key={casillero.casillero} item>
                {
                    casillero.tipoc == "P"?
                        <PreguntaDespliegue 
                            pregunta={casillero} 
                            forPk={{vivienda:1, persona:1}} 
                            valorActual={casillero.var_name && respuestas[casillero.var_name]} 
                            respuestas={!casillero.var_name && respuestas || null}
                        />:
                    casillero.tipoc == "B"?<BloqueDespliegue bloque={casillero}/>:
                    casillero.tipoc == "FILTRO"?<FiltroDespliegue filtro={casillero}/>:
                    <CasilleroDesconocido casillero={casillero}/>
                }
            </Grid>
        )
    }</div>
}

function BloqueDespliegue(props:{bloque:Bloque}){
    var {bloque} = props;
    var key=bloque.ver_id!='-' && bloque.ver_id || bloque.casillero;
    var activeStep=0;
    return <div className="bloque" nuestro-bloque={bloque.casillero}>
        <EncabezadoDespliegue casillero={bloque}/>
        <DesplegarContenidoInternoBloqueOFormulario bloqueOFormulario={bloque}/>
    </div>
}

const FormularioEncabezado = DespliegueEncabezado;

function FormularioDespliegue(){
    var formulario = useSelector((state:CasoState)=>state.estructura.formularios[state.estado.formularioActual]);
    var datos =  useSelector((state:CasoState)=>state.datos);
    return <div className="formulario">
        <pre>{JSON.stringify(datos,null,' ')}</pre>
        <FormularioEncabezado casillero={formulario}/>
        <DesplegarContenidoInternoBloqueOFormulario bloqueOFormulario={formulario}/>
    </div>
}

export async function desplegarFormularioActual(){
    // traer los metadatos en una "estructura"
    // traer los datos de localStorage
    // verificar el main Layout
    const store = await dmTraerDatosFormulario()
    ReactDOM.render(
        <RenderPrincipal store={store}>
            <FormularioDespliegue />
        </RenderPrincipal>,
        document.getElementById('main_layout')
    )
}

if(typeof window !== 'undefined'){
    // @ts-ignore para hacerlo
    window.desplegarFormularioActual = desplegarFormularioActual;
    // window.desplegarHojaDeRuta = desplegarHojaDeRuta;
}