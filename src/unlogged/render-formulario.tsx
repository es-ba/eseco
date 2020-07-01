import * as React from "react";
import * as ReactDOM from "react-dom";
import {  
    FocusOpts, RenderPrincipal, 
    clsx, memoize, adaptarTipoVarCasillero
} from "./render-general";
import {Bloque, CasilleroBase, CasoState, Filtro, ForPk, Formulario, 
    IdCaso, DatosVivienda, 
    Opcion, OpcionMultiple, OpcionNo, OpcionSi, 
    Pregunta, PreguntaConOpciones, PreguntaConOpcionesMultiples, PreguntaSimple, 
    Respuestas, Valor, IdVariable, ModoDespliegue
} from "./tipos";
import {dmTraerDatosFormulario, dispatchers, estadoRowValidator, toPlainForPk } from "./redux-formulario";
import { useState, useEffect, useRef} from "react";
import { Provider, useSelector, useDispatch } from "react-redux"; 
import { EstadoVariable } from "row-validator";
import * as memoizeBadTyped from "memoize-one";
import * as likeAr from "like-ar";

// https://material-ui.com/components/material-icons/
const materialIoIconsSvgPath={
    Assignment: "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    CheckBoxOutlineBlankOutlined: "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
    CheckBoxOutlined: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z",
    ChevronLeft: "M14.71 6.71a.9959.9959 0 00-1.41 0L8.71 11.3c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L10.83 12l3.88-3.88c.39-.39.38-1.03 0-1.41z",
    ChevronRight: "M9.29 6.71c-.39.39-.39 1.02 0 1.41L13.17 12l-3.88 3.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z",
    Clear: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    Close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    Code: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",
    Delete:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    Description: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
    EmojiObjects: "M12 3c-.46 0-.93.04-1.4.14-2.76.53-4.96 2.76-5.48 5.52-.48 2.61.48 5.01 2.22 6.56.43.38.66.91.66 1.47V19c0 1.1.9 2 2 2h.28c.35.6.98 1 1.72 1s1.38-.4 1.72-1H14c1.1 0 2-.9 2-2v-2.31c0-.55.22-1.09.64-1.46C18.09 13.95 19 12.08 19 10c0-3.87-3.13-7-7-7zm2 16h-4v-1h4v1zm0-2h-4v-1h4v1zm-1.5-5.59V14h-1v-2.59L9.67 9.59l.71-.71L12 10.5l1.62-1.62.71.71-1.83 1.82z",
    ExitToApp: "M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
    ExpandLess: "M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z",
    ExpandMore: "M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z",
    FormatLineSpacing: "M6 7h2.5L5 3.5 1.5 7H4v10H1.5L5 20.5 8.5 17H6V7zm4-2v2h12V5H10zm0 14h12v-2H10v2zm0-6h12v-2H10v2z",
    Info: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
    KeyboardArrowUp: "M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z",
    Label: "M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z",
    LocalAtm: "M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4V8h-2V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1zm9-13H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12z",
    Menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
    RemoveShoppingCart: "M22.73 22.73L2.77 2.77 2 2l-.73-.73L0 2.54l4.39 4.39 2.21 4.66-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h7.46l1.38 1.38c-.5.36-.83.95-.83 1.62 0 1.1.89 2 1.99 2 .67 0 1.26-.33 1.62-.84L21.46 24l1.27-1.27zM7.42 15c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h2.36l2 2H7.42zm8.13-2c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H6.54l9.01 9zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z",
    Save:"M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z",
    Search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    Settings: "M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z",
    Warning: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
    /// JULI ICONS:
    Pendientes:"M2.4 15.35 H 104.55 V 35.65 H -104.55 M 2.4 59.35 H 104.55 V 35.65 Z M 2.4 103.35 H 104.55 V 35.65 Z  M145.6,109.35V133H121.95V109.35H145.6m6-6H115.95V139H151.6V103.35h0Z M145.6,65.35V89H121.95V65.35H145.6m6-6H115.95V95H151.6V59.35h0Z M145.6,21.35V45H121.95V21.35H145.6m6-6H115.95V51H151.6V15.35h0Z",
    Repregunta:"M19.9,13.3c0,4.4-3.6,7.9-7.9,7.9s-7.9-3.6-7.9-7.9S7.6,5.4,12,5.4V8l5.3-4l-5.3-4v2.6C6.1,2.7,1.4,7.5,1.4,13.3 S6.1,23.9,12,23.9s10.6-4.7,10.6-10.6H19.9z M8.9,17.8v-7.6h3.2c0.8,0,1.4,0.1,1.8,0.2c0.4,0.1,0.7,0.4,0.9,0.7 c0.2,0.4,0.3,0.7,0.3,1.2c0,0.6-0.2,1-0.5,1.4c-0.3,0.4-0.8,0.6-1.5,0.7c0.3,0.2,0.6,0.4,0.8,0.6c0.2,0.2,0.5,0.6,0.9,1.2l0.9,1.5 h-1.8l-1.1-1.7c-0.4-0.6-0.7-1-0.8-1.1c-0.1-0.2-0.3-0.3-0.5-0.3c-0.2-0.1-0.4-0.1-0.8-0.1h-0.3v3.2H8.9z M10.4,13.4h1.1 c0.7,0,1.2,0,1.4-0.1c0.2-0.1,0.3-0.2,0.4-0.3c0.1-0.2,0.2-0.3,0.2-0.6c0-0.3-0.1-0.5-0.2-0.6c-0.1-0.2-0.3-0.3-0.6-0.3 c-0.1,0-0.5,0-1.1,0h-1.2V13.4z",
}

