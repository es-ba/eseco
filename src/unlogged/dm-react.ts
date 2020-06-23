import { createStore } from "redux";
import { RelInf, RelVis, RelPre, HojaDeRuta, Estructura, getDefaultOptions, AddrParamsHdr, OptsHdr, QueVer } from "./dm-tipos";
import { puedeCopiarTipoPrecio, puedeCopiarAtributos, puedeCambiarPrecioYAtributos, calcularCambioAtributosEnPrecio, normalizarPrecio, controlarPrecio, getObservacionesFiltradas} from "./dm-funciones";
import { deepFreeze } from "best-globals";
import { createReducer, createDispatchers, ActionsFrom } from "redux-typed-reducer";
import * as JSON4all from "json4all";
import * as likeAr from "like-ar";

var my=myOwn;

export const LOCAL_STORAGE_STATE_NAME = 'ipc2.0-store-r1';
export const LOCAL_STORAGE_DIRTY_NAME = LOCAL_STORAGE_STATE_NAME + '_dirty';

/* REDUCERS */

type NextID = string | false;

//@ts-ignore no va a ser null porque está en la estructura del manifiesto
var estructura:Estructura = null;

var defaultAction = function defaultAction(
    hdrState:HojaDeRuta, 
    payload:{nextId:NextID}, 
){
    return deepFreeze({
        ...hdrState,
        opciones:{
            ...hdrState.opciones,
            idActual:payload.nextId==null?hdrState.opciones.idActual:(payload.nextId===false?null:payload.nextId)
        }
    })
};
const surfRelInf = (
    hdrState:HojaDeRuta, 
    payload:{forPk:{informante:number}}, 
    relInfReducer:(relInfState:RelInf)=>RelInf
)=>(
    {
        ...hdrState,
        opciones:{
            ...hdrState.opciones,
        },
        informantes:hdrState.informantes.map(
            relInf=>relInf.informante==payload.forPk.informante?
                relInfReducer(relInf)
            :relInf
        )
    }
);
const surfRelVis = (
    hdrState:HojaDeRuta, 
    payload:{forPk:{informante:number, formulario:number}}, 
    relVisReducer:(productoState:RelVis)=>RelVis
)=>(
    surfRelInf(hdrState, payload, relInf=>({
        ...relInf,
        formularios:relInf.formularios.map(
            relVis=>relVis.formulario==payload.forPk.formulario?
                relVisReducer(relVis)
            :relVis
        )
    }))
);
const surfRelPre = (
    hdrState:HojaDeRuta, 
    payload:{forPk:{informante:number, formulario:number, producto:string, observacion:number}, iRelPre:number},
    relPreReducer:(productoState:RelPre)=>RelPre
)=>{
    /*
    if(action.type=="SET_RAZON"||action.type=="SET_COMENTARIO_RAZON"){
        throw new Error("internal error action.type in surfRelPre");
    }
    */
    var reducerPlus=(relPre:RelPre)=>{
        var nuevoRelPre = relPreReducer(relPre);
        var control = controlarPrecio(nuevoRelPre, estructura!)
        return {
            ...nuevoRelPre,
            adv: control.tieneAdv,
            err: control.tieneErr
        };
    }
    return surfRelInf(hdrState, payload, relInf=>{
        var i = payload.iRelPre;
        if(i != undefined && 
            (relInf.observaciones[i].producto != payload.forPk.producto || relInf.observaciones[i].observacion != payload.forPk.observacion )
        ){
            throw new Error('iRelPre en una posición no esperada');
        }
        var nuevasObservaciones = i != undefined?[
            ...relInf.observaciones.slice(0, i),
            reducerPlus(relInf.observaciones[i]),
            ...relInf.observaciones.slice(i+1)
        ]:relInf.observaciones.map(
            relPre=>relPre.producto==payload.forPk.producto && relPre.observacion==payload.forPk.observacion?
                reducerPlus(relPre)
            :relPre
        )
        return {
            ...relInf,
            observaciones:nuevasObservaciones
        }
    })
};
var setTP = function setTP(
    hdrState:HojaDeRuta, 
    payload:{forPk:{informante:number, formulario:number, producto:string, observacion:number}, iRelPre:number},
    tipoPrecioRedux:(relPre:RelPre)=>string|null
){
    return surfRelPre(hdrState, payload, (relPre:RelPre)=>{
        var tipoPrecioNuevo = tipoPrecioRedux(relPre);
        if(tipoPrecioNuevo != relPre.tipoprecio){
            setDirty();
        }
        return {
            ...relPre,
            tipoprecio: tipoPrecioNuevo
        };
    });
}

