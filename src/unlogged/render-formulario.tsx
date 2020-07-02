import * as React from "react";
import * as ReactDOM from "react-dom";
import {  
    FocusOpts, RenderPrincipal, 
    clsx, memoize, adaptarTipoVarCasillero,
    ICON
} from "./render-general";
import {Bloque, CasilleroBase, CasoState, Filtro, ForPk, Formulario, 
    IdCaso, DatosVivienda, 
    Opcion, OpcionMultiple, OpcionNo, OpcionSi, 
    Pregunta, PreguntaConOpciones, PreguntaConOpcionesMultiples, PreguntaSimple, 
    Respuestas, Valor, IdVariable, ModoDespliegue, IdFormulario, InfoFormulario
} from "./tipos";
import {dmTraerDatosFormulario, dispatchers, estadoRowValidator, toPlainForPk } from "./redux-formulario";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { EstadoVariable } from "row-validator";
import * as likeAr from "like-ar";

import {
    AppBar, Badge, Button, ButtonGroup, Card, Chip, CircularProgress, CssBaseline, 
    Dialog, DialogActions, DialogContent, DialogContentText, 
    DialogTitle, Divider, Fab, Grid, IconButton, InputBase, 
    Link, List, ListItem, ListItemIcon, ListItemText, Drawer, 
    Menu, MenuItem, Paper, Popover,
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

function DespliegueEncabezado(props:{casillero:CasilleroBase, leer?:boolean}){
    const {casillero} = props;
    var classes = useStyles();
    return <Grid container alignItems="center" debe-leer={props.leer?'SI':'NO'}>
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

function OpcionDespliegue(props:{casillero:CasilleroBase, valorOpcion:number, variable:string, forPk:ForPk, elegida:boolean, leer:boolean}){
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
                <Grid className={classes.textoOpcion} debe-leer={casillero.despliegue?.includes('si_leer')?'SI':casillero.despliegue?.includes('no_leer')?'NO':props.leer?'SI':'NO'}>
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
interface IcasilleroConOpciones{
    var_name:IdVariable,
    casilleros:Opcion[]
}


function SiNoDespliegue(props:{casilleroConOpciones:IcasilleroConOpciones, forPk:ForPk, valorActual:Valor}){
    return <OpcionesDespliegue 
        casilleroConOpciones={props.casilleroConOpciones} 
        forPk={props.forPk} 
        valorActual={props.valorActual}
        leer={false}
        horizontal={true}
    />
}

function OpcionMultipleDespliegue(props:{opcionM:OpcionMultiple, forPk:ForPk, valorActual:Valor, validateState:EstadoVariable}){
    const {opcionM} = props;
    var classes = useStyles();
    return <div className="multiple" nuestro-validator={props.validateState}>
        <EncabezadoDespliegue 
            casillero={opcionM} 
            verIdGuion={true} 
            leer={!opcionM.despliegue?.includes('no_leer')} 
            tieneValor={props.valorActual!=null?(estadoRowValidator[props.validateState].correcto?'valido':'invalido'):'NO'}
            validateState={props.validateState}
            forPk={props.forPk}
        />
        <div className="casilleros">
            <Grid container>
                <SiNoDespliegue 
                    casilleroConOpciones={opcionM} 
                    forPk={props.forPk}
                    valorActual={props.valorActual}
                />
            </Grid>
        </div>
    </div>
}

function EncabezadoDespliegue(props:{casillero:CasilleroBase, verIdGuion?:boolean, leer?:boolean, tieneValor?:string, validateState?:EstadoVariable|null, forPk:ForPk}){
    var {casillero} = props;
    var dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    var key=(casillero.ver_id!='-' || props.verIdGuion) && casillero.ver_id || casillero.casillero;
    const handleClose=()=>{
        setAnchorEl(null);
    }
    const open = Boolean(anchorEl);
    return <div 
        className="encabezado" 
        debe-leer={props.leer?'SI':'NO'} 
        tiene-valor={props.tieneValor} 
    >
        <div className="id-div"
            onClick={event=>{
                if(casillero.var_name!=null && props.tieneValor=='invalido'){
                    dispatch(dispatchers.REGISTRAR_RESPUESTA({forPk:props.forPk, variable:casillero.var_name, respuesta:null}))
                }else if(casillero.var_name!=null){
                    setAnchorEl(event.currentTarget);
                }
            }}
        >
            <div className="id">
                {key}
            </div>
        </div>
        <div className="nombre-div">
            <div className="nombre">{casillero.nombre}</div>
            {casillero.aclaracion?
                <div className="aclaracion">{casillero.aclaracion}</div>
            :null}
            <div los-metadatos="si">
                <span el-metadato="variable">{casillero.var_name}</span>
                <span el-metadato="expresion_habilitar">{casillero.expresion_habilitar}</span>
            </div>
        </div>
        <Popover
            id={anchorEl && "popover-confirmar" || undefined}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >   
            {props.tieneValor=="valido" && casillero.var_name?<div className="confirma-borrado">
                <Typography>La pregunta tiene registrada una respuesta</Typography>
                <div className="confirma-botones">
                    <Button color="primary"   variant="outlined" onClick={handleClose}>dejar así</Button>
                    <Button color="secondary" variant="outlined" onClick={()=>{
                        if(casillero.var_name){
                            dispatch(dispatchers.REGISTRAR_RESPUESTA({forPk:props.forPk, variable:casillero.var_name, respuesta:null}))
                        }
                        handleClose()
                    }}>Borrar respuesta</Button>
                </div>
            </div>:<div className="confirma-borrado">
                {props.validateState=="actual"?<>
                    <Typography>Esta es la pregunta actual {props.leer?"lea la respuesta y ":""} registre la respuesta </Typography>
                    <Typography>
                        {casillero.tipovar=="opciones"||casillero.tipovar=="si_no"?
                            "en el botón azul de la respuesta correspondiente "
                        :   "sobre la raya azul (pulse sobre ella para que aparezca el teclado)"}
                    </Typography>
                </>:props.validateState=="omitida"?<>
                    <Typography>Esta es la pregunta parece omitida.</Typography>
                    <Typography>Quizás falte ingresar la respuesta.</Typography>
                    <Typography>Quizás haya un error en una pregunta anterior.</Typography>
                </>:props.validateState=="fuera_de_rango"?<>
                    <Typography>La respuesta está fuera de rango</Typography>
                </>:props.validateState=="fuera_de_flujo_por_omitida"?<>
                    <Typography>Hay una respuesta omitida o un error más arriba.</Typography>
                    <Typography>Revise la pregunta marcada en amarillo.</Typography>
                </>:props.validateState=="todavia_no"?<>
                    <Typography>Todavía no hay que contestar esta pregunta.</Typography>
                    <Typography>Ingresar la respuesta a la pregunta de fondo blanco.</Typography>
                </>:props.validateState=="salteada"?<>
                    <Typography>Esta pregunta está salteada debido a una respuesta marcada más arriba.</Typography>
                    <Typography>Buscar la siguiente pregunta de fondo blanco.</Typography>
                </>:
                null}
                <div className="confirma-botones">
                    <Button color="primary"   variant="outlined" onClick={handleClose}>continuar</Button>
                </div>
            </div>}
        </Popover>
    </div>
}

function Campo(props:{pregunta:PreguntaSimple, valor:Valor, onChange:(valor:Valor)=>void}){
    var {pregunta} = props;
    var [valor, setValor] = useState(props.valor);
    useEffect(() => {
        setValor(props.valor)
    }, [props.valor]);
    const inputProps = {
        maxLength: pregunta.longitud,
    };
    return <TextField 
        className="variable" 
        //var-length={pregunta.longitud} 
        inputProps={inputProps}
        value={valor?valor:''} 
        type={adaptarTipoVarCasillero(pregunta.tipovar)}
        onChange={(event)=>setValor(event.target.value || null)}
        onBlur={(_event)=>props.onChange(valor)}
    />
}

interface IcasilleroConOpciones{
    var_name:IdVariable,
    casilleros:Opcion[]
}

function OpcionesDespliegue(
    {casilleroConOpciones, forPk, valorActual, leer, horizontal}:
    {casilleroConOpciones:IcasilleroConOpciones, forPk:ForPk, valorActual:Valor, leer:boolean, horizontal:boolean}
    // {casilleroConOpciones:PreguntaConOpciones|OpcionMultiple, forPk:ForPk, valorActual:Valor, leer:boolean, horizontal:boolean}
){
    return <Grid container direction={horizontal?"row":"column"} wrap={horizontal?"nowrap":"wrap"}>{
        casilleroConOpciones.casilleros.map((opcion:Opcion)=>
            <Grid key={opcion.casillero} item>
                <OpcionDespliegue 
                    casillero={opcion} 
                    valorOpcion={opcion.casillero} 
                    variable={casilleroConOpciones.var_name} 
                    forPk={forPk} 
                    elegida={valorActual==opcion.casillero}
                    leer={leer}
                />
            </Grid>
        )
    }</Grid>
}

function PreguntaDespliegue(props:{
    pregunta:Pregunta, 
    forPk:ForPk, 
    valorActual:Valor, 
    respuestas:Respuestas|null, 
    validateState:EstadoVariable|null,
    validateRow:{[v in IdVariable]?:EstadoVariable}|null
}){
    var {pregunta} = props;
    var dispatch=useDispatch();
    return <div 
        className="pregunta" 
        nuestro-tipovar={pregunta.tipovar||"multiple"} 
        nuestro-validator={props.validateState}
        ocultar-salteada={pregunta.despliegue?.includes('ocultar')?'SI':'NO'}
    >
        <EncabezadoDespliegue 
            casillero={pregunta} 
            leer={!pregunta.despliegue?.includes('no_leer')}  
            tieneValor={props.valorActual!=null && props.validateState!=null?(estadoRowValidator[props.validateState].correcto?'valido':'invalido'):'NO'}
            validateState={props.validateState}
            forPk={props.forPk}
        />
        <div className="casilleros">{
            pregunta.tipovar=="si_no"?<Grid container>
                <SiNoDespliegue 
                    casilleroConOpciones={pregunta} 
                    forPk={props.forPk} 
                    valorActual={props.valorActual}
                />
            </Grid>:
            pregunta.tipovar=="opciones" ?
                <OpcionesDespliegue 
                    casilleroConOpciones={pregunta} 
                    forPk={props.forPk} 
                    valorActual={props.valorActual}
                    leer={!!pregunta.despliegue?.includes('si_leer')}
                    horizontal={!!pregunta.despliegue?.includes('horizontal')}
                />:
            pregunta.tipovar==null?
                (pregunta.casilleros as OpcionMultiple[]).map((opcionMultiple)=>
                    <OpcionMultipleDespliegue
                        key={opcionMultiple.casillero} 
                        opcionM={opcionMultiple} 
                        forPk={props.forPk} 
                        valorActual={props.respuestas?.[opcionMultiple.var_name]!}
                        validateState={props.validateRow?.[opcionMultiple.var_name]!}
                    />
                )
            :
            ((preguntaSimple:PreguntaSimple)=>
                <Campo 
                    pregunta={preguntaSimple}
                    valor={props.valorActual}
                    onChange={(nuevoValor)=>
                        dispatch(dispatchers.REGISTRAR_RESPUESTA({forPk:props.forPk, variable:preguntaSimple.var_name, respuesta:nuevoValor}))
                    }
                />
            )(pregunta)
        }</div>
    </div>
}

function FiltroDespliegue(props:{filtro:Filtro, forPk:ForPk}){
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

function useSelectorVivienda(forPk:ForPk){
    return useSelector((state:CasoState)=>({
        respuestas: state.datos.hdr[forPk.vivienda].respuestas, 
        feedback: state.feedbackRowValidator[toPlainForPk(forPk)].estados,
        resumen: state.feedbackRowValidator[toPlainForPk(forPk)].resumen,
        formulario: state.estructura.formularios[forPk.formulario].casilleros,
        modoDespliegue: state.opciones.modoDespliegue
    }))
}

function DesplegarContenidoInternoBloqueOFormulario(props:{bloqueOFormulario:Bloque|Formulario, forPk:ForPk}){
    var {respuestas, feedback} = useSelectorVivienda(props.forPk);
    return <div className="casilleros">{
        props.bloqueOFormulario.casilleros.map((casillero)=>
            <Grid key={casillero.casillero} item>
                {
                    casillero.tipoc == "P"?
                        <PreguntaDespliegue 
                            pregunta={casillero} 
                            forPk={props.forPk} 
                            valorActual={casillero.var_name && respuestas[casillero.var_name] || null} 
                            respuestas={(!casillero.var_name || null) && respuestas}
                            validateState={casillero.var_name && feedback[casillero.var_name] || null}
                            validateRow={!casillero.var_name && feedback || null}
                        />:
                    casillero.tipoc == "B"?<BloqueDespliegue bloque={casillero} forPk={props.forPk}/>:
                    casillero.tipoc == "FILTRO"?<FiltroDespliegue filtro={casillero} forPk={props.forPk}/>:
                    <CasilleroDesconocido casillero={casillero}/>
                }
            </Grid>
        )
    }</div>
}

function BloqueDespliegue(props:{bloque:Bloque, forPk:ForPk}){
    var {bloque} = props;
    var key=bloque.ver_id!='-' && bloque.ver_id || bloque.casillero;
    var activeStep=0;
    return <div className="bloque" nuestro-bloque={bloque.casillero}>
        <EncabezadoDespliegue casillero={bloque} forPk={props.forPk}/>
        <DesplegarContenidoInternoBloqueOFormulario bloqueOFormulario={bloque} forPk={props.forPk}/>
    </div>
}

const FormularioEncabezado = DespliegueEncabezado;

function FormularioDespliegue(props:{forPk:ForPk}){
    var forPk = props.forPk;
    var {formulario, modoDespliegue} = useSelectorVivienda(props.forPk);
    const dispatch = useDispatch();
    var listaModos:ModoDespliegue[]=['metadatos','relevamiento','PDF'];
    return <div className="formulario" modo-despliegue={modoDespliegue}>
        <div>
            <Typography component="span">Modo de despliegue:</Typography>
            <ButtonGroup>
            {listaModos.map(modo=>
                <Button key={modo} variant={modo==modoDespliegue?"contained":"outlined"} onClick={
                    ()=>dispatch(dispatchers.MODO_DESPLIEGUE({modoDespliegue:modo}))
                }>{modo}</Button>
            )}
            </ButtonGroup>
        </div>
        <Button 
            variant="outlined"
            onClick={()=>
                dispatch(dispatchers.VOLVER_HDR({}))
            }
        >
            Volver a HDR            
        </Button>
        <FormularioEncabezado casillero={formulario}/>
        <DesplegarContenidoInternoBloqueOFormulario bloqueOFormulario={formulario} forPk={forPk}/>
    </div>
}

function calcularResumenVivienda(idCaso:IdCaso){
    var prioridades = {
        'con problemas':{prioridad: 1, cantidad:0},
        'incompleto':{prioridad: 2, cantidad:0},
        'vacio':{prioridad: 3, cantidad:0},
        'ok':{prioridad: 4, cantidad:0}
    }
    var {formularios} = useSelector((state:CasoState)=>({formularios: state.estructura.formularios}));
    var forms = likeAr(formularios).map((_infoFormulario:InfoFormulario, idFormulario: IdFormulario)=>
        idFormulario
    ).array();
    var min = 4
    var minResumen: 'vacio' | 'con problemas' | 'incompleto' | 'ok' = 'ok';
    forms.forEach((formulario:IdFormulario)=>{
        var {resumen} = useSelectorVivienda({vivienda:idCaso, formulario});    
        if(prioridades[resumen].prioridad<min){
            min=prioridades[resumen].prioridad;
            min=prioridades[resumen].cantidad++;
            minResumen=resumen;
        }
        minResumen = minResumen=='vacio'&& prioridades['ok'].cantidad?'incompleto':minResumen;
    })
    return minResumen
}

export function HojaDeRutaDespliegue(){
    var {hdr, mainForm} = useSelector((state:CasoState)=>({hdr:state.datos.hdr, mainForm:state.estructura.mainForm}));
    var dispatch = useDispatch();
    return (
        <>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6">
                        Hoja de ruta
                    </Typography>
                    <div>
                        <Button style={{marginTop:'3px'}}
                            color="inherit"
                            //onClick={/*dispatch que lleva a pantalla opciones*/}
                        >
                            <ICON.Settings/>
                        </Button>
                        <Button
                            color="inherit"
                            onClick={()=>{
                                //PROVISORIO
                                history.replaceState(null, '', `${location.origin+location.pathname}/../menu#i=configurar`);
                                location.reload();   
                            }}
                        >
                            <ICON.ExitToApp/>
                        </Button>
                    </div>
                </Toolbar>
            </AppBar>
            <main>
                <Paper className="hoja-de-ruta">
                    <Table className="tabla-hoja-de-ruta" style={{borderTopStyle: "groove", marginTop:'40px'}}>
                        <colgroup>
                            <col style={{width:"15%"}}/>
                            <col style={{width:"80%"}}/>
                        </colgroup>      
                        <TableHead style={{fontSize: "1.2rem"}}>
                            <TableRow className="tr-caso">
                                <TableCell>vivienda</TableCell>
                                <TableCell>domicilio</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {likeAr(hdr).map((datosVivienda: DatosVivienda, idCaso: IdCaso)=>
                                <TableRow>
                                    <TableCell>
                                        <Button
                                            resumen-vivienda={calcularResumenVivienda(idCaso)}
                                            variant="outlined"
                                            onClick={()=>{
                                                dispatch(dispatchers.CAMBIAR_FORMULARIO({forPk:{vivienda:idCaso, formulario:mainForm}}))
                                            }}
                                        >
                                            {idCaso}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <pre>{JSON.stringify(datosVivienda.tem)}</pre>
                                    </TableCell>
                                </TableRow>
                            ).array()}
                        </TableBody>
                    </Table>
                </Paper>
            </main>
        </>
    );
}

export function AppEseco(){
    var forPk = useSelector((state:CasoState)=>state.opciones.forPk);
    if(forPk==null){
        return <HojaDeRutaDespliegue /> 
    }else{
        return <FormularioDespliegue forPk={forPk}/>
    }
}

export async function desplegarFormularioActual(){
    // traer los metadatos en una "estructura"
    // traer los datos de localStorage
    // verificar el main Layout
    const store = await dmTraerDatosFormulario()
    ReactDOM.render(
        <RenderPrincipal store={store} dispatchers={dispatchers} mensajeRetorno="Volver a la hoja de ruta">
            <AppEseco/>
        </RenderPrincipal>,
        document.getElementById('main_layout')
    )
}

if(typeof window !== 'undefined'){
    // @ts-ignore para hacerlo
    window.desplegarFormularioActual = desplegarFormularioActual;
    // window.desplegarHojaDeRuta = desplegarHojaDeRuta;
}