import * as React from "react";
import * as ReactDOM from "react-dom";
import {  
    FocusOpts, ICON, RenderPrincipal
} from "./render-general";
import {FormularioState, Pregunta, Opcion} from "./tipos";
import {dmTraerDatosFormulario } from "./redux-formulario";
import {useState, useEffect, useRef} from "react";
import { Provider, useSelector, useDispatch } from "react-redux"; 
import * as memoizeBadTyped from "memoize-one";
import * as likeAr from "like-ar";
import * as clsxx from 'clsx';
//@ts-ignore el módulo clsx no tiene bien puesto los tipos en su .d.ts
var clsx: (<T>(a1:string|T, a2?:T)=> string) = clsxx;

//@ts-ignore el módulo memoize-one no tiene bien puesto los tipos en su .d.ts
var memoize:typeof memoizeBadTyped.default = memoizeBadTyped;

import {
    AppBar, Badge, Button, ButtonGroup, Card, Chip, CircularProgress, CssBaseline, 
    Dialog, DialogActions, DialogContent, DialogContentText, 
    DialogTitle, Divider, Fab, Grid, IconButton, InputBase, 
    List, ListItem, ListItemIcon, ListItemText, Drawer, 
    Menu, MenuItem, Paper, SvgIcon, Switch, 
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Toolbar, Typography, Zoom,
    useScrollTrigger
} from "@material-ui/core";

function PreguntaDespliegue(props:{pregunta:Pregunta}){
    var {pregunta} = props;
    return <Card>
        <Typography>{pregunta.pregunta}</Typography>
        <Typography>{pregunta.texto}</Typography>
        {pregunta.salto==null?"":
            <Typography> <ICON.ChevronRight/> {pregunta.salto} </Typography>
        }
    </Card>
}

function FormularioDespliegue(){
    var preguntas = useSelector((state:FormularioState)=>state.estructura.preguntas);
    return <Paper>
        {preguntas.map(pregunta=><PreguntaDespliegue key={pregunta.pregunta} pregunta={pregunta}/>)}
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