var calcularListas=function(otrosFormulariosInformanteIdx: {[key: string]: RelVis}, observaciones: RelPre[], relVis: RelVis, allForms:boolean, searchString: string, queVer: QueVer){
    return getObservacionesFiltradas(otrosFormulariosInformanteIdx, observaciones, relVis, estructura, allForms, searchString, queVer);
}

var setDirty = () => my.setLocalVar(LOCAL_STORAGE_DIRTY_NAME, true);

var reducers={
    SET_RAZON            : (payload: {forPk:{informante:number, formulario:number}, razon:number|null}) => 
        function(state: HojaDeRuta){
            return surfRelVis(state, payload, (miRelVis:RelVis)=>{
                if(miRelVis.razon != payload.razon){
                    setDirty();
                }
                return {
                    ...miRelVis,
                    razon: payload.razon
                }
            });
        },
    SET_COMENTARIO_RAZON : (payload: {forPk:{informante:number, formulario:number}, comentarios:string|null}) => 
        function(state: HojaDeRuta){
            return surfRelVis(state, payload, (miRelVis:RelVis)=>{
                if(miRelVis.comentarios != payload.comentarios){
                    setDirty();
                }
                return {
                    ...miRelVis,
                    comentarios: payload.comentarios
                }
            });
        },
    SET_TP               : (payload: {forPk:{informante:number, formulario:number, producto:string, observacion:number}, iRelPre:number, tipoprecio:string|null}) => 
        function(state: HojaDeRuta){
            return setTP(state, payload, _ => payload.tipoprecio);
        },
    COPIAR_TP            :(payload: {forPk:{informante:number, formulario:number, producto:string, observacion:number}, iRelPre:number}) => 
        function(state: HojaDeRuta){
            return setTP(state, payload, relPre => puedeCopiarTipoPrecio(estructura!, relPre)?relPre.tipoprecioanterior:relPre.tipoprecio)
        },
    SET_PRECIO           :(payload: {forPk:{informante:number, formulario:number, producto:string, observacion:number}, iRelPre:number, precio:number|null}) => 
        function(state: HojaDeRuta){
            return surfRelPre(state, payload, (miRelPre:RelPre)=>{
                if(miRelPre.precio != payload.precio){
                    setDirty();
                }
                var puedeCambiarPrecio = puedeCambiarPrecioYAtributos(estructura!, miRelPre);
                var nuevoRelPre:RelPre = {
                    ...miRelPre,
                    precio:puedeCambiarPrecio?payload.precio:miRelPre.precio,
                    tipoprecio:puedeCambiarPrecio && !miRelPre.tipoprecio?estructura!.tipoPrecioPredeterminado.tipoprecio:miRelPre.tipoprecio
                };
                nuevoRelPre.precionormalizado = normalizarPrecio(nuevoRelPre, estructura!);
                return nuevoRelPre;
            });
        },
    SET_COMENTARIO_PRECIO:(payload: {forPk:{informante:number, formulario:number, producto:string, observacion:number}, iRelPre:number, comentario:string|null}) => 
        function(state: HojaDeRuta){
            return surfRelPre(state, payload, (miRelPre:RelPre)=>{
                if(miRelPre.comentariosrelpre != payload.comentario){
                    setDirty();
                }
                var nuevoRelPre:RelPre = {
                    ...miRelPre,
                    comentariosrelpre: payload.comentario
                };
                return nuevoRelPre;
            });
        },
    COPIAR_ATRIBUTOS     :(payload: {forPk:{informante:number, formulario:number, producto:string, observacion:number}, iRelPre:number}) => 
        function(state: HojaDeRuta){
            setDirty();
            return surfRelPre(state, payload, (relPre:RelPre)=>{
                var puedeCopiarAttrs = puedeCopiarAtributos(estructura!, relPre);
                if(!puedeCopiarAttrs){
                    return relPre
                }
                var nuevoRelPre:RelPre = {
                    ...relPre,
                    atributos:relPre.atributos.map(relAtr=>({...relAtr, valor:relAtr.valoranterior}))
                };
                nuevoRelPre.cambio = calcularCambioAtributosEnPrecio(nuevoRelPre);
                nuevoRelPre.precionormalizado = normalizarPrecio(nuevoRelPre, estructura!);
                return nuevoRelPre;
            });
        },
    COPIAR_ATRIBUTOS_VACIOS:(payload: {forPk:{informante:number, formulario:number, producto:string, observacion:number}, iRelPre:number}) => 
        function(state: HojaDeRuta){
            setDirty();
            return surfRelPre(state, payload, (relPre:RelPre)=>{
                var nuevoRelPre:RelPre = {
                    ...relPre,
                    atributos:relPre.atributos.map(relAtr=>({...relAtr, valor:relAtr.valor?relAtr.valor:relAtr.valoranterior}))
                };
                nuevoRelPre.cambio = calcularCambioAtributosEnPrecio(nuevoRelPre);
                nuevoRelPre.precionormalizado = normalizarPrecio(nuevoRelPre, estructura!);
                return nuevoRelPre;
            });
        },
    BLANQUEAR_ATRIBUTOS:(payload: {forPk:{informante:number, formulario:number, producto:string, observacion:number}, iRelPre:number}) => 
        function(state: HojaDeRuta){
            setDirty();
            return surfRelPre(state, payload, (relPre:RelPre)=>{
                var nuevoRelPre:RelPre = {
                    ...relPre,
                    atributos:relPre.atributos.map(relAtr=>({...relAtr, valor:null}))
                };
                nuevoRelPre.cambio = calcularCambioAtributosEnPrecio(nuevoRelPre);
                nuevoRelPre.precionormalizado = normalizarPrecio(nuevoRelPre, estructura!);
                return nuevoRelPre;
            });
        },
    SET_ATRIBUTO         :(payload: {forPk:{informante:number, formulario:number, producto:string, observacion:number, atributo:number}, iRelPre:number, valor:string|number|null}) => 
        function(state: HojaDeRuta){
            return surfRelPre(state, payload, (relPre:RelPre)=>{
                if(!puedeCambiarPrecioYAtributos(estructura!, relPre)){
                    return relPre;
                }
                if(relPre.atributos.find(relAtr=>relAtr.atributo==payload.forPk.atributo && relAtr.valor != payload.valor)){
                    setDirty();
                }
                var nuevoRelPre:RelPre = {
                    ...relPre,
                    atributos:relPre.atributos.map(relAtr=>relAtr.atributo==payload.forPk.atributo?
                        {...relAtr, valor:payload.valor}:
                        relAtr
                    )
                };
                nuevoRelPre.cambio=calcularCambioAtributosEnPrecio(nuevoRelPre)
                nuevoRelPre.precionormalizado = normalizarPrecio(nuevoRelPre, estructura!);
                return nuevoRelPre;
            });
        },
    SET_FOCUS            :(payload: {nextId: NextID}) => 
        function(state: HojaDeRuta){
            return defaultAction(state, payload)
        },    
    SET_ZOOMIN           :(payload: {nextId: NextID}) => 
        function(state: HojaDeRuta){
            return defaultAction(state, payload)
        },    
    UNSET_FOCUS          :(payload: {unfocusing: string}) => 
        function(state: HojaDeRuta){
            return deepFreeze({
                ...state,
                opciones:{
                    ...state.opciones,
                    idActual:state.opciones.idActual==payload.unfocusing?false:state.opciones.idActual
                }
            })
        },    
    SET_FORMULARIO_ACTUAL:(payload: {informante:number, formulario:number}) => 
        function(state: HojaDeRuta){
            var {queVer} = state.opciones;
            var searchString = '';
            var allForms = false;
            var informante = state.informantes.find((informante)=>informante.informante == payload.informante)!;
            var observaciones=informante.observaciones;
            var relVis = informante!.formularios.find((formulario)=>formulario.formulario == payload.formulario)!;
            var formulariosIdx = likeAr.createIndex(informante.formularios, 'formulario');
            var {observacionesFiltradasIdx, observacionesFiltradasEnOtrosIdx}=calcularListas(formulariosIdx, observaciones, relVis, allForms, searchString, queVer);
            return deepFreeze({
                ...state,
                opciones:{
                    ...state.opciones,
                    relVisPk:{informante:payload.informante, formulario:payload.formulario},
                    observacionesFiltradasIdx,
                    observacionesFiltradasEnOtrosIdx,
                    searchString,
                    verRazon: true,
                    allForms
                }
            })
        },
    UNSET_FORMULARIO_ACTUAL:(_payload: {}) => 
        function(state: HojaDeRuta){
            return deepFreeze({
                ...state,
                opciones:{
                    ...state.opciones,
                    relVisPk:null,
                    observacionesFiltradasIdx: [],
                    observacionesFiltradasEnOtrosIdx: [],
                }
            })
        },
    SET_OPCION:(payload: {variable:string, valor:any}) => 
        function(state: HojaDeRuta){
            return deepFreeze({
                ...state,
                opciones:{...state.opciones, [payload.variable]:payload.valor}
            })
        },
    SET_QUE_VER:(payload: {queVer:QueVer, informante: number, formulario: number, searchString:string, allForms:boolean, compactar:boolean}) => 
        function(state: HojaDeRuta){
            var {queVer, searchString, allForms, compactar} = payload;
            var informante = state.informantes.find((informante)=>informante.informante == payload.informante)!;
            var observaciones=informante.observaciones;
            var relVis = informante!.formularios.find((formulario)=>formulario.formulario == payload.formulario)!;
            var formulariosIdx = likeAr.createIndex(informante.formularios, 'formulario');
            var {observacionesFiltradasIdx, observacionesFiltradasEnOtrosIdx}=calcularListas(formulariosIdx, observaciones, relVis, allForms, searchString, queVer);
            return deepFreeze({
                ...state,
                opciones:{
                    ...state.opciones, 
                    observacionesFiltradasIdx,
                    observacionesFiltradasEnOtrosIdx,
                    queVer,
                    searchString,
                    allForms,
                    verRazon: !allForms,
                    compactar
                }
            })
        },
    SET_FORM_POSITION:(payload: {formulario:number, position:number}) => 
        function(state: HojaDeRuta){
            var posiciones:{formulario: number, position: number}[] = [
                ...state.opciones.posFormularios,
            ];
            var pos = posiciones.findIndex((position)=>position.formulario==payload.formulario);
            if(pos==-1){
                posiciones.push({...payload});
            }else{
                posiciones[pos] = {...payload};
            }
            return deepFreeze({
                ...state,
                opciones:{
                    ...state.opciones,
                    posFormularios: posiciones,
                }
            })
        },
    RESET_OPCIONES:(_payload: {}) => 
        function(state: HojaDeRuta){
            return deepFreeze({
                ...state,
                opciones: getDefaultOptions(state.opciones.customDataMode)
            })
        },
}

