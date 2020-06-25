import * as React from "react";
import * as ReactDOM from "react-dom";
import {  
    FocusOpts, ICON, RenderPrincipal, 
    clsx, memoize
} from "./render-general";
import {Bloque, CasilleroBase, CasoState, Filtro, Formulario, IContenido, Opcion, Pregunta} from "./tipos";
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
        </Grid>
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
        <Typography>Tipo de casillero no implementado:</Typography>
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
                <Grid item>
                    {
                        casillero.tipoc == "B"?<BloqueDespliegue bloque={casillero}/>:
                        casillero.tipoc == "FILTRO"?<FiltroDespliegue filtro={casillero}/>:
                        <CasilleroDesconocido casillero={casillero}></CasilleroDesconocido>
                    }
                </Grid>
            )}
        </Grid>}
    </Paper>
}

const FormularioEncabezado = DespliegueEncabezado;

function FormularioDespliegue(){
    var formulario = useSelector((state:CasoState)=>state.estructura.formularios[state.estado.formularioActual]);
    return <Paper>
        <FormularioEncabezado casillero={formulario}/>
        {!formulario.casilleros?.length?null:<Grid container direction="column">
            {formulario.casilleros.map((casillero)=>
                <Grid item>
                    {
                        casillero.tipoc == "B"?<BloqueDespliegue bloque={casillero}/>:
                        casillero.tipoc == "FILTRO"?<FiltroDespliegue filtro={casillero}/>:
                        <CasilleroDesconocido casillero={casillero}></CasilleroDesconocido>
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