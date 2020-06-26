import * as React from "react";
import * as ReactDOM from "react-dom";
import {  
    FocusOpts, ICON, RenderPrincipal, 
    clsx, memoize
} from "./render-general";
import {Bloque, CasilleroBase, CasoState, Filtro, Formulario, IContenido, Opcion, OpcionMultiple, OpcionNo, OpcionSi, Pregunta} from "./tipos";
import {dmTraerDatosFormulario } from "./redux-formulario";
import { useState, useEffect, useRef} from "react";
import { Provider, useSelector, useDispatch } from "react-redux"; 
import * as memoizeBadTyped from "memoize-one";
import * as likeAr from "like-ar";

import {
    AppBar, Badge, Button, ButtonGroup, Card, Chip, CircularProgress, CssBaseline, 
    Dialog, DialogActions, DialogContent, DialogContentText, 
    DialogTitle, Divider, Fab, Grid, IconButton, InputBase, 
    Link, List, ListItem, ListItemIcon, ListItemText, Drawer, 
    Menu, MenuItem, Paper, SvgIcon, Switch, 
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
        },
        itemOpcion:{
            padding:'6px',
            border:'1px dashed green'
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

function OpcionDespliegue(props:{casillero:CasilleroBase}){
    const {casillero} = props;
    var classes = useStyles();
    return <Grid className={classes.itemOpcion}> 
        <Button variant="outlined" className={classes.buttonOpcion}>
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

function SiNoDespliegue(props:{casilleros:[OpcionSi, OpcionNo]}){
    return <Grid container>
        <OpcionDespliegue casillero={props.casilleros[0]}/>
        <OpcionDespliegue casillero={props.casilleros[1]}/>
    </Grid>
}

function OpcionMultipleDespliegue(props:{opcionM:OpcionMultiple}){
    const {opcionM} = props;
    var classes = useStyles();
    return <Grid container wrap="nowrap" spacing={3}>
        <Grid sm className={classes.idOpcionM} alignContent="flex-start">
            {opcionM.ver_id || opcionM.casillero}
        </Grid>
        <Grid sm alignContent="space-around">
            <Typography className={takeElementOrDefault(opcionM.tipoc, classes, classes.root)}>{opcionM.nombre}</Typography>
            {opcionM.aclaracion?
                <Typography className={classes.aclaracion}>{opcionM.aclaracion}</Typography>
            :null}
        </Grid>
        <Grid sm className={classes.itemOpciones} alignContent="flex-end">
            <SiNoDespliegue casilleros={opcionM.casilleros}/>
        </Grid>
</Grid>
}

const PreguntaEncabezado = DespliegueEncabezado;

function PreguntaDespliegue(props:{pregunta:Pregunta}){
    var {pregunta} = props;
    return <Grid container>
        <Grid>
            <BloqueEncabezado casillero={pregunta}/>
        </Grid>
        <Grid>{
            pregunta.tipovar=="si_no"?<Grid container>
                <SiNoDespliegue casilleros={pregunta.casilleros}/>
            </Grid>:
            pregunta.tipovar=="opciones" ?<Grid container direction="column">{
                pregunta.casilleros.map((opcion:Opcion)=>
                    <Grid key={opcion.casillero} item><OpcionDespliegue casillero={opcion}/></Grid>
                )
            }</Grid>:
            pregunta.tipovar==null?<Grid container direction="column">{
                pregunta.casilleros.map((opcionMultiple)=>
                    <Grid key={opcionMultiple.casillero} item><OpcionMultipleDespliegue opcionM={opcionMultiple}/></Grid>
                )
            }</Grid>:
            <TextField/>
        }</Grid>
    </Grid>
}

function FiltroDespliegue(props:{filtro:Filtro}){
    var {filtro} = props;
    return <Paper>
        <BloqueEncabezado casillero={filtro}/>
    </Paper>
}

function CasilleroDesconocido(props:{casillero:CasilleroBase}){
    var classes = useStyles();
    return <Paper className={classes.errorCasillero}>
        <Typography>Tipo de casillero no implementado: "{props.casillero.tipoc}" para "{props.casillero.casillero}"</Typography>
        <BloqueEncabezado casillero={props.casillero}/>
    </Paper>
}

const BloqueEncabezado = DespliegueEncabezado;

function BloqueDespliegue(props:{bloque:Bloque}){
    var {bloque} = props;
    return <Paper>
        <BloqueEncabezado casillero={bloque}/>
        {!bloque.casilleros?.length?null:<Grid container direction="column">
            {bloque.casilleros.map((casillero)=>
                <Grid key={casillero.casillero} item>
                    {
                        casillero.tipoc == "P"?<PreguntaDespliegue pregunta={casillero}/>:
                        casillero.tipoc == "B"?<BloqueDespliegue bloque={casillero}/>:
                        casillero.tipoc == "FILTRO"?<FiltroDespliegue filtro={casillero}/>:
                        <CasilleroDesconocido casillero={casillero}/>
                    }
                </Grid>
            )}
        </Grid>}
    </Paper>
}

const FormularioEncabezado = DespliegueEncabezado;

function FormularioDespliegue(){
    var formulario = useSelector((state:CasoState)=>state.estructura.formularios[state.estado.formularioActual]);
    return <Paper style={{maxWidth:'790px'}}>
        <FormularioEncabezado casillero={formulario}/>
        {!formulario.casilleros?.length?null:<Grid container direction="column">
            {formulario.casilleros.map((casillero)=>
                <Grid key={casillero.casillero} item>
                    {
                        casillero.tipoc == "P"?<PreguntaDespliegue pregunta={casillero}/>:
                        casillero.tipoc == "B"?<BloqueDespliegue bloque={casillero}/>:
                        casillero.tipoc == "FILTRO"?<FiltroDespliegue filtro={casillero}/>:
                        <CasilleroDesconocido casillero={casillero}/>
                    }
                </Grid>
            )}
        </Grid>}
    </Paper>
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