export type ActionHdr = ActionsFrom<typeof reducers>;
/* FIN ACCIONES */

/* NO SE USAN MÁS
function surf<T extends {}, K extends keyof T>(key:K, callback:(object:T[K])=>T[K]):((object:T)=>T){
    return (object:T)=>Object.freeze({
        ...object,
        [key]: callback(object[key])
    });
}

function surfStart<T extends {}>(object:T, callback:((object:T)=>T)):T{
    return callback(object);
}
*/

export const dispatchers = createDispatchers(reducers);

async function obtenerEstructuraFromAddrParams(addrParams:AddrParamsHdr){
    var estructura:Estructura;
    var hdr:HojaDeRuta;
    if(addrParams.periodo && addrParams.panel && addrParams.tarea){
        var content = my.getLocalVar(LOCAL_STORAGE_STATE_NAME);
        if(content){
            hdr = content;
            //@ts-ignore structFromManifest existe gracias al manifiesto
            estructura=structFromManifest;
        }else{
            throw Error('no se cargó correctamente la hoja de ruta')
        }
    }else{
        //DEMO
        var result = await my.ajax.dm2_preparar({
            //periodo: 'a2019m12', panel: 3, tarea: 6, informante: null, visita: null, demo: true
            periodo: 'a2020m01', panel: 1, tarea: 1, informante: null, visita: null, demo: true
        })
        estructura = result.estructura;
        if(result.hdr){
            hdr = result.hdr;
        }else{
            throw Error ('no hay datos para el periodo seleccionado')
        }
    }
    return {estructura, hdr}
}
export async function dmTraerDatosHdr(optsHdr:OptsHdr){
    var initialState:HojaDeRuta;
    var result;
    if(optsHdr.customData){
        result = optsHdr.customData;
    }else{
        result = await obtenerEstructuraFromAddrParams(optsHdr.addrParamsHdr || {periodo:null, panel: null, tarea:null});
    }
    initialState = result.hdr;
    estructura = result.estructura;
    /* DEFINICION CONTROLADOR */
    const hdrReducer = createReducer(reducers, initialState);
    /* FIN DEFINICION CONTROLADOR */
    /* CARGA Y GUARDADO DE STATE */
    function completarOpcionesCambiosyAdvertencias(content:HojaDeRuta){
        content.opciones = content.opciones || getDefaultOptions(!!optsHdr.customData);
        content.informantes.forEach(
            (informante:RelInf)=> informante.observaciones.forEach((observacion:RelPre)=> {
                observacion.adv = controlarPrecio(observacion, estructura).tieneAdv;
                observacion.err = controlarPrecio(observacion, estructura).tieneErr;
                observacion.cambio = calcularCambioAtributosEnPrecio(observacion);
            })
        )
    }

    function loadState():HojaDeRuta{
        var contentJson = my.getLocalVar(LOCAL_STORAGE_STATE_NAME);
        if(contentJson){
            completarOpcionesCambiosyAdvertencias(contentJson);
            return contentJson;
        }else{
            completarOpcionesCambiosyAdvertencias(initialState);
            return initialState;
        }
    }
    
    function saveState(state:HojaDeRuta){
        my.setLocalVar(LOCAL_STORAGE_STATE_NAME, state);
    }
    /* FIN CARGA Y GUARDADO DE STATE */

    /* CREACION STORE */
    const store = createStore(hdrReducer, loadState()); 
    store.subscribe(function(){
        saveState(store.getState());
    });
    /* FIN CREACION STORE */

    //HDR CON STORE CREADO
    return {store, estructura:estructura!};
   
}

