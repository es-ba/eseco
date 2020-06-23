import * as React from "react";
import * as ReactDOM from "react-dom";
import {Producto, RelPre, RelAtr, AtributoDataTypes, HojaDeRuta, Razon, Estructura, RelInf, RelVis, RelVisPk, LetraTipoOpciones, OptsHdr, FocusOpts} from "./dm-tipos";
import {
    puedeCopiarTipoPrecio, puedeCopiarAtributos, muestraFlechaCopiarAtributos, 
    puedeCambiarPrecioYAtributos, tpNecesitaConfirmacion, razonNecesitaConfirmacion, 
    controlarPrecio, controlarAtributo, precioTieneAdvertencia, precioEstaPendiente,
    precioTieneError, 
    COLOR_ERRORES,
    simplificateText,
    precioTieneAtributosCargados
} from "./dm-funciones";
import {ActionHdr, dispatchers, dmTraerDatosHdr, dmTraerDatosFormulario, borrarDatosRelevamientoLocalStorage, devolverHojaDeRuta, isDirtyHDR, 
    hdrEstaDescargada, getCacheVersion} from "./dm-react";
import {useState, useEffect, useRef} from "react";
import { Provider, useSelector, useDispatch } from "react-redux"; 
import {areEqual} from "react-window";
import * as memoizeBadTyped from "memoize-one";
import * as likeAr from "like-ar";
import * as clsxx from 'clsx';
//@ts-ignore el módulo clsx no tiene bien puesto los tipos en su .d.ts
var clsx: (<T>(a1:string|T, a2?:T)=> string) = clsxx;

//@ts-ignore el módulo memoize-one no tiene bien puesto los tipos en su .d.ts
var memoize:typeof memoizeBadTyped.default = memoizeBadTyped;

import {
    AppBar, Badge, Button, ButtonGroup, Chip, CircularProgress, CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, 
    DialogTitle, Divider, Fab, Grid, IconButton, InputBase, List, ListItem, ListItemIcon, ListItemText, Drawer, 
    Menu, MenuItem, Paper, useScrollTrigger, SvgIcon, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Toolbar, Typography, Zoom
} from "@material-ui/core";
import { createStyles, makeStyles, Theme, fade} from '@material-ui/core/styles';
import { Store } from "redux";


// https://material-ui.com/components/material-icons/
export const materialIoIconsSvgPath={
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

export var estructura:Estructura;

const FLECHATIPOPRECIO="→";
const FLECHAATRIBUTOS="➡";
const PRIMARY_COLOR   ="#3f51b5";
const DEFAULT_ERROR_COLOR   ="#f44336";
const SECONDARY_COLOR ="#f50057";
const COLOR_ADVERTENCIAS = "rgb(255, 147, 51)";
const COLOR_PENDIENTES = "rgb(63, 81, 181)";
var CHECK = '✓';

type Styles = React.CSSProperties;

type OnUpdate<T> = (data:T)=>void

type InputTypes = 'date'|'number'|'tel'|'text';

function adaptAtributoDataTypes(attrDataType:AtributoDataTypes):InputTypes{
    const adapter:{[key in AtributoDataTypes]:InputTypes} = {
        'N': 'number',
        'C': 'text'
    }
    return adapter[attrDataType]
}

const useStylesScrollTop = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'fixed',
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
    }),
);

const handleScroll = () => () => {
    window.scroll({behavior:'smooth', top:0, left:0})
};


function ScrollTop(props: any) {
    const { children } = props;
    const classes = useStylesScrollTop();
    // Note that you normally won't need to set the window ref as useScrollTrigger
    // will default to window.
    // This is only being set here because the demo is in an iframe.
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 100,
    });
    return (
        <Zoom in={trigger}>
            <div onClick={handleScroll()} role="presentation" className={classes.root}>
                {children}
            </div>
        </Zoom>
    );
}

function focusToId(id:string, opts:FocusOpts, cb?:(e:HTMLElement)=>void){
    var element=document.getElementById(id);
    if(element){
        if(cb){
            cb(element);
        }else{
            element.focus();
            if(opts.moveToElement){
                element.scrollIntoView();
                window.scroll({behavior:'auto', top:window.scrollY-120, left:0})
            }
        }
    }
}
const useStylesTextField = makeStyles((_theme: Theme) =>
    createStyles({
        input: {
            '&::placeholder': {
                color: PRIMARY_COLOR,
            },
            fontSize: "1.3rem",
            lineHeight: 1.43,
            color:(props:{color:string}) => props.color,
        },
        underline: {
            "&:after": {
                borderBottomColor: (props:{borderBottomColor:string}) => props.borderBottomColor,
            }
        },
        error: {
            "&$error:after": {
                borderBottomColor: (props:{borderBottomColorError:string}) => props.borderBottomColorError,
            },
        }
    }),
);

