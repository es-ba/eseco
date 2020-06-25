import * as React from "react";
import * as ReactDOM from "react-dom";
import {  
    FocusOpts, ICON, RenderPrincipal, 
    clsx, memoize
} from "./render-general";
import {CasoState, DataCasillero, IContenido, Opcion, Pregunta} from "./tipos";
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
        F:{
            fontSize:'2rem'
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

function CasilleroDespliegue(props:{casillero:DataCasillero}){
    const {casillero} = props;
    var classes = useStyles();
    return <Grid container alignItems="center">
        <Grid item>
            <Button variant="outlined" className={takeElementOrDefault(casillero.tipoc, classes, classes.root)}>{casillero.ver_id || casillero.casillero}</Button>
        </Grid>
        <Grid item>
            <Typography className={takeElementOrDefault(casillero.tipoc, classes, classes.root)}>{casillero.nombre}</Typography>
        </Grid>
    </Grid>
}

function HijosDespliegue(props:{hijos:IContenido[]}){
    return !props.hijos?.length?null:<Grid container direction="column">
        {props.hijos.map((hijo:IContenido)=>
            <Grid item>
                <CasilleroDespliegue casillero={hijo.data}/>
                <HijosDespliegue hijos={hijo.childs}/>
            </Grid>
        )}
    </Grid>
}

function FormularioDespliegue(){
    var formulario = useSelector((state:CasoState)=>state.estructura.formularios[state.estado.formularioActual]);
    return <Paper>
        <CasilleroDespliegue casillero={formulario.data}/>
        <HijosDespliegue hijos={formulario.childs}/>
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