export async function dmTraerDatosFormulario(optsHdr:OptsHdr){
    var initialState:FormularioData;
    /* DEFINICION CONTROLADOR */
    const hdrReducer = createReducer(reducers, initialState);
    /* FIN DEFINICION CONTROLADOR */
    /* CARGA Y GUARDADO DE STATE */
    function loadState():HojaDeRuta{
        var contentJson = my.getLocalVar(LOCAL_STORAGE_STATE_NAME);
        if(contentJson){
            return contentJson;
        }else{
            return initialState;
        }
    }
    
    function saveState(state:HojaDeRuta){
        my.setLocalVar(LOCAL_STORAGE_STATE_NAME, state);
    }
    /* FIN CARGA Y GUARDADO DE STATE */

    /* CREACION STORE */
    const store = createStore(hdrReducer, loadState()); 
    store.subscribe(function(){
        saveState(store.getState());
    });
    /* FIN CREACION STORE */

    //HDR CON STORE CREADO
    return {store, estructura:estructura!};
   
}

export function getCacheVersion(){
    return my.getLocalVar('ipc2.0-app-cache-version');
}

export function hdrEstaDescargada(){
    return my.getLocalVar('ipc2.0-descargado')||false;
}

/*RELEVAMIENTO DIRECTO*/

var redirectIfNotLogged = function redirectIfNotLogged(err:Error){
    if(err.message == my.messages.notLogged){
        setTimeout(()=>{
            history.replaceState(null, '', `${location.origin+location.pathname}/../login#i=relevamiento`);
            location.reload();   
        },1500)
        
    }
}