function TypedInput<T extends string|number|null>(props:{
    autoFocus:boolean,
    borderBottomColor:string,
    borderBottomColorError:string
    color:string
    hasError:boolean,
    value:T,
    dataType: InputTypes
    onUpdate:OnUpdate<T>, 
    idProximo:string|null,
    inputId:string,
    tipoOpciones?:LetraTipoOpciones|null,
    opciones?:string[]|null
    onFocus?:()=>void
    disabled?:boolean,
    placeholder?:string,
    simplificateText: boolean,
    textTransform?:'lowercase'|'uppercase',
}){
    const dispatch = useDispatch();
    function valueT(value:string):T{
        if(value=='' || value==null){
            // @ts-ignore sé que T es null
            return null;
        }else if(props.dataType=="number"){
            var valorT:number=Number(value);
            if(isNaN(valorT)){
                valorT=Number(value.replace(/[^0-9.,]/g,''));
            }
            // @ts-ignore sé que T es number
            return valorT;
        }
        // @ts-ignore sé que T es string
        return value;
    }
    function valueS(valueT:T):string{
        if(valueT==null){
            return '';
        }else if(props.dataType=="number"){
            return valueT.toString();
        }
        // @ts-ignore sé que T es string
        return valueT;
    }
    const classes = useStylesTextField({
        borderBottomColor: props.borderBottomColor,
        borderBottomColorError: props.borderBottomColorError,
        color: props.color
    });
    useEffect(() => {
        var typedInputElement = document.getElementById(inputId)
        if(valueT(value) != props.value && typedInputElement && typedInputElement === document.activeElement){
            typedInputElement.style.backgroundColor='red';
        }
        setValue(valueS(props.value));
    }, [props.value]);
    useEffect(function(){
        return function(){
            var typedInputElement = document.getElementById(inputId) as HTMLInputElement;
            if(typedInputElement){
                var value = valueT(typedInputElement.value);
                if(value!==props.value){
                    props.onUpdate(value);
                }
            }
        }
    },[])
    var inputId=props.inputId;
    var [value, setValue] = useState<string>(valueS(props.value));
    const onBlurFun = function <TE extends React.FocusEvent<HTMLInputElement>>(event:TE){
        var customValue = event.target.value.trim();
        customValue = props.textTransform?props.textTransform=='uppercase'?customValue.toUpperCase():customValue.toLowerCase():customValue;
        customValue = props.simplificateText?simplificateText(customValue):customValue;
        setValue(customValue);
        var value = valueT(customValue);
        if(value!==props.value){
            props.onUpdate(value);
        }
        dispatch(dispatchers.UNSET_FOCUS({unfocusing:props.inputId}));
    };
    const onChangeFun = function <TE extends React.ChangeEvent<HTMLInputElement>>(event:TE){
        setValue(event.target.value);
    }
    const onKeyDownFun:React.KeyboardEventHandler = function(event:React.KeyboardEvent<HTMLInputElement>){
        var tecla = event.charCode || event.which;
        if((tecla==13) && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey){
            // @ts-ignore puede existir blur si target es un HTMLInputElement
            if(event.target.blur instanceof Function){
                // @ts-ignore puede existir blur si target es un HTMLInputElement
                event.target.blur();
            }
            if(props.idProximo!=null){
                focusToId(props.idProximo,{moveToElement:false})
            }
            props.onFocus?props.onFocus():null;
            event.preventDefault();
        }
    }
    const onClickFun = function<TE extends React.MouseEvent>(event:TE){
        var element = event.target;
        //MEJORAR, puede ser div tambien
        if(element instanceof HTMLTextAreaElement){
            var selection = element.value.length||0;
            element.selectionStart = selection;
            element.selectionEnd = selection;
        }
    }
    var readOnly = false;
    if(props.dataType=='text'){
        var input = <TextField
            autoFocus={props.autoFocus}
            multiline
            rowsMax="4"
            placeholder={props.placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            id={inputId}
            value={value}
            type={props.dataType} 
            onClick={(event)=>onClickFun(
                event
            )}
            onChange={onChangeFun}
            onFocus={(_event)=>{
                props.onFocus?props.onFocus():null;
            }}
            onBlur={onBlurFun}
            onKeyDown={onKeyDownFun}
            disabled={props.disabled?props.disabled:false}
            error={props.hasError}
            InputProps={{ classes: classes, readOnly: readOnly}}
        />
        return input;
    }else{
        var input = <TextField
            autoFocus={props.autoFocus}
            spellCheck={false}
            placeholder={props.placeholder}
            id={inputId}
            value={value}
            type={props.dataType} 
            onBlur={onBlurFun}
            onKeyDown={onKeyDownFun}
            onChange={onChangeFun}
            onFocus={(_event)=>{
                props.onFocus?props.onFocus():null;
            }}
            disabled={props.disabled?props.disabled:false}
            error={props.hasError}
            InputProps={{ classes: classes, readOnly: readOnly}}
        />
        return input;
    }
}

function DialogoSimple(props:{titulo?:string, valor:string, dataType:InputTypes, inputId:string, onCancel:()=>void, onUpdate:(valor:string)=>void}){
    const [valor, setValor] = useState(props.valor);
    return <Dialog
        open={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="alert-dialog-title-obs">{props.titulo || ''}</DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                value={valor}
                type={props.dataType}
                onChange={(event)=>{
                    setValor(event.target.value);
                }}
                // onKey = 13 ...
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={()=>{
                props.onCancel()
            }} color="secondary" variant="text">
                cancelar
            </Button>
            <Button onClick={()=>{
                props.onUpdate(valor)
            }} color="primary" variant="contained">
                Ok
            </Button>
        </DialogActions>
    </Dialog>
}

function EditableTd<T extends string|number|null>(props:{
    autoFocus?:boolean,
    borderBottomColor?:string,
    borderBottomColorError?:string
    color?:string
    hasError:boolean,
    inputId:string,
    idProximo?:string|null,
    disabled?:boolean,
    placeholder?: string,
    dataType: InputTypes,
    value:T, 
    className?:string
    onUpdate:OnUpdate<T|null>,
    tipoOpciones?:LetraTipoOpciones|null,
    opciones?:string[]|null,
    titulo?:string,
    onFocus?:()=>void,
    textTransform?:'uppercase'|'lowercase',
    simplificateText?:boolean,
}){
    const [editando, setEditando]=useState(false);
    const [editandoOtro, setEditandoOtro]=useState(false);
    const mostrarMenu = useRef<HTMLTableDataCellElement>(null);
    const editaEnLista = props.tipoOpciones=='C' || props.tipoOpciones=='A';
    const borderBottomColor = props.borderBottomColor || PRIMARY_COLOR;
    const borderBottomColorError = props.borderBottomColorError || DEFAULT_ERROR_COLOR;
    const color = props.color || '#000000';
    const classesBadge = useStylesBadge({backgroundColor: props.hasError?borderBottomColorError:null});
    var stringValue:string = props.value == null ? '' : props.value.toString();
    return <>
        <Badge 
            badgeContent="!" 
            anchorOrigin={{vertical: 'bottom',horizontal: 'right'}} 
            style={{width:"100%"}} 
            classes={{ 
                // @ts-ignore TODO: mejorar tipos STYLE #48
                badge: classesBadge.badge 
            }}
            className={
                // @ts-ignore TODO: mejorar tipos STYLE #48
                classesBadge.margin
            }
        >
            <div  
                className={props.className} 
                ref={mostrarMenu} 
                onClick={(_event)=>{
                    if(!props.disabled){
                        setEditando(true);
                        props.onFocus?props.onFocus():null;
                    }
                }}
                puede-editar={!props.disabled && !editando?"yes":"no"}
            >
            
                <TypedInput
                    autoFocus={props.autoFocus||false}
                    hasError={props.hasError}
                    borderBottomColor={borderBottomColor}
                    borderBottomColorError={borderBottomColorError}
                    color={color}
                    inputId={props.inputId}
                    value={props.value}
                    disabled={props.disabled}
                    dataType={props.dataType}
                    idProximo={props.idProximo||null}
                    simplificateText={!!props.simplificateText}
                    textTransform={props.textTransform}
                    onUpdate={value =>{
                        props.onUpdate(value);
                    }}
                    tipoOpciones={props.tipoOpciones}
                    opciones={props.opciones}
                    placeholder={props.placeholder}
                    onFocus={()=>{props.onFocus?props.onFocus():null}}
                />
            </div>
        </Badge>
        {editaEnLista && editando?
            <Menu id="simple-menu"
                open={editando && mostrarMenu.current !== undefined}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                anchorEl={mostrarMenu.current}
                onClose={()=> {
                    setEditando(false);
                }}
            >
                <MenuItem key='***** title' disabled={true} style={{color:'black', fontSize:'50%', fontWeight:'bold'}}>
                    <ListItemText style={{color:'black', fontSize:'50%', fontWeight:'bold'}}>{props.titulo}</ListItemText>
                </MenuItem>
                {props.value && (props.opciones||[]).indexOf(stringValue)==-1?
                    <MenuItem key='*****current value******' value={stringValue}
                        onClick={()=>{
                            setEditando(false);
                            props.onUpdate(props.value);
                        }}
                    >
                        <ListItemText style={{color:'blue'}}>{props.value}</ListItemText>
                    </MenuItem>
                :null}
                <Divider />
                {(props.opciones||[]).map(label=>(
                    <MenuItem key={label} value={label}
                        onClick={()=>{
                            setEditando(false);
                            // @ts-ignore TODO: mejorar los componentes tipados #49
                            props.onUpdate(label);
                        }}
                    >
                        <ListItemText style={label == stringValue?{color:'blue'}:{}}>{label}</ListItemText>                    
                    </MenuItem>
                ))}
                {props.tipoOpciones=='A'?<Divider />:null}
                {props.tipoOpciones=='A'?
                    <MenuItem key='*****other value******' 
                        onClick={()=>{
                            setEditandoOtro(true)
                        }}
                    >
                        <ListItemText style={{textDecoration:'italic'}}>OTRO</ListItemText>
                    </MenuItem>
                :null}
            </Menu>
            :null
        }
        {editandoOtro?
            // @ts-ignore TODO: mejorar los componentes tipados #49
            <DialogoSimple 
                titulo={props.titulo} 
                valor={props.value as unknown as string /* TODO ver #49 */} 
                dataType={props.dataType} 
                inputId={props.inputId+'_otro_attr'}
                onCancel={()=>setEditandoOtro(false)}
                onUpdate={(value)=>{
                    setEditandoOtro(false);
                    // @ts-ignore TODO: mejorar los componentes tipados #49
                    props.onUpdate(value || null);
                }}
            />
        :null}
    </>
};

const AtributosRow = function(props:{ 
    relAtr: RelAtr, 
    relPre: RelPre,
    iRelPre: number,
    inputId: string, 
    inputIdPrecio: string, 
    idProximoAtributo: string|null,
    idProximoPrecio: string|null,
    primerAtributo:boolean, 
    cantidadAtributos:number, 
    ultimoAtributo:boolean,
    razonPositiva:boolean,
    onSelection:()=>void
}){
    const relAtr = props.relAtr;
    const relPre = props.relPre;
    const dispatch = useDispatch();
    const atributo = estructura.atributos[relAtr.atributo];
    const prodatr = estructura.productos[relAtr.producto].atributos[relAtr.atributo];
    const [menuCambioAtributos, setMenuCambioAtributos] = useState<HTMLElement|null>(null);
    const classes = useStylesList();
    const {color: colorAdv, tieneAdv} = controlarAtributo(relAtr, relPre, estructura);
    return (
        <>
            <div className="nombre-atributo">{atributo.nombreatributo}</div>
            <div className="atributo-anterior" >{relAtr.valoranterior}</div>
            {props.primerAtributo?
                <div className="flechaAtributos" button-container="yes" style={{gridRow:"span "+relPre.atributos.length}}>
                    {props.razonPositiva?(
                        muestraFlechaCopiarAtributos(estructura, relPre)?
                            <Button disabled={!props.razonPositiva} color="primary" variant="outlined" onClick={ () => {
                                props.onSelection();
                                dispatch(dispatchers.BLANQUEAR_ATRIBUTOS({
                                    forPk:relAtr, 
                                    iRelPre:props.iRelPre,
                                }))
                                dispatch(dispatchers.SET_FOCUS({nextId:!relPre.precio?props.inputIdPrecio:false}))
                            }}>
                                {FLECHAATRIBUTOS}
                            </Button>
                        :(relPre.cambio=='C' && puedeCopiarAtributos(estructura, relPre))?
                            <Button disabled={!props.razonPositiva} color="primary" variant="outlined" onClick={ (event) => {
                                props.onSelection();
                                setMenuCambioAtributos(event.currentTarget)                            
                            }}>
                                C
                            </Button>
                        :(relPre.cambio=='=' && precioTieneAtributosCargados(relPre))?
                            <Button disabled={!props.razonPositiva} color="primary" variant="outlined" onClick={ (event) => {
                                props.onSelection();
                                setMenuCambioAtributos(event.currentTarget)                            
                            }}>
                                =
                            </Button>
                        :relPre.cambio
                    ):null}
                </div>
            :null}
            <EditableTd 
                borderBottomColor={PRIMARY_COLOR}
                borderBottomColorError={colorAdv}
                color={relPre.cambio != "C" && relPre.tipoprecio == null?PRIMARY_COLOR:undefined}
                hasError={tieneAdv && props.razonPositiva}
                className="atributo-actual" 
                inputId={props.inputId}
                idProximo={props.idProximoAtributo || props.idProximoPrecio}
                disabled={!props.razonPositiva || !puedeCambiarPrecioYAtributos(estructura, relPre)} 
                dataType={adaptAtributoDataTypes(atributo.tipodato)} 
                value={relAtr.valor} 
                textTransform='uppercase'
                simplificateText={true}
                onUpdate={value=>{
                    dispatch(dispatchers.SET_ATRIBUTO({
                        forPk:relAtr, 
                        iRelPre:props.iRelPre,
                        valor:value,
                    }))
                }} 
                tipoOpciones={prodatr.opciones}
                opciones={prodatr.lista_prodatrval}
                titulo={atributo.nombreatributo}
                onFocus={()=>{
                    props.onSelection();
                }}
            />
            <Menu id="simple-menu-cambio"
                open={Boolean(menuCambioAtributos)}
                anchorEl={menuCambioAtributos}
                onClose={()=>setMenuCambioAtributos(null)}
            >
                {relPre.cambio == 'C'?
                    <>
                        <MenuItem onClick={()=>{
                            dispatch(dispatchers.COPIAR_ATRIBUTOS_VACIOS({
                                forPk:relAtr, 
                                iRelPre:props.iRelPre,
                            }))
                            setMenuCambioAtributos(null)
                        }}>
                            <ListItemText style={{color:PRIMARY_COLOR}}  classes={{primary: classes.listItemText}}>
                                Copiar el resto de los atributos vacíos
                            </ListItemText>
                        </MenuItem>
                        <MenuItem onClick={()=>{
                            dispatch(dispatchers.COPIAR_ATRIBUTOS({
                                forPk:relAtr, 
                                iRelPre:props.iRelPre,
                            }))
                            setMenuCambioAtributos(null)
                        }}>
                            <ListItemText style={{color:SECONDARY_COLOR}} classes={{primary: classes.listItemText}}>
                                Anular el cambio pisando los valores distintos
                            </ListItemText>
                        </MenuItem>
                    </>
                :null}
                <MenuItem onClick={()=>{
                    dispatch(dispatchers.BLANQUEAR_ATRIBUTOS({
                        forPk:relAtr, 
                        iRelPre:props.iRelPre,
                    }))
                    setMenuCambioAtributos(null)
                }}>
                    <ListItemText style={{color:SECONDARY_COLOR}} classes={{primary: classes.listItemText}}>
                        Blanquear atributos
                    </ListItemText>
                </MenuItem>
            </Menu>
        </>
    )
};

const useStylesList = makeStyles((_theme: Theme) =>
    createStyles({
        listItemText:{
            fontSize:'1.2rem',
        }
    }),
);

function strNumber(num:number|null):string{
    var str = num==null ? "" : num.toString();
    if(/[.,]\d$/.test(str)){
        str+="0";
    }
    return str;
}

function numberElement(num:number|null):JSX.Element{
    var str=strNumber(num);
    var element=null;
    str.replace(/^([^.,]*)([.,]\d+)?$/, function(_, left:string, right:string){
        element = <span>{left}<span style={{fontSize:'80%'}}>{right}</span></span>;
        return '';
    });
    return element||<span>-</span>;
}

var FakeButton = (props:{children:React.ReactChild}) =>
    <div className="fakeButton">
        {props.children}
    </div>

var PreciosRow = React.memo(function PreciosRow(props:{
    style:Styles,
    relPre:RelPre, iRelPre:number,
    hasSearchString:boolean, allForms:boolean, esPrecioActual:boolean,
    inputIdPrecio:string, inputIdProximo:string|null, razonPositiva:boolean, compactar:boolean,
    isScrolling:boolean
}){
    const {hasSearchString, allForms, esPrecioActual, inputIdPrecio} = props;
    const [render4scroll, setRender4scroll] = useState(props.isScrolling);
    useEffect(function(){
        if(!props.isScrolling){
            setRender4scroll(false);
        }
    }, [props.isScrolling]);
    const relPre = props.relPre;
    const dispatch = useDispatch();
    const inputIdAtributos = relPre.atributos.map((relAtr)=>inputIdPrecio+'-'+relAtr.atributo);
    const productoDef:Producto = estructura.productos[relPre.producto];
    const [menuTipoPrecio, setMenuTipoPrecio] = useState<HTMLElement|null>(null);
    const [menuConfirmarBorradoPrecio, setMenuConfirmarBorradoPrecio] = useState<boolean>(false);
    const [dialogoObservaciones, setDialogoObservaciones] = useState<boolean>(false);
    const [tipoDePrecioNegativoAConfirmar, setTipoDePrecioNegativoAConfirmar] = useState<string|null>(null);
    const [observacionAConfirmar, setObservacionAConfirmar] = useState<string|null>(relPre.comentariosrelpre);
    var esNegativo = relPre.tipoprecio && !estructura.tipoPrecio[relPre.tipoprecio].espositivo;
    const classes = useStylesList();
    const classesBadgeCantidadMeses = useStylesBadge({backgroundColor:'#dddddd', color: "#000000"});
    const classesBadgeProdDestacado = useStylesBadge({backgroundColor:'#b8dbed', color: "#000000", top: 10, right:10, zIndex:-1});
    const classesBadgeComentariosAnalista = useStylesBadge({backgroundColor:COLOR_ADVERTENCIAS, top: 10, zIndex:-1});
    const {color: colorAdv, tieneAdv} = controlarPrecio(relPre, estructura, esPrecioActual);
    const precioAnteriorAMostrar = numberElement(relPre.precioanterior || relPre.ultimoprecioinformado);
    const chipColor = (relPre.tipoprecioanterior && estructura.tipoPrecio[relPre.tipoprecioanterior].espositivo?
        null
    :
        (relPre.tipoprecioanterior == "N"?
            "#76bee4"
        :
            (relPre.tipoprecioanterior=='S' && relPre.sinpreciohace4meses?
                "#66b58b"
            :    
                '#FFFFFF'
            )
        )
    );
    const chipTextColor = chipColor=='#FFFFFF'?'#000000':'#FFFFFF';
    const badgeCondition = !relPre.precioanterior && relPre.ultimoprecioinformado;
    var compactar = props.compactar;
    var handleSelection = function handleSelection(relPre:RelPre, hasSearchString:boolean, allForms:boolean, inputId: string | null){
        if(hasSearchString || allForms || compactar){
            dispatch(dispatchers.SET_QUE_VER({queVer: 'todos', informante: relPre.informante, formulario: relPre.formulario, allForms: false, searchString:'', compactar:false}));
            dispatch(dispatchers.SET_FORMULARIO_ACTUAL({informante:relPre.informante, formulario:relPre.formulario}));
            dispatch(dispatchers.SET_FOCUS({nextId:inputId || inputIdPrecio}))
        }
    }

    return (
        <div style={props.style} className="caja-relpre" es-positivo={relPre.tipoprecio == null ? (relPre.cambio=='C'?'si':'maso'):(estructura.tipoPrecio[relPre.tipoprecio].espositivo?'si':'no')}>
            <div className="caja-producto" id={'caja-producto-'+inputIdPrecio}>
                <div className="producto">{productoDef.nombreproducto}</div>
                <div className="observacion">{relPre.observacion==1?"":relPre.observacion.toString()}</div>
                {!compactar?
                    <>
                        <div className="especificacion">
                            <ConditionalWrapper
                                condition={(productoDef.destacado)}
                                wrapper={children => 
                                    <Badge style={{width:"100%"}} badgeContent=" "
                                        classes={{ 
                                            // @ts-ignore TODO: mejorar tipos STYLE #48
                                            badge: classesBadgeProdDestacado.badge 
                                        }} className={
                                            // @ts-ignore TODO: mejorar tipos STYLE #48
                                            classesBadgeProdDestacado.margin
                                        }>{children}
                                    </Badge>
                                }
                            >
                                <span>{productoDef.especificacioncompleta}</span>
                            </ConditionalWrapper>
                        </div>
                        {!!relPre.comentariosrelpre_1 && relPre.esvisiblecomentarioendm_1?
                            <div className="comentario-analista">
                                <Badge badgeContent=" " variant="dot"
                                    classes={{ 
                                        // @ts-ignore TODO: mejorar tipos STYLE #48
                                        badge: classesBadgeComentariosAnalista.badge 
                                    }} 
                                    className={
                                        // @ts-ignore TODO: mejorar tipos STYLE #48
                                        classesBadgeComentariosAnalista.margin
                                    }>
                                    <span>{relPre.comentariosrelpre_1}</span>
                                </Badge>
                            </div>
                            :null
                        }
                    </>
                    :null}
            </div>
            <div className="caja-precios">
                <div className="encabezado">
                    <div className="observaciones" button-container="yes">
                        {render4scroll?
                        <FakeButton>
                            {relPre.comentariosrelpre||'obs'}
                        </FakeButton>
                        :<>
                            <Button disabled={!props.razonPositiva} color="primary" variant="outlined" tiene-observaciones={relPre.comentariosrelpre?'si':'no'} onClick={()=>{
                                handleSelection(relPre, hasSearchString, allForms, null);
                                setDialogoObservaciones(true)
                            }}>
                                {relPre.comentariosrelpre||'obs'}
                            </Button>
                            <Dialog
                                open={dialogoObservaciones}
                                onClose={()=>{
                                    setDialogoObservaciones(false)
                                    setObservacionAConfirmar(relPre.comentariosrelpre);
                                }}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title-obs">{"Observaciones del precio"}</DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="alert-dialog-description-obs">
                                        <EditableTd
                                            autoFocus={true}
                                            hasError={false}
                                            inputId={inputIdPrecio+"_comentarios"}
                                            disabled={false}
                                            placeholder={"agregar observaciones"}
                                            className="observaciones"
                                            value={observacionAConfirmar}
                                            onUpdate={value=>{
                                                setObservacionAConfirmar(value);
                                            }} 
                                            dataType="text"
                                        />
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={()=>{
                                        dispatch(dispatchers.SET_COMENTARIO_PRECIO({
                                            forPk:relPre, 
                                            iRelPre: props.iRelPre,
                                            comentario:observacionAConfirmar,
                                        }));
                                        setDialogoObservaciones(false)
                                    }} color="primary" variant="outlined">
                                        Guardar
                                    </Button>
                                    <Button onClick={()=>{
                                        setObservacionAConfirmar(relPre.comentariosrelpre)
                                        setDialogoObservaciones(false)
                                    }} color="secondary" variant="outlined">
                                        Descartar cambio
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </>}
                    </div>
                    <div className="tipo-precio-anterior">{relPre.tipoprecioanterior}</div>
                    <div className="precio-anterior" precio-anterior style={{width: "100%", overflow: badgeCondition?'unset':'hidden'}}>
                        {render4scroll?                                
                            <span>{precioAnteriorAMostrar}</span>
                        :
                        <ConditionalWrapper
                            condition={!!badgeCondition}
                            wrapper={children => 
                                <Badge style={{width:"calc(100% - 5px)", display:'unset'}} badgeContent={relPre.cantidadperiodossinprecio} 
                                    classes={{ 
                                        // @ts-ignore TODO: mejorar tipos STYLE #48
                                        badge: classesBadgeCantidadMeses.badge 
                                    }} 
                                    className={
                                        // @ts-ignore TODO: mejorar tipos STYLE #48
                                        classesBadgeCantidadMeses.margin
                                    }
                                >
                                    {children}
                                </Badge>
                            }
                        >
                            {chipColor?
                                <Chip style={{backgroundColor:chipColor, color:chipTextColor, width:"100%", fontSize: "1rem"}} label={precioAnteriorAMostrar || "-"}></Chip>
                            :
                                <span>{precioAnteriorAMostrar}</span>
                            }
                        </ConditionalWrapper>
                        }
                    </div>
                    {!render4scroll?<>
                        <div className="flechaTP" button-container="yes" es-repregunta={relPre.repregunta?"yes":"no"}>
                            {relPre.repregunta?
                                <RepreguntaIcon/>
                            :((puedeCopiarTipoPrecio(estructura, relPre))?
                                <Button disabled={!props.razonPositiva} color="secondary" variant="outlined" onClick={ () => {
                                    handleSelection(relPre, hasSearchString, allForms, null);
                                    if(tpNecesitaConfirmacion(estructura, relPre,relPre.tipoprecioanterior!)){
                                        setTipoDePrecioNegativoAConfirmar(relPre.tipoprecioanterior);
                                        setMenuConfirmarBorradoPrecio(true)
                                    }else{
                                        dispatch(dispatchers.COPIAR_TP({forPk:relPre, iRelPre:props.iRelPre}));
                                    }
                                }}>
                                    {FLECHATIPOPRECIO}
                                </Button>
                                :'')
                            }
                        </div>
                        <div className="tipo-precio" button-container="yes">
                            <Button disabled={!props.razonPositiva} color={esNegativo?"secondary":"primary"} variant="outlined" onClick={event=>{
                                handleSelection(relPre, hasSearchString, allForms, null);
                                setMenuTipoPrecio(event.currentTarget)
                            }}>
                                {props.razonPositiva && relPre.tipoprecio || "\u00a0"}
                            </Button>
                        </div>
                        <Menu id="simple-menu"
                            open={Boolean(menuTipoPrecio)}
                            anchorEl={menuTipoPrecio}
                            onClose={()=>setMenuTipoPrecio(null)}
                        >
                            {estructura.tiposPrecioDef.filter(tpDef=>tpDef.visibleparaencuestador).map(tpDef=>{
                                var color=estructura.tipoPrecio[tpDef.tipoprecio].espositivo?PRIMARY_COLOR:SECONDARY_COLOR;
                                return (
                                <MenuItem key={tpDef.tipoprecio} onClick={()=>{
                                    setMenuTipoPrecio(null);
                                    if(tpNecesitaConfirmacion(estructura, relPre,tpDef.tipoprecio)){
                                        setTipoDePrecioNegativoAConfirmar(tpDef.tipoprecio);
                                        setMenuConfirmarBorradoPrecio(true)
                                    }else{
                                        dispatch(dispatchers.SET_TP({
                                            forPk:relPre, 
                                            iRelPre:props.iRelPre,
                                            tipoprecio:tpDef.tipoprecio
                                        }))
                                        dispatch(dispatchers.SET_FOCUS({nextId:!relPre.precio && estructura.tipoPrecio[tpDef.tipoprecio].espositivo?inputIdPrecio:false}))
                                    }
                                }}>
                                    <ListItemText classes={{primary: classes.listItemText}} style={{color:color, maxWidth:'30px'}}>{tpDef.tipoprecio}&nbsp;</ListItemText>
                                    <ListItemText classes={{primary: classes.listItemText}} style={{color:color}}>&nbsp;{tpDef.nombretipoprecio}</ListItemText>
                                </MenuItem>
                                )
                            })}
                        </Menu>
                        <Dialog
                            open={menuConfirmarBorradoPrecio}
                            onClose={()=>setMenuConfirmarBorradoPrecio(false)}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title-tpm">{"Eligió un tipo de precio negativo pero había precios o atributos cargados"}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description-tpn">
                                    Se borrará el precio y los atributos
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={()=>{
                                    setMenuConfirmarBorradoPrecio(false)
                                }} color="primary" variant="outlined">
                                    No borrar
                                </Button>
                                <Button onClick={()=>{
                                    dispatch(dispatchers.SET_TP({
                                        forPk:relPre, 
                                        iRelPre: props.iRelPre,
                                        tipoprecio:tipoDePrecioNegativoAConfirmar
                                    }))
                                    setMenuConfirmarBorradoPrecio(false)
                                }} color="secondary" variant="outlined">
                                    Borrar precio y atributos
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <EditableTd 
                            borderBottomColor={PRIMARY_COLOR}
                            borderBottomColorError={colorAdv}
                            hasError={tieneAdv && props.razonPositiva}
                            inputId={inputIdPrecio} 
                            idProximo={props.inputIdProximo}
                            disabled={!props.razonPositiva || !puedeCambiarPrecioYAtributos(estructura, relPre)} 
                            placeholder={puedeCambiarPrecioYAtributos(estructura, relPre)?'$':undefined} 
                            className="precio" 
                            value={relPre.precio} 
                            onUpdate={value=>{
                                /*
                                if(!props.razonPositiva){
                                    console.log('SE DETECTÓ UN ONUPDATE en razón negativa');
                                    alert('SE DETECTÓ UN ONUPDATE en razón negativa');
                                }
                                */
                                dispatch(dispatchers.SET_PRECIO({
                                    forPk:relPre, 
                                    iRelPre: props.iRelPre,
                                    precio:value,
                                }));
                            }} 
                            dataType="number"
                            onFocus={()=>{
                                handleSelection(relPre, hasSearchString, allForms, inputIdPrecio);
                            }}
                        />
                    </>
                    :null}                   
                </div>
                {!render4scroll?
                <div className="atributos">
                    {!compactar?
                        relPre.atributos.map((relAtr, index)=>
                            <AtributosRow key={relPre.producto+'/'+relPre.observacion+'/'+relAtr.atributo}
                                relPre={relPre}
                                iRelPre={props.iRelPre}
                                relAtr={relAtr}
                                inputId={inputIdAtributos[index]}
                                inputIdPrecio={inputIdPrecio}
                                idProximoAtributo={index<relPre.atributos.length-1?inputIdAtributos[index+1]:null}
                                idProximoPrecio={props.inputIdProximo}
                                primerAtributo={index==0}
                                cantidadAtributos={relPre.atributos.length}
                                ultimoAtributo={index == relPre.atributos.length-1}
                                onSelection={()=>handleSelection(relPre,hasSearchString,allForms, inputIdAtributos[index])}
                                razonPositiva={props.razonPositiva}
                            />
                        )
                    :null}
                </div>
                :null}
            </div>
        </div>
    );
}, areEqual)

function DetalleFiltroObservaciones(_props:{}){
    const {queVer} = useSelector((hdr:HojaDeRuta)=>hdr.opciones);
    return <>
        {queVer == 'pendientes'? <Typography variant="h5" className="titulo-pendientes">mostrando observaciones pendientes <ICON.CheckBoxOutlineBlankOutlined /> </Typography>:(
            queVer == 'advertencias'? <Typography variant="h5" className="titulo-advertencias">mostrando observaciones con advertencias <ICON.Warning /> </Typography>:(
                null
            )
        )}
    </>
}
const IndexedPreciosRow = /*React.memo*/(({ data, index, isScrolling, style }: {data: any, index:number, isScrolling:boolean, style:Styles}) => {
    var {items, observaciones, idActual, razonPositiva, allForms, searchString, compactar} = data;
    var item = items[index];
    var iRelPre = item.iRelPre;
    var relPre = observaciones[iRelPre];
    var inputIdPrecio = relPre.producto+'-'+relPre.observacion;
    var relPreProx = index<items.length-1 ? observaciones[items[index+1].iRelPre] : null;  
    var inputIdProximo = relPreProx != null ? relPreProx.producto+'-'+relPreProx.observacion : null;
    return <PreciosRow 
        style={style}
        key={relPre.producto+'/'+relPre.observacion}
        relPre={relPre}
        iRelPre={Number(iRelPre)}
        hasSearchString={!!searchString}
        isScrolling={isScrolling}
        allForms={allForms}
        inputIdPrecio={inputIdPrecio}
        inputIdProximo={inputIdProximo}
        esPrecioActual={!!idActual && idActual.startsWith(inputIdPrecio)}
        razonPositiva={razonPositiva}
        compactar={compactar}
    />
}/*,areEqual*/);

type Style4Render = {top:number, left:number, height:number, width:string, position:'fixed'|'relative'|'absolute'};

function VariableSizeList(props:{
    width:number|string, 
    height:number,
    itemCount:number, 
    itemSize:(i:number)=>number,
    useIsScrolling:boolean,
    itemData:any,
    children:(props:{data: any, index:number, isScrolling:boolean, style:Style4Render}) => JSX.Element
}){
    var rowFun=props.children;
    var heightSum=0;
    var lista:{style:Style4Render, isScrolling:boolean}[] = new Array(props.itemCount).fill(true).map((_, i:number)=>{
        var height = props.itemSize(i);
        var top = heightSum;
        heightSum+=height;
        return {
            style:{
                top,
                left:0,
                height,
                width:'100%',
                position:'absolute',
            },
            isScrolling:heightSum-window.scrollY>1500 || top+height<window.scrollY
        }
    });
    var [ultimoTop, setUltimoTop]=useState(-99999);
    var calculateList=function(){
        if(ultimoTop!=window.scrollY){
            setUltimoTop(window.scrollY);
            lista = lista.map(nodo=>({...nodo, isScrolling: nodo.isScrolling && (nodo.style.top-window.scrollY>1500 || nodo.style.top+nodo.style.height<window.scrollY)}));
        }
    };
    useEffect(function(){
        var interval=setInterval(calculateList,1000);
        return function(){
            clearInterval(interval);
        }
    })
    return <div style={{height:heightSum, width:props.width, position:'relative', top:0, left:0}} >
        {lista.length?lista.map(function(node, i){
            var x=rowFun({data:props.itemData, index:i, isScrolling:node.isScrolling, style:node.style});
            return x;
            // return rowFun({data:props.itemData, index:i, isScrolling:node.isScrolling, style:node.style});
        }):<div>cargando</div>}
    </div>
}

// function isNotNull<T>(value:T): T is not null{
//     return value != null;
// }

function RelevamientoPrecios(props:{
    relVis:RelVis,
    observaciones: RelPre[]
    razonPositiva:boolean,
    compactar: boolean,
}){
    const {queVer, searchString, allForms, idActual, observacionesFiltradasIdx, observacionesFiltradasEnOtrosIdx} = useSelector((hdr:HojaDeRuta)=>hdr.opciones);
    const dispatch = useDispatch();
    var cantidadResultados = observacionesFiltradasIdx.length;
    const getItemSize = (index:number) => {
        var iRelPre = observacionesFiltradasIdx[index].iRelPre;
        var relPre = props.observaciones[iRelPre];
        return props.compactar?
            50 + 25 * Math.floor(estructura.productos[relPre.producto].nombreproducto.length / 19)
        :
            50+Math.max(
                relPre.atributos.reduce(
                    (acum,relAtr)=>Math.ceil((Math.max(
                        (relAtr.valoranterior||'').toString().length,
                        (relAtr.valor||'').toString().length,
                        (estructura.atributos[relAtr.atributo].nombreatributo?.length*8/16)
                    )+1)/8)*40+acum,0
                ), 
                estructura.productos[relPre.producto].especificacioncompleta?.length*1.5
            );
    } 
       
    const createItemData = memoize(
        (
            items: {iRelPre: number}[], 
            observaciones:RelPre[], 
            idActual: string|null, 
            razonPositiva:boolean, 
            allForms: boolean, 
            searchString: string, 
            compactar: boolean
        ) =>     
        ({
            items,
            observaciones,
            idActual,
            razonPositiva,
            allForms,
            searchString,
            compactar
        })
    );
    const itemData = createItemData(observacionesFiltradasIdx, props.observaciones, idActual, props.razonPositiva, allForms, searchString, props.compactar);
    
    return <div className="informante-visita">
        {cantidadResultados?
            <VariableSizeList
                useIsScrolling 
                height={900}
                itemCount={observacionesFiltradasIdx.length}
                itemData={itemData}
                itemSize={getItemSize}
                width={"100%"}
            >
                {IndexedPreciosRow}
            </VariableSizeList>
        :(observacionesFiltradasEnOtrosIdx.length==0?
            <div>No hay</div>
        :null)
        }
        {
            observacionesFiltradasEnOtrosIdx.length>0?
                <div className="zona-degrade">
                    <Button className="boton-hay-mas" variant="outlined"
                        onClick={()=>{
                            dispatch(dispatchers.SET_QUE_VER({queVer, informante: props.relVis.informante, formulario: props.relVis.formulario, allForms: true, searchString, compactar: props.compactar}));
                        }}
                    >ver más {queVer} en otros formularios</Button>
                    {observacionesFiltradasEnOtrosIdx.map(({iRelPre}, i) => {
                        var relPre = props.observaciones[iRelPre];
                        return i<10?
                        <Typography 
                            key={relPre.producto+'/'+relPre.observacion}
                        >
                            {estructura.productos[relPre.producto].nombreproducto} {relPre.observacion>1?relPre.observacion.toString():''}
                        </Typography>:null
                    })}
                </div>
            :
            <div className="zona-degrade">
                <Typography>Hay más observaciones en otros formularios</Typography>
            </div>
        }
    </div>;
}

function RazonFormulario(props:{relVis:RelVis, relInf:RelInf}){
    const relVis = props.relVis;
    const razones = estructura.razones;
    const {verRazon} = useSelector((hdr:HojaDeRuta)=>hdr.opciones);
    const [menuRazon, setMenuRazon] = useState<HTMLElement|null>(null);
    const [razonAConfirmar, setRazonAConfirmar] = useState<{razon:number|null}>({razon:null});
    const [menuConfirmarRazon, setMenuConfirmarRazon] = useState<boolean>(false);
    var cantObsConPrecio = props.relInf.observaciones.filter((relPre:RelPre)=>relPre.formulario == relVis.formulario && !!relPre.precio).length;
    const [confirmarCantObs, setConfirmarCantObs] = useState(null);
    const dispatch = useDispatch();
    const classes = useStylesList();
    const onChangeFun = function <TE extends React.ChangeEvent>(event:TE){
        //@ts-ignore en este caso sabemos que etarget es un Element que tiene value.
        var valor = event.target.value;
        setConfirmarCantObs(valor);
    }
    return (
        verRazon?
        <div className="razon-formulario">
            <div>
                <Button onClick={event=>setMenuRazon(event.currentTarget)} 
                color={relVis.razon && !estructura.razones[relVis.razon].espositivoformulario?"secondary":"primary"} variant="outlined">
                    {relVis.razon}
                </Button>
            </div>
            <div>{relVis.razon?razones[relVis.razon].nombrerazon:null}</div>
            <EditableTd
                hasError={false}
                placeholder="sin comentarios"
                disabled={false}
                className="comentarios-razon"
                dataType={"text"}
                value={relVis.comentarios}
                inputId={relVis.informante+'f'+relVis.formulario}
                onUpdate={value=>{
                    dispatch(dispatchers.SET_COMENTARIO_RAZON({forPk:relVis, comentarios:value}));
                }}
            />
            <Menu id="simple-menu-razon" open={Boolean(menuRazon)} anchorEl={menuRazon} onClose={()=>setMenuRazon(null)}>
                {likeAr(estructura.razones).map((razon:Razon,index)=>{
                    var color=estructura.razones[index].espositivoformulario?PRIMARY_COLOR:SECONDARY_COLOR;
                    return(
                    <MenuItem key={razon.nombrerazon} onClick={()=>{
                        if(razonNecesitaConfirmacion(estructura, relVis,index)){
                            setRazonAConfirmar({razon:index});
                            setMenuConfirmarRazon(true)
                        }else{
                            dispatch(dispatchers.SET_RAZON({forPk:relVis, razon:index}));
                        }
                        setMenuRazon(null)
                    }}>
                        <ListItemText classes={{primary: classes.listItemText}} style={{color:color, maxWidth:'30px'}}>&nbsp;{index}</ListItemText>
                        <ListItemText classes={{primary: classes.listItemText}} style={{color:color}}>&nbsp;{razon.nombrerazon}</ListItemText>
                    </MenuItem>
                    )}
                ).array()}
            </Menu>
            <Dialog
                open={menuConfirmarRazon}
                onClose={()=>setMenuConfirmarRazon(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title-rn">{`Confirmación de razón negativa para formulario ${relVis.formulario}`}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description-rn">
                        <div>
                            Eligió la razón de no contacto {razonAConfirmar.razon?`${razonAConfirmar.razon} ${estructura.razones[razonAConfirmar.razon].nombrerazon}`:''}. 
                            Se {cantObsConPrecio==1?'borrará un precio':`borrarán ${cantObsConPrecio} precios`} ingresados.
                        </div>
                        <div>
                            Confirme la acción ingresando la cantidad de precios que se van a borrar: 
                        </div>
                        <TextField
                            value={confirmarCantObs}
                            onChange={onChangeFun}
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>{
                        setMenuConfirmarRazon(false)
                    }} color="primary" variant="outlined">
                        No borrar
                    </Button>
                    <Button disabled={confirmarCantObs!=cantObsConPrecio} onClick={()=>{
                        dispatch(dispatchers.SET_RAZON({forPk:relVis, razon:razonAConfirmar.razon}));
                        setMenuConfirmarRazon(false)
                    }} color="secondary" variant="outlined">
                        Proceder borrando
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
        :null
    );
}

const drawerWidth = 300;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: 36,
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: (props:{open:boolean}) => props.open?'normal':'nowrap',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9) + 1,
      },
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
    },
    content: {
      flexGrow: 1,
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
      },
    },
    searchIcon: {
      width: theme.spacing(7),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create('width'),
      width: 150,
    }
  }),
);