const ICON = likeAr(materialIoIconsSvgPath).map(svgText=> () =>
    <SvgIcon><path d={svgText}/></SvgIcon>
).plain();

const ChevronLeftIcon = ICON.ChevronLeft;
const MenuIcon = ICON.Menu;
const DeleteIcon = ICON.Delete;
const DescriptionIcon = ICON.Description;
const SearchIcon = ICON.Search;
const KeyboardArrowUpIcon = ICON.KeyboardArrowUp;
const ClearIcon = ICON.Clear;
const SaveIcon = ICON.Save;
const SettingsIcon = ICON.Settings;
const RepreguntaIcon = ICON.Repregunta;
const ExitToAppIcon = ICON.ExitToApp;

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
                <Grid className={classes.textoOpcion} debe-leer={casillero.despliegue=='leer'?'SI':casillero.despliegue=='no leer'?'NO':props.leer?'SI':'NO'}>
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
                    leer={false}
                />
            </Grid>
        )
    }</Grid>
}

function OpcionMultipleDespliegue(props:{opcionM:OpcionMultiple, forPk:ForPk, valorActual:Valor, validateState:EstadoVariable}){
    const {opcionM} = props;
    var classes = useStyles();
    return <div className="multiple" nuestro-validator={props.validateState}>
        <EncabezadoDespliegue 
            casillero={opcionM} 
            verIdGuion={true} 
            leer={opcionM.despliegue!='no leer'} 
            tieneValor={props.valorActual!=null?(estadoRowValidator[props.validateState].correcto?'valido':'invalido'):'NO'}
            validateState={props.validateState}
            forPk={props.forPk}
        />
        <div className="casilleros">
            <Grid container>
                <SiNoDespliegue 
                    casilleros={opcionM.casilleros} 
                    variable={opcionM.var_name} 
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

function OpcionesDespliegue({pregunta, forPk, valorActual, leer}:{pregunta:PreguntaConOpciones, forPk:ForPk, valorActual:Valor, leer:boolean}){
    return <Grid container direction="column">{
        pregunta.casilleros.map((opcion:Opcion)=>
            <Grid key={opcion.casillero} item>
                <OpcionDespliegue 
                    casillero={opcion} 
                    valorOpcion={opcion.casillero} 
                    variable={pregunta.var_name} 
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
    return <div className="pregunta" nuestro-tipovar={pregunta.tipovar||"multiple"} nuestro-validator={props.validateState}>
        <EncabezadoDespliegue 
            casillero={pregunta} 
            leer={pregunta.despliegue!='no leer'}  
            tieneValor={props.valorActual!=null && props.validateState!=null?(estadoRowValidator[props.validateState].correcto?'valido':'invalido'):'NO'}
            validateState={props.validateState}
            forPk={props.forPk}
        />
        <div className="casilleros">{
            pregunta.tipovar=="si_no"?<Grid container>
                <SiNoDespliegue 
                    casilleros={pregunta.casilleros} 
                    variable={pregunta.var_name} 
                    forPk={props.forPk} 
                    valorActual={props.valorActual}
                />
            </Grid>:
            pregunta.tipovar=="opciones" ?
                <OpcionesDespliegue 
                    pregunta={pregunta} 
                    forPk={props.forPk} 
                    valorActual={props.valorActual}
                    leer={pregunta.despliegue=='leer'}
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
    var listaModos:ModoDespliegue[]=['metadatos','relevamiento','estricto'];
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
                            <SettingsIcon/>
                        </Button>
                        <Button
                            color="inherit"
                            onClick={()=>{
                                //PROVISORIO
                                history.replaceState(null, '', `${location.origin+location.pathname}/../menu#i=configurar`);
                                location.reload();   
                            }}
                        >
                            <ExitToAppIcon/>
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