export async function devolverHojaDeRuta(hdr:HojaDeRuta){
    var message:string='';
    try{
        message = await my.ajax.dm2_descargar({
            token_instalacion: false,
            hoja_de_ruta: hdr,
            custom_data: true,
            current_token: my.getLocalVar(TOKEN_LOCALSTORAGE_NAME)
        });
    }catch(err){
        redirectIfNotLogged(err);
        message=err.message;
    }
    return message;
}

export const HDR_OPENED_LOCALSTORAGE_NAME = 'relevamiento_abierto';
const HDR_PERIODO_LOCALSTORAGE_NAME = 'relevamiento_periodo_abierto';
const HDR_PANEL_LOCALSTORAGE_NAME = 'relevamiento_panel_abierto';
const HDR_TAREA_LOCALSTORAGE_NAME = 'relevamiento_tarea_abierto';
const HDR_INFORMANTE_LOCALSTORAGE_NAME = 'relevamiento_informante_abierto';
export const ESTRUCTURA_LOCALSTORAGE_NAME = 'relevamiento_estructura';
export const TOKEN_LOCALSTORAGE_NAME = 'relevamiento_token';

export function registrarRelevamientoAbiertoLocalStorage(periodo: string, panel:number, tarea:number, informante:number, hdr: HojaDeRuta, estructura: Estructura, token:string){
    my.setLocalVar(HDR_OPENED_LOCALSTORAGE_NAME, true);
    my.setLocalVar(HDR_PERIODO_LOCALSTORAGE_NAME, periodo);
    my.setLocalVar(HDR_PANEL_LOCALSTORAGE_NAME, panel);
    my.setLocalVar(HDR_TAREA_LOCALSTORAGE_NAME, tarea);
    my.setLocalVar(HDR_INFORMANTE_LOCALSTORAGE_NAME, informante);
    my.setLocalVar(LOCAL_STORAGE_STATE_NAME, hdr);
    my.setLocalVar(ESTRUCTURA_LOCALSTORAGE_NAME, estructura);
    my.setLocalVar(TOKEN_LOCALSTORAGE_NAME, token);
}

export async function borrarDatosRelevamientoLocalStorage(){
    try{
        await my.ajax.dm2_relevamiento_unlock({
            token: my.getLocalVar(TOKEN_LOCALSTORAGE_NAME)
        });
        my.removeLocalVar(HDR_OPENED_LOCALSTORAGE_NAME);
        my.removeLocalVar(HDR_PERIODO_LOCALSTORAGE_NAME);
        my.removeLocalVar(HDR_PANEL_LOCALSTORAGE_NAME);
        my.removeLocalVar(HDR_TAREA_LOCALSTORAGE_NAME);
        my.removeLocalVar(HDR_INFORMANTE_LOCALSTORAGE_NAME);
        my.removeLocalVar(LOCAL_STORAGE_STATE_NAME);
        my.removeLocalVar(ESTRUCTURA_LOCALSTORAGE_NAME);
        my.removeLocalVar(LOCAL_STORAGE_DIRTY_NAME);
        my.removeLocalVar(TOKEN_LOCALSTORAGE_NAME);
        return 'ok'
    }catch(err){
        redirectIfNotLogged(err);
        return err.message;
    }
}

export function hayHdrRelevando(){
    return !!my.getLocalVar(HDR_OPENED_LOCALSTORAGE_NAME) && 
           !!my.getLocalVar(LOCAL_STORAGE_STATE_NAME) && 
           !!my.getLocalVar(ESTRUCTURA_LOCALSTORAGE_NAME);
}

export function isDirtyHDR(){
    return !!my.getLocalVar(LOCAL_STORAGE_DIRTY_NAME);
}
/* FIN RELEVAMIENTO DIRECTO*/

//PROVISORIO
export function rescatarLocalStorage(){
    var periodo:string = localStorage[HDR_PERIODO_LOCALSTORAGE_NAME];
    var panel:number = JSON4all.parse(localStorage[HDR_PANEL_LOCALSTORAGE_NAME]);
    var tarea:number = JSON4all.parse(localStorage[HDR_TAREA_LOCALSTORAGE_NAME]);
    var informante:number = JSON4all.parse(localStorage[HDR_INFORMANTE_LOCALSTORAGE_NAME]);
    var hdr:HojaDeRuta = JSON4all.parse(localStorage[LOCAL_STORAGE_STATE_NAME]);
    var estructura:Estructura = JSON4all.parse(localStorage[ESTRUCTURA_LOCALSTORAGE_NAME]);
    var token:string = localStorage[TOKEN_LOCALSTORAGE_NAME];
    registrarRelevamientoAbiertoLocalStorage(periodo, panel, tarea, informante, hdr, estructura, token);
    localStorage.removeItem(HDR_OPENED_LOCALSTORAGE_NAME);
    localStorage.removeItem(HDR_PERIODO_LOCALSTORAGE_NAME);
    localStorage.removeItem(HDR_PANEL_LOCALSTORAGE_NAME);
    localStorage.removeItem(HDR_TAREA_LOCALSTORAGE_NAME);
    localStorage.removeItem(HDR_INFORMANTE_LOCALSTORAGE_NAME);
    localStorage.removeItem(LOCAL_STORAGE_STATE_NAME);
    localStorage.removeItem(ESTRUCTURA_LOCALSTORAGE_NAME);
    localStorage.removeItem(LOCAL_STORAGE_DIRTY_NAME);
    localStorage.removeItem(TOKEN_LOCALSTORAGE_NAME);

}
//FIN PROVISORIO