function FormularioVisita(props:{relVisPk: RelVisPk}){
    const {queVer, searchString, compactar, /*posFormularios, */ allForms, idActual} = useSelector((hdr:HojaDeRuta)=>hdr.opciones);
    /*useEffect(() => {
        const pos = posFormularios.find((postision)=>postision.formulario==props.relVisPk.formulario);
        const prevScrollY = pos?pos.position:0;
        function registrarPosicionIntraformulario(){
            if(prevScrollY != window.scrollY){
                dispatch(dispatchers.SET_FORM_POSITION({formulario:props.relVisPk.formulario,position:window.scrollY}))
            }
        }
        if(queVer=='todos' && !compactar && !searchString && !allForms){
            window.scrollTo(0, prevScrollY);
            var interval = setInterval(registrarPosicionIntraformulario, 1000);            
            return function(){
                clearInterval(interval);
            }
        }else{
            window.scrollTo(0, 0);
            return function(){}
        }

    },[props.relVisPk, posFormularios, compactar, queVer, searchString]);
    */
    useEffect(() => {
        if(idActual){
            focusToId(idActual, {moveToElement:true});
        }
    }, [idActual]);
    const dispatch = useDispatch();
    const hdr = useSelector((hdr:HojaDeRuta)=>hdr);
    const relInf = hdr.informantes.find(relInf=>relInf.informante==props.relVisPk.informante)!;
    const relVis = relInf.formularios.find(relVis=>relVis.formulario==props.relVisPk.formulario)!;
    const formularios = hdr.informantes.find(relInf=>relInf.informante==props.relVisPk.informante)!.formularios;
    const [open, setOpen] = React.useState<boolean>(false);
    const classes = useStyles({open:open});
    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerToggle = () => {
        setOpen(!open);
    };
    const toolbarStyle=hdrEstaDescargada()?{backgroundColor:'red'}:{};
    return (
        <div id="formulario-visita" className="menu-informante-visita" es-positivo={relVis.razon && estructura.razones[relVis.razon].espositivoformulario?'si':'no'}>
            <div className={classes.root}>
                <AppBar
                    position="fixed"
                    className={clsx(classes.appBar, {
                        [classes.appBarShift]: open,
                    })}
                >
                    <Toolbar style={toolbarStyle}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            className={clsx(classes.menuButton, {
                                [classes.hide]: open,
                            })}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="subtitle1" noWrap>
                            {`inf ${props.relVisPk.informante}`}
                        </Typography>
                        <Grid item>
                            <ButtonGroup
                                variant="contained"
                                color="default"
                                aria-label="large contained default button group"
                                style={{margin:'0 5px'}}
                            >
                                <Button onClick={()=>{
                                    dispatch(dispatchers.SET_OPCION({variable:'compactar',valor:!compactar}))
                                }}>
                                    <ICON.FormatLineSpacing />
                                </Button>
                            </ButtonGroup>
                            <ButtonGroup
                                variant="contained"
                                color="default"
                                aria-label="large contained default button group"
                            >
                                <Button onClick={()=>{
                                    dispatch(dispatchers.SET_QUE_VER({queVer:'todos', informante: relVis.informante, formulario: relVis.formulario, allForms, searchString, compactar}));
                                }} className={queVer=='todos'?'boton-seleccionado-todos':'boton-selecionable'}>
                                    <ICON.CheckBoxOutlined />
                                </Button>
                                <Button onClick={()=>{
                                    dispatch(dispatchers.SET_QUE_VER({queVer:'pendientes', informante: relVis.informante, formulario: relVis.formulario, allForms, searchString, compactar}));
                                }} className={queVer=='pendientes'?'boton-seleccionado-pendientes':'boton-selecionable'}>
                                    <ICON.CheckBoxOutlineBlankOutlined />
                                </Button>
                                <Button onClick={()=>{
                                    dispatch(dispatchers.SET_QUE_VER({queVer:'advertencias', informante: relVis.informante, formulario: relVis.formulario, allForms, searchString, compactar}));
                                }} className={queVer=='advertencias'?'boton-seleccionado-advertencias':'boton-selecionable'}>
                                    <ICON.Warning />
                                </Button>
                            </ButtonGroup>
                        </Grid>
                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                <SearchIcon />
                            </div>
                            <InputBase 
                                id="search" 
                                placeholder="Buscar..." 
                                value={searchString} 
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                                inputProps={{ 'aria-label': 'search' }}
                                onChange={(event)=>{
                                    dispatch(dispatchers.SET_QUE_VER({allForms, queVer, searchString:event.target.value, informante: relVis.informante, formulario:relVis.formulario, compactar}))
                                    window.scroll({behavior:'auto', top:0, left:0})
                                }}
                            />
                            {searchString?
                                <IconButton 
                                    size="small" 
                                    style={{color:'#ffffff'}} 
                                    onClick={()=>{
                                        dispatch(dispatchers.SET_QUE_VER({allForms, queVer, searchString:'', informante: relVis.informante, formulario:relVis.formulario, compactar}))
                                        window.scroll({behavior:'auto', top:0, left:0})
                                    }}
                                >
                                    <ClearIcon />
                                </IconButton>
                            :null}
                        </div>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    className={clsx(classes.drawer, {
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    })}
                    classes={{
                        paper: clsx({
                            [classes.drawerOpen]: open,
                            [classes.drawerClose]: !open,
                        }),
                    }}
                    open={open}
                >
                    <div className={classes.toolbar}>
                        <IconButton onClick={handleDrawerToggle}><MenuIcon /></IconButton>
                    </div>
                    <List>
                        <ListItem button className="flecha-volver-hdr" onClick={()=>
                            dispatch(dispatchers.UNSET_FORMULARIO_ACTUAL({}))
                        }>
                            <ListItemIcon><DescriptionIcon/></ListItemIcon>
                            <ListItemText primary="Volver a hoja de ruta" />
                        </ListItem>
                        {formularios.map((relVis:RelVis) => (
                            <ListItem button key={relVis.formulario} selected={relVis.formulario==props.relVisPk.formulario && !allForms} onClick={()=>{
                                setOpen(false);
                                dispatch(dispatchers.SET_FORMULARIO_ACTUAL({informante:relVis.informante, formulario:relVis.formulario}));
                            }}>
                                <ListItemIcon>{numberElement(relVis.formulario)}</ListItemIcon>
                                <ListItemText primary={estructura.formularios[relVis.formulario].nombreformulario} />
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <main className={classes.content}>
                    <DetalleFiltroObservaciones></DetalleFiltroObservaciones>
                    <RazonFormulario relVis={relVis} relInf={relInf}/>
                    <RelevamientoPrecios 
                        relVis={relVis}
                        observaciones={relInf.observaciones}
                        razonPositiva={!!relVis.razon && estructura.razones[relVis.razon].espositivoformulario}
                        compactar={compactar}
                    />
                </main>
                <ScrollTop>
                    <Fab color="secondary" size="small" aria-label="scroll back to top">
                        <KeyboardArrowUpIcon />
                    </Fab>
                </ScrollTop>
            </div>
        </div>
    );
}

const useStylesBadge = makeStyles((theme: Theme) =>
  createStyles({
    margin: {
      margin: theme.spacing(0),
    },
    padding: {
      padding: theme.spacing(0, 2),
    },
    // @ts-ignore TODO: mejorar tipos STYLE #48
    badge: {
      backgroundColor: (props:{backgroundColor:string}) => props.backgroundColor?props.backgroundColor:'unset',
      color: (props:{color:string}) => props.color?props.color:'white',
      top: (props:{top:number}) => props.top?props.top:0,
      right: (props:{right:number}) => props.right?props.right:0,
      zIndex: (props:{zIndex:number}) => props.zIndex?props.zIndex:0,
    }
  }),
);

const ConditionalWrapper = ({condition, wrapper, children}:{ condition:boolean, wrapper:(elements:JSX.Element)=>JSX.Element, children:JSX.Element }) => 
  condition ? wrapper(children) : children;

function FormulariosCols(props:{informante:RelInf, relVis:RelVis}){
    const opciones = useSelector((hdr:HojaDeRuta)=>(hdr.opciones));
    const classesErrores = useStylesBadge({backgroundColor: COLOR_ERRORES});
    const classesAdvertencia = useStylesBadge({backgroundColor: COLOR_ADVERTENCIAS});
    const classesPendientes = useStylesBadge({backgroundColor: COLOR_PENDIENTES});
    const dispatch = useDispatch();
    const {mostrarColumnasFaltantesYAdvertencias} = useSelector((hdr:HojaDeRuta)=>(hdr.opciones));
    const informante = props.informante;
    const relVis = props.relVis;
    var misObservaciones = informante.observaciones.filter((relPre:RelPre)=>relPre.formulario == relVis.formulario);
    var cantPendientes = misObservaciones.filter((relPre:RelPre)=>precioEstaPendiente(relPre, relVis, estructura)).length;
    var cantAdvertencias = misObservaciones.filter((relPre:RelPre)=>precioTieneAdvertencia(relPre, relVis, estructura)).length;
    var cantErrores = misObservaciones.filter((relPre:RelPre)=>precioTieneError(relPre, relVis, estructura)).length;
    var todoListo = cantAdvertencias == 0 && cantPendientes == 0 && !opciones.mostrarColumnasFaltantesYAdvertencias && relVis.razon
    var numbersStyles : {textAlign:'right', paddingRight:string} = {
        textAlign: 'right',
        paddingRight: '15px'
    }
    var theClass=cantErrores ? classesErrores : (cantAdvertencias ? classesAdvertencia : classesPendientes);
    var conBadge=cantErrores || cantAdvertencias || (cantPendientes < misObservaciones.length?cantPendientes:null)
    return(
        <>
            <TableCell>
                <ConditionalWrapper
                    condition={!mostrarColumnasFaltantesYAdvertencias}
                    wrapper={children => 
                        <Badge style={{width:"calc(100% - 5px)"}} 
                            badgeContent={conBadge} 
                            classes={{
                                // @ts-ignore TODO: mejorar tipos STYLE #48
                                badge: theClass.badge
                            }} 
                            className={
                                // @ts-ignore TODO: mejorar tipos STYLE #48
                                theClass.margin
                            }>{children}
                        </Badge>
                    }
                >
                    <Button style={{width:'100%', backgroundColor: todoListo?"#5CB85C":"none", color: todoListo?"#ffffff":"none"}} size="large" variant="outlined" color="primary" 
                        className={"boton-ir-formulario"}
                        onClick={()=>{
                            dispatch(dispatchers.SET_FORMULARIO_ACTUAL({informante:relVis.informante, formulario:relVis.formulario}));
                        }
                    }>
                        <span>{relVis.formulario} {estructura.formularios[relVis.formulario].nombreformulario} </span>
                        <span className="special-right">{relVis.razon && !estructura.razones[relVis.razon].espositivoformulario ? <ICON.RemoveShoppingCart /> : (
                            !cantPendientes && !!relVis.razon?CHECK:null
                        )}</span>
                    </Button>
                </ConditionalWrapper>
            </TableCell>
            {mostrarColumnasFaltantesYAdvertencias?<TableCell style={numbersStyles}>{numberElement(misObservaciones.length)}</TableCell>:null}
            {mostrarColumnasFaltantesYAdvertencias?<TableCell style={{...numbersStyles, backgroundColor:cantPendientes?'#DDAAAA':'#AADDAA'}}>{cantPendientes?numberElement(cantPendientes):CHECK}</TableCell>:null}
            {mostrarColumnasFaltantesYAdvertencias?<TableCell style={{...numbersStyles, backgroundColor:cantAdvertencias?COLOR_ADVERTENCIAS:'none'}}>{cantAdvertencias?numberElement(cantAdvertencias):'-'}</TableCell>:null}
        </>
    )
}

function InformanteRow(props:{informante:RelInf}){
    const opciones = useSelector((hdr:HojaDeRuta)=>(hdr.opciones));
    const informante = props.informante;
    const contacto = estructura.informantes[informante.informante].contacto;
    const telcontacto = estructura.informantes[informante.informante].telcontacto;
    const web = estructura.informantes[informante.informante].web;
    const email = estructura.informantes[informante.informante].email;
    return (
        <>
            {informante.formularios.map((relVis:RelVis, index:number)=>{
                return (
                    <>
                        <TableRow key={relVis.informante+'/'+relVis.formulario} style={{
                            verticalAlign:'top',
                            borderTop:opciones.letraGrandeFormulario?"2px solid":"none"
                        }}>
                            {index==0?
                                <TableCell 
                                    rowSpan={opciones.letraGrandeFormulario?1:informante.formularios.length}
                                    colSpan={opciones.letraGrandeFormulario?4:1}
                                >
                                    <div>{informante.informante} {informante.nombreinformante} 
                                        <span className="periodos-sin-informacion"> {informante.cantidad_periodos_sin_informacion>1?`(${informante.cantidad_periodos_sin_informacion})`:''}</span>
                                    </div>
                                    <div className='direccion-informante'>{estructura.informantes[informante.informante].direccion}</div>
                                    {contacto?<div className='contacto-informante'>{contacto}</div>:null}
                                    {telcontacto?<div className='telcontacto-informante'>{telcontacto}</div>:null}
                                    {web?<div className='web-informante'><a href={(web.startsWith('http') || web.startsWith('https')?"":"//")+web} target="_blank">{web}</a></div>:null}
                                    {email?<div className='email-informante'>{email}</div>:null}
                                </TableCell>
                            :null}
                            {opciones.letraGrandeFormulario?null:
                                <FormulariosCols informante={props.informante} relVis={relVis}/>
                            }
                        </TableRow>
                        {opciones.letraGrandeFormulario?
                            <TableRow key={relVis.informante+'/'+relVis.formulario+'_letra_grande'}>
                                <FormulariosCols informante={props.informante} relVis={relVis}/>
                            </TableRow>
                        :null}
                    </>
                )
            })}
        </>
    )
}

const useStylesTable = makeStyles({
    root: {
      width: '100%',
      overflowX: 'auto',
    },
    table: {
      minWidth: 650,
    },
  });

const useStylesButton = makeStyles({
    toolbarButtons: {
      marginLeft: 'auto',
    },
});

function PantallaHojaDeRuta(_props:{}){
    useEffect(() => {
        window.scrollTo(0, posHdr)
        return function(){
            if(posHdr != window.scrollY){
                dispatch(dispatchers.SET_OPCION({variable:'posHdr',valor:window.scrollY}))
            }
        }
    });
    const hdr = useSelector((hdr:HojaDeRuta)=>(hdr));
    const {informantes, panel, tarea, encuestador, nombreencuestador, apellidoencuestador} = useSelector((hdr:HojaDeRuta)=>(hdr));
    const {letraGrandeFormulario, mostrarColumnasFaltantesYAdvertencias, posHdr, customDataMode} = useSelector((hdr:HojaDeRuta)=>(hdr.opciones));
    const classes = useStylesTable();
    const classesButton = useStylesButton();
    const dispatch = useDispatch();
    const appVersion = getCacheVersion();
    const stylesTableHeader = {fontSize: "1.3rem"}
    const updateOnlineStatus = function(){
        setOnline(window.navigator.onLine);
    }
    const [online, setOnline] = useState(window.navigator.onLine);
    const [mensajeDescarga, setMensajeDescarga] = useState<string|null>(null);
    const [descargaCompleta, setDescargaCompleta] = useState<boolean|null>(false);
    const [descargando, setDescargando] = useState<boolean|null>(false);
    window.addEventListener('online',  updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    const toolbarStyle=hdrEstaDescargada()?{backgroundColor:'red'}:{};
    return (
        <>
            <AppBar position="fixed">
                <Toolbar style={toolbarStyle} >
                    <Typography variant="h6">
                        Hoja de ruta - {appVersion}
                    </Typography>
                    <div className={classesButton.toolbarButtons}>
                        <Button style={{marginTop:'3px'}}
                            color="inherit"
                            onClick={()=>
                                dispatch(dispatchers.SET_OPCION({variable:'pantallaOpciones',valor:true}))
                            }
                        >
                            <SettingsIcon/>
                        </Button>
                        {online?
                            customDataMode?
                                <>
                                    {isDirtyHDR()?
                                        <>
                                            <Button
                                                color="inherit"
                                                onClick={async ()=>{
                                                    setMensajeDescarga('descargando, por favor espere...');
                                                    setDescargando(true);
                                                    var message = await devolverHojaDeRuta(hdr);
                                                    setDescargando(false);
                                                    if(message=='descarga completa'){
                                                        setDescargaCompleta(true);
                                                        await borrarDatosRelevamientoLocalStorage();
                                                        message+=', redirigiendo a grilla de relevamiento...';
                                                        setTimeout(function(){
                                                            location.reload();       
                                                        }, 3000)
                                                    }
                                                    setMensajeDescarga(message)
                                                }}
                                            >
                                                <SaveIcon/>
                                            </Button>
                                        </>
                                    :
                                        <Button
                                            color="inherit"
                                            onClick={async ()=>{
                                                var message = await borrarDatosRelevamientoLocalStorage();
                                                if(message == 'ok'){
                                                    location.reload();   
                                                }else{
                                                    setMensajeDescarga(message)
                                                }
                                            }}
                                        >
                                            <ExitToAppIcon/>
                                        </Button>
                                    }
                                    <Dialog
                                        open={!!mensajeDescarga}
                                        //hace que no se cierre el mensaje
                                        onClose={()=>setMensajeDescarga(mensajeDescarga)}
                                        aria-labelledby="alert-dialog-title"
                                        aria-describedby="alert-dialog-description"
                                    >
                                        <DialogTitle id="alert-dialog-title">Información de descarga</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText id="alert-dialog-description">
                                                {mensajeDescarga}{descargando?<CircularProgress />:null}
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            {descargando?
                                                null
                                            :
                                                <Button 
                                                    onClick={()=>{
                                                        if(descargaCompleta){
                                                            location.reload()
                                                        }else{
                                                            setMensajeDescarga(null)
                                                        }
                                                    }} 
                                                    color="primary" 
                                                    variant="contained"
                                                >
                                                    Cerrar
                                                </Button>
                                            }
                                        </DialogActions>
                                    </Dialog>
                                </>
                            :
                                <Button
                                    color="inherit"
                                    onClick={()=>{
                                        history.replaceState(null, '', `${location.origin+location.pathname}/../menu`);
                                        location.reload();   
                                    }}
                                >
                                    <ExitToAppIcon/>
                                </Button>
                        :null}
                    </div>
                </Toolbar>
            </AppBar>
            <main>
                <Paper className={classes.root}>
                    <Typography component="p" style={{fontSize:"1.2rem", fontWeight:600, padding: "5px 10px"}}>
                        Panel: {panel} Tarea: {tarea} Encuestador/a: {apellidoencuestador}, {nombreencuestador} ({encuestador})
                    </Typography>
                    <Table className="hoja-ruta" style={{borderTopStyle: "groove"}}>
                        <colgroup>
                            {letraGrandeFormulario?null:<col style={{width:"33%"}}/>}
                            <col style={{width:letraGrandeFormulario?"79%":"46%"}}/>
                            {mostrarColumnasFaltantesYAdvertencias?<col style={{width:"7%"}}/>:null}
                            {mostrarColumnasFaltantesYAdvertencias?<col style={{width:"7%"}}/>:null}
                            {mostrarColumnasFaltantesYAdvertencias?<col style={{width:"7%"}}/>:null}
                        </colgroup>      
                        <TableHead style={{fontSize: "1.2rem"}}>
                            <TableRow className="hdr-tr-informante">
                                {letraGrandeFormulario || !mostrarColumnasFaltantesYAdvertencias?null:<TableCell style={stylesTableHeader}>informante</TableCell>}
                                {mostrarColumnasFaltantesYAdvertencias?<TableCell style={stylesTableHeader}>formulario</TableCell>:null}
                                {mostrarColumnasFaltantesYAdvertencias?<TableCell style={stylesTableHeader}>prod</TableCell>:null}
                                {mostrarColumnasFaltantesYAdvertencias?<TableCell style={stylesTableHeader}>faltan</TableCell>:null}
                                {mostrarColumnasFaltantesYAdvertencias?<TableCell style={stylesTableHeader}>adv</TableCell>:null}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {informantes.map((informante:RelInf)=>
                                <InformanteRow key={informante.informante} informante={informante}/>
                            )}
                        </TableBody>
                    </Table>
                </Paper>
            </main>
        </>
    );
}

function PantallaOpciones(){
    const {letraGrandeFormulario, mostrarColumnasFaltantesYAdvertencias, customDataMode} = useSelector((hdr:HojaDeRuta)=>hdr.opciones)
    const dispatch = useDispatch();
    const [mensajeBorrar, setMensajeBorrar] = useState<string|null>(null);
    const [habilitarBorrar, setHabilitarBorrar] = useState<boolean>(false);
    const [online, setOnline] = useState(window.navigator.onLine);
    const updateOnlineStatus = function(){
        setOnline(window.navigator.onLine);
    }
    window.addEventListener('online',  updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    const FRASE_BORRADO = "no guardar";
    return (
        <>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={()=>
                            dispatch(dispatchers.SET_OPCION({variable:'pantallaOpciones',valor:false}))
                        }
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography variant="h6">Opciones del dispositivo móvil</Typography>
                </Toolbar>
            </AppBar>
            <main>
                <Typography>
                    <Grid component="span">Letra en formulario:</Grid>
                    <Grid component="label" container alignItems="center" spacing={1}>
                        <Grid item>chica</Grid>
                        <Grid item>
                            <Switch
                                checked={letraGrandeFormulario}
                                onChange={(event)=>{
                                    dispatch(dispatchers.SET_OPCION({variable:'letraGrandeFormulario',valor:event.target.checked}));
                                    document.documentElement.setAttribute('pos-productos',event.target.checked?'arriba':'izquierda');
                                }}
                                value="letraGrandeEnFormulario"
                                color="primary"
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                            />
                        </Grid>
                        <Grid item>Grande</Grid>
                    </Grid>            
                </Typography>
                <Typography>
                    <Grid component="span">Mostrar advertencias en hoja de ruta</Grid>
                    <Grid component="label" container alignItems="center" spacing={1}>
                        <Grid item>no</Grid>
                        <Grid item>
                            <Switch
                                checked={mostrarColumnasFaltantesYAdvertencias}
                                onChange={(event)=>{
                                    dispatch(dispatchers.SET_OPCION({variable:'mostrarColumnasFaltantesYAdvertencias',valor:event.target.checked}));
                                }}
                                value="mostrarColumnasFaltantesYAdvertencias"
                                color="primary"
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                            />
                        </Grid>
                        <Grid item>sí</Grid>
                    </Grid>            
                </Typography>
                {online && customDataMode && isDirtyHDR()?
                    <Typography>
                        <Button
                            color="secondary"
                            variant="contained"
                            onClick={()=>{
                                setMensajeBorrar(`Si continua perderá los datos que haya ingresado en el dispositivo 
                                desde la última vez que la descargó. Los datos descargados previamente 
                                (que ya están en la base de datos) se conservan. Escriba "${FRASE_BORRADO}"`
                                )
                            }}
                        >
                            <DeleteIcon/> Descartar cambios hoja de ruta
                        </Button>
                        <Dialog
                            open={!!mensajeBorrar}
                            //hace que no se cierre el mensaje
                            onClose={()=>setMensajeBorrar(mensajeBorrar)}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">Información de descarga</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    {mensajeBorrar}
                                </DialogContentText>
                                <TextField
                                    onChange={(event)=>
                                        setHabilitarBorrar(event.target.value.toLowerCase()==FRASE_BORRADO)
                                    }
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button 
                                    onClick={()=>{
                                        setMensajeBorrar(null)
                                    }} 
                                    color="primary" 
                                    variant="outlined"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={async ()=>{
                                        setMensajeBorrar("descartando hoja de ruta...")
                                        var message = await borrarDatosRelevamientoLocalStorage();
                                        if(message == 'ok'){
                                            location.reload();   
                                        }else{
                                            setMensajeBorrar(message)
                                        }
                                    }} 
                                    color="secondary" 
                                    variant="outlined"
                                    disabled={!habilitarBorrar}
                                >
                                    No guardar
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Typography>
                :
                    null
                }
            </main>
        </>
    )
}

function AppDmIPCOk(){
    const {relVisPk, letraGrandeFormulario, pantallaOpciones/*, refreshKey*/} = useSelector((hdr:HojaDeRuta)=>hdr.opciones);
    document.documentElement.setAttribute('pos-productos', letraGrandeFormulario?'arriba':'izquierda');
    if(relVisPk == undefined){
        if(pantallaOpciones){
            return <PantallaOpciones/>
        }else{
            return <PantallaHojaDeRuta/>
        }
    }else{
        return <FormularioVisita relVisPk={relVisPk}/>
    }
}

function ReseterForm(props:{onTryAgain:()=>void}){
    const dispatch = useDispatch();
    return <>
        <Button variant="outlined"
            onClick={()=>{
                dispatch(dispatchers.RESET_OPCIONES({}));
                props.onTryAgain();
            }}
        >Volver a la hoja de ruta</Button>
    </>;
}

class DmIPCCaptureError extends React.Component<
    {},
    {hasError:boolean, error:Error|{}, info?:any}
>{
    constructor(props:any) {
        super(props);
        this.state = { hasError: false, error:{} };
    }
    componentDidCatch(error:Error, info:any){
        this.setState({ hasError: true , error, info });
    }
    render(){
        if(this.state.hasError){
            return <>
                <Typography>Hubo un problema en la programación del dipositivo móvil.</Typography>
                <ReseterForm onTryAgain={()=>
                    this.setState({ hasError: false, error:{} })
                }/>
                <Typography>Error detectado:</Typography>
                <Typography>{this.state.error instanceof Error ? this.state.error.message : 'unknown error'}</Typography>
                <Typography>{JSON.stringify(this.state.info)}</Typography>
            </>;
        }
        return this.props.children;
    }
}

function AppDmIPC(){
    return <DmIPCCaptureError>
        <CssBaseline />
        <AppDmIPCOk />
    </DmIPCCaptureError>
}

export function mostrarHdr(store:Store<HojaDeRuta, ActionHdr>, miEstructura:Estructura){
    ReactDOM.render(
        <Provider store={store}>
            <AppDmIPC/>
        </Provider>,
        document.getElementById('main_layout')
    )
}


export async function desplegarHojaDeRuta(optsHdr:OptsHdr){
    const {store, estructura} = await dmTraerDatosHdr(optsHdr);
    mostrarHdr(store, estructura);
}


export async function desplegarFormularioActual(){
    // traer los metadatos en una "estructura"
    // traer los datos de localStorage
    // verificar el main Layout
    const {store, estructura} = dmTraerDatosFormulario()
    ReactDOM.render(
        <Provider store={store}>
            <Formulario />
        </Provider>,
        document.getElementById('main_layout')
    )
}

if(typeof window !== 'undefined'){
    // @ts-ignore para hacerlo
    window.desplegarFormularioActual = desplegarFormularioActual;
    // window.desplegarHojaDeRuta = desplegarHojaDeRuta;
}