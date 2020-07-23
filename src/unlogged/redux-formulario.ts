import { createStore } from "redux";
import { CasilleroBase, CasillerosImplementados, CasoState, 
    DatosVivienda, EstadoCarga, EstructuraRowValidator, 
    FeedbackVariable, Formulario, ForPk, 
    IdCarga, IdCasillero, IdCaso, IdDestino, IdFin, IdFormulario, IdVariable, 
    ModoDespliegue, 
    Opcion, PlainForPk, Respuestas, ResumenEstado,
    TEM
} from "./tipos";
import { deepFreeze } from "best-globals";
import { createReducer, createDispatchers, ActionsFrom } from "redux-typed-reducer";
import { getRowValidator, Structure, Opcion as RowValidatorOpcion, FormStructureState } from "row-validator";
import * as JSON4all from "json4all";
import * as likeAr from "like-ar";
import * as bestGlobals from "best-globals";
import { controlarCodigoDV2 } from "./digitov";

var my=myOwn;

export const MAXCP=20;
// TODO: Generalizar
const OPERATIVO='ESECO';
var dv1 = 'dv1' as IdVariable;
var dv4 = 'dv4' as IdVariable;
var dv5 = 'dv5' as IdVariable;
var s1 = 's1' as IdVariable;
var s2 = 's2' as IdVariable;
var s3 = 's3' as IdVariable;
var d4 = 'd4' as IdVariable;
var d5c = 'd5c' as IdVariable;


const MAIN_FORM:IdFormulario='F:F1' as IdFormulario;
export const LOCAL_STORAGE_STATE_NAME ='hdr-campo-0.5';

/* REDUCERS */

var defaultActionFormulario = function defaultActionFormulario(
    formularioState:CasoState, 
){
    return deepFreeze({
        ...formularioState
    })
};
var reemplazosHabilitar:{[key:string]:string}={
    false: 'false',
    true: 'true',
    "=": '==',
    "<>": '!=',
    "&": '&&',
    "|": '||',
    "OR": '||',
    "AND": '&&',
    "or": '||',
    "and": '&&'
};

const helpersHabilitar={
    null2zero(posibleNull:any){
        if(posibleNull==null){
            return 0;
        }
        return posibleNull;
    },
    div0err(numerador:number, denominador:number, pk:string){
        if(denominador==0){
            throw new Error("Error en "+pk+" division por cero de "+numerador);
        }
        return numerador/denominador;
    }
};

type FuncionHabilitar = (valores:{[key:string]:any})=>boolean;
var funcionesHabilitar:{[key:string]:FuncionHabilitar}={
    'false': function(_valores){ return false },
    'v1 < v2': function(valores){ return valores.v1 < valores.v2 },
}

export function getFuncionHabilitar(nombreFuncionComoExpresion:string):FuncionHabilitar{
    if(!funcionesHabilitar[nombreFuncionComoExpresion]){
        var expresion = nombreFuncionComoExpresion.replace(/\u00A0/g,' ');
        var cuerpo = expresion.replace(/\b.+?\b/g, function(elToken){
            var elTokenTrimeado=elToken.trim();
            if(elTokenTrimeado in reemplazosHabilitar){
                return reemplazosHabilitar[elTokenTrimeado];
            }else if(/^\d+\.?\d*$/.test(elTokenTrimeado)){
                return elToken
            }else if(/^\W+$/.test(elTokenTrimeado)){
                return elToken
            }else if(/^\s+$/.test(elToken)){
                return elToken
            }
            console.log('elToken',elToken,elToken.codePointAt(0))
            return 'helpers.null2zero(valores.'+elToken+')';
        });
        var internalFun =  new Function('valores', 'helpers', 'return '+cuerpo);
        funcionesHabilitar[nombreFuncionComoExpresion] = function(valores){
            return internalFun(valores, helpersHabilitar);
        }
    }
    return funcionesHabilitar[nombreFuncionComoExpresion];
}

var rowValidator = getRowValidator({getFuncionHabilitar})

// TODO: GENERALIZAR
type Persona={p1:string, p2:number, p3:number, p4:number|null}

function num(num:number|string|null):number{
    //@ts-ignore la gracia es meter num cuando es string
    if(isNaN(num-0)) return 0;
    //@ts-ignore la gracia es meter num cuando es string
    return num-0;
}

function variablesCalculadas(datosVivienda: DatosVivienda):DatosVivienda{
    // TODO: GENERALIZAR
    var cp='cp' as IdVariable;
    var _personas_incompletas = '_personas_incompletas' as IdVariable
    var p9='p9' as IdVariable;
    var p11='p11' as IdVariable;
    //@ts-ignore
    var cantidadPersonasActual:number = datosVivienda.respuestas.personas?.length||0;
    //@ts-ignore
    var personasIncompletas=datosVivienda.respuestas.personas.filter(p=>!p.p1 || !p.p2 || !p.p3 || p.p3>=18 && !p.p4).length;
    /*
    if(
        (datosVivienda.respuestas[cp]||1)==cantidadPersonasActual
        && datosVivienda.respuestas[_personas_incompletas]==personasIncompletas
        && (datosVivienda.respuestas[p9]==null && datosVivienda.respuestas[p11]==null)
    ) return datosVivienda;
    */
    datosVivienda=bestGlobals.changing({respuestas:{personas:[{}]}},datosVivienda) // deepCopy
    var respuestas = datosVivienda.respuestas as unknown as {
        cp:number, personas:Persona[],
        _personas_incompletas:number, 
        _edad_maxima:number, 
        _edad_minima:number, 
        d4:number|null, d5:number|null, d5c:number|null, 
        p9:number|null, p11:number|null, p12:string|null,
        c5:string|null,
        c5ok:number|null
    };
    if(respuestas.c5==null){
        respuestas.c5ok=null;
    }else{
        respuestas.c5 = respuestas.c5.replace(/[\+\*\.# _\/,]/g,'-');
        if(!/-/.test(respuestas.c5) && respuestas.c5.length>4){
            respuestas.c5=respuestas.c5.substr(0,4)+'-'+respuestas.c5.substr(4);
        }
        respuestas.c5ok=controlarCodigoDV2(respuestas.c5)?1:2;
    }
    if(respuestas.d4==1){
        respuestas.d5c=respuestas.d5c||respuestas.d5;
        respuestas.d5=null;
    }else{
        respuestas.d5=respuestas.d5||respuestas.d5c;
        respuestas.d5c=null;
    }
    respuestas.personas.forEach(p=>{if(p.p3<18) p.p4=null});
    if(respuestas.p9==2){
        respuestas.cp=Math.max(respuestas.personas.length,respuestas.cp)+1
        respuestas.p9=null;
    }
    if(respuestas.cp>MAXCP) respuestas.cp=MAXCP;
    if(respuestas.cp<respuestas.personas.length){
        respuestas.personas=respuestas.personas.filter(p=>p.p1||p.p3);
    }
    if(respuestas.cp>respuestas.personas.length){
        while(respuestas.cp>respuestas.personas.length){
            respuestas.personas.push({} as Persona)
        }
    }
    if(respuestas.personas.length==0){
        respuestas.personas.push({} as Persona)
    }
    respuestas._personas_incompletas=respuestas.personas.filter(p=>!p.p1 || !p.p2 || !p.p3 || p.p3>=18 && !p.p4).length;
    respuestas._edad_maxima=respuestas.personas.reduce((acc,p)=>Math.max(p.p3,acc),0);
    respuestas._edad_minima=respuestas.personas.reduce((acc,p)=>Math.min(p.p3,acc),99);
    if(respuestas.p9!=1){
        respuestas.p11=null;
        respuestas.p12=null;
    }
    if(respuestas.p9==1 && !respuestas.p11 && respuestas._personas_incompletas==0){
        var sortear=likeAr(respuestas.personas).filter(p=>p.p4==1 && p.p3>=18).map((p,i)=>({p0:num(i)+1, ...p})).array();
        sortear.sort(bestGlobals.compareForOrder([{column:"p3"},{column:"p2"},{column:"p1"},{column:"p0"}]));
        var posicionSorteada=((num(datosVivienda.tem.nrocatastral)*13+num(datosVivienda.tem.piso))*17 % 3127) % sortear.length
        respuestas.p11=sortear[posicionSorteada].p0;
        respuestas.p12 = respuestas.personas[respuestas.p11-1].p1;
    }
    return datosVivienda;
}

function calcularFeedback(state: CasoState, forPk?:ForPk|null):CasoState{
    forPk = forPk || state.opciones.forPk;
    if(forPk == null){
        return state;
    }
    console.log('forPk',forPk);
    var vivienda = forPk.vivienda;
    var respuestas = state.datos.hdr[vivienda].respuestas;
    if(respuestas){
        var nuevosRows = likeAr([
            {forPk:{vivienda, formulario:'F:F1' as IdFormulario}, formulario:'F:F1' as IdFormulario, post:null},
            {forPk:{vivienda, formulario:'F:F2' as IdFormulario}, formulario:'F:F2' as IdFormulario, post:null},
            {forPk:{vivienda, formulario:'F:F3' as IdFormulario}, formulario:'F:F3' as IdFormulario, post:null},
            ...bestGlobals.serie({
                from:1, 
                //@ts-ignore existen las personas y es un array
                to:respuestas.personas?.length||0
            }).map(persona=>({forPk:{vivienda, formulario:'F:F2' as IdFormulario, persona}, formulario:'F:F2_personas' as IdFormulario, 
                post:true
            }))
        ]).build(({forPk, formulario, post})=>{
            var respuestasUnidadAnalisis;
            var respuestasVivienda=state.datos.hdr[forPk.vivienda].respuestas;
            // TODO: GENERALIZAR:
            if('persona' in forPk && forPk.persona!=null){
                // @ts-ignore exite
                respuestasUnidadAnalisis=respuestasVivienda.personas[forPk.persona-1];
            }else{
                respuestasUnidadAnalisis=respuestasVivienda;
            }
            var row=rowValidator(
                state.estructura.formularios[formulario].estructuraRowValidator, 
                respuestasUnidadAnalisis
            )
            // TODO: GENERALIZAR
            if(post){
                // @ts-ignore
                if(row.feedback.p1.estado=='actual' && (
                // @ts-ignore
                    forPk.persona==1 && respuestasVivienda.cp==null 
                // @ts-ignore
                    || forPk.persona>1 && respuestasVivienda.personas[forPk.persona-2].p1 == null
                )){
                // @ts-ignore
                    row.feedback.p1.estado='todavia_no';
                }
            }
            return {
                [toPlainForPk(forPk)]: row
            }
        })
        var resumenEstado = calcularResumenVivienda(forPk.vivienda, 
            // @ts-ignore sí, tiene los feedbacks de los formularios 
            nuevosRows,
            respuestas
        );
    }else{
        //@ts-ignore sin nuevas rows
        nuevosRows={};
        resumenEstado='vacio';
    }
    var datosVivienda = state.datos.hdr[forPk.vivienda];
    return {
        ...state,
        datos:{
            ...state.datos,
            hdr:{
                ...state.datos.hdr,
                [forPk.vivienda]:{
                    ...datosVivienda,
                    resumenEstado
                }
            }
        },
        feedbackRowValidator:{
            ...state.feedbackRowValidator,
            ...nuevosRows
        }
    }
}

function calcularResumenVivienda(
    idCaso:IdCaso, 
    feedbackRowValidator:{[formulario in PlainForPk]:FormStructureState<IdVariable,IdFin>}, 
    respuestas:Respuestas
){
    if(respuestas && (
        respuestas[dv1]==2 ||
        respuestas[dv4]==1 ||  
        respuestas[dv5]==2 ||  
        respuestas[s1]==2 ||  
        respuestas[s2]==2 ||  
        respuestas[s3]==2 ||  
        respuestas[d4]==1 && respuestas[d5c]==1
    )){
       return "no rea";
    }
    //TODO GENERALIZAR
    var feedBackVivienda = likeAr(feedbackRowValidator).filter((_row, plainPk)=>JSON.parse(plainPk).vivienda==idCaso && JSON.parse(plainPk).formulario != 'F:F2_personas').array();
    var feedBackViviendaPlain = likeAr(feedbackRowValidator).filter((_row, plainPk)=>JSON.parse(plainPk).vivienda==idCaso && JSON.parse(plainPk).formulario != 'F:F2_personas').plain();
    console.log('feedBackVivienda: ', feedBackViviendaPlain)
    var prioridades:{[key in ResumenEstado]: {prioridad:number, cantidad:number}} = {
        'no rea':{prioridad: 1, cantidad:0},
        'con problemas':{prioridad: 2, cantidad:0},
        'incompleto':{prioridad: 3, cantidad:0},
        'vacio':{prioridad: 4, cantidad:0},
        'ok':{prioridad: 5, cantidad:0}
    }
    var min = 5;
    var minResumen: ResumenEstado = 'ok';
    for(var feedback of feedBackVivienda){
        var resumen = feedback.resumen;
        prioridades[resumen].cantidad++;
        if(prioridades[resumen].prioridad<min){
            min=prioridades[resumen].prioridad;
            minResumen=resumen;
        }
        minResumen = minResumen=='vacio'&& prioridades['ok'].cantidad?'incompleto':minResumen;
    }
    return minResumen
}

var reducers={
    REGISTRAR_RESPUESTA: (payload: {forPk:ForPk, variable:IdVariable, respuesta:any}) => 
        function(state: CasoState){
            var datosViviendaRecibidos=state.datos.hdr[payload.forPk.vivienda];
            if(datosViviendaRecibidos==null){
                return state;
            }
            /////////// ESPECIALES
            var otrasRespuestasCalculadas={};
            if(payload.variable==('dv1' as IdVariable) && payload.respuesta != null 
                // @ts-ignore en esta encuesta existe
                && datosViviendaRecibidos.respuestas.dv2 == null
            ){
                // @ts-expect-error tengo que agregar toDmy en los tipos
                otrasRespuestasCalculadas={dv2: bestGlobals.date.today().toDmy()}
            }
            var respuestas = {
                ...datosViviendaRecibidos.respuestas,
                ...otrasRespuestasCalculadas,
            };
            var respuestasAModificar = respuestas;
            /// GENERALIZAR:
            if(payload.forPk.persona!=null){
                var iPersona = payload.forPk.persona-1;
                //@ts-ignore personas existe
                respuestas.personas = [
                    //@ts-ignore personas existe
                    ...respuestas.personas
                ];
                //@ts-ignore personas existe
                respuestas.personas[iPersona] = {...respuestas.personas[iPersona]}
                //@ts-ignore personas existe
                respuestasAModificar = respuestas.personas[iPersona];
                // TODO: Generalizar
                var p9 = 'p9' as IdVariable;
                respuestas[p9] = null;
            }
            respuestasAModificar[payload.variable] = payload.respuesta;
            ////////// FIN ESPECIALES
            var datosVivienda=variablesCalculadas({
                ...datosViviendaRecibidos,
                respuestas
            })
            return calcularFeedback({
                ...state,
                datos:{
                    ...state.datos,
                    hdr:{
                        ...state.datos.hdr,
                        [payload.forPk.vivienda]:datosVivienda
                    }
                }
            }, payload.forPk)
        },
    MODO_DESPLIEGUE: (payload: {modoDespliegue:ModoDespliegue}) => 
        function(state: CasoState){
            return calcularFeedback({
                ...state,
                opciones:{
                    ...state.opciones,
                    modoDespliegue:payload.modoDespliegue
                }
            })
        },
    CAMBIAR_FORMULARIO: (payload: {forPk:ForPk}) => 
        function(state: CasoState){
            return calcularFeedback({
                ...state,
                opciones:{
                    ...state.opciones,
                    forPk: payload.forPk
                }
            })
        },
    ESTADO_CARGA: (payload: {idCarga:IdCarga, estado_carga:EstadoCarga}) =>
        function(state: CasoState){
            return calcularFeedback({
                ...state,
                datos:{
                    ...state.datos,
                    cargas:{
                        ...state.datos.cargas,
                        [payload.idCarga]: {
                            ...state.datos.cargas[payload.idCarga],
                            estado_carga: payload.estado_carga
                        }
                    }
                }
            })
        },
    VOLVER_HDR: (_payload: {}) => 
        function(state: CasoState){
            return calcularFeedback({
                ...state,
                opciones:{
                    ...state.opciones,
                    forPk: null
                }
            })
        },
    SET_OPCION: (payload: {opcion:keyof CasoState['opciones'], valor:any}) => 
        function(state: CasoState){
            return calcularFeedback({
                ...state,
                opciones:{
                    ...state.opciones,
                    [payload.opcion]: payload.valor
                }
            })
        },
    RESET_OPCIONES: (_payload: {}) => 
        function(state: CasoState){
            return calcularFeedback({
                ...state,
                opciones:{
                    ...state.opciones,
                    forPk: null
                }
            })
        },
    REINICIAR_DEMO: (_payload: {}) =>
        function(state: CasoState){
            if(!state.modo.demo) return state;
            return calcularFeedback({
                ...state,
                // @ts-ignore copio los datos iniciales
                datos:bestGlobals.deepCopy(state.modo.demo)
            })
        },
}

export type ActionFormularioState = ActionsFrom<typeof reducers>;
/* FIN ACCIONES */

export const dispatchers = createDispatchers(reducers);

interface IDataSeparada<T extends {tipoc:string}> {
    data:T,
    childs:IDataSeparada<T>[]
}

type IDataConCasilleros<T> = T & {
    casilleros:readonly IDataConCasilleros<T>[]
}

const casilleroVacio={salto:null, despliegue:null, aclaracion:null, ver_id:null}

const opcionesSiNo: Opcion[] = [
    {...casilleroVacio, casillero:1, tipoc:'O', nombre:'Sí', casilleros:[]},
    {...casilleroVacio, casillero:2, tipoc:'O', nombre:'No', casilleros:[]},
]

type CaracerizacionEstadoRowValidator={
    correcto:boolean,
    conValor:boolean|null, // null = unknown
}

function aplanarLaCurva<T extends {tipoc:string}>(casillerosData:IDataSeparada<T>):IDataConCasilleros<T|Opcion>{
    return {
        ...casillerosData.data,
        casilleros: !casillerosData.childs.length && casillerosData.data.tipoc=='OM' ? opcionesSiNo :
             casillerosData.childs.map(casillero=>aplanarLaCurva(casillero))
    }
}

// type AnyRef<T extends {}>=[T, keyof T];

function rellenarVariablesYOpciones(estructura:EstructuraRowValidator, casillero:CasillerosImplementados, unidadAnalisis?:string|null){
    if(casillero.var_name != null){
        if(casillero.var_name.endsWith('!')){
            // @ts-ignore las variables espejo son las que terminan en !
            casillero.var_name=casillero.var_name_especial.replace(/!+$/,'');
        }
        var variableDef={
            tipo:casillero.tipoc=='OM' || casillero.tipovar=='si_no'?'opciones':casillero.tipovar,
            // @ts-ignore optativo podría no existir, quedará null.
            optativa:casillero.optativo!,
            opciones:(casillero.tipoc=='OM' || casillero.tipovar=='opciones' || casillero.tipovar=='si_no'?
                likeAr.createIndex(casillero.casilleros, 'casillero'):{}) as unknown as { [key: string]: RowValidatorOpcion<IdVariable> },
            salto:casillero.salto as IdVariable,
            saltoNsNr:'salto_ns_nc' in casillero && casillero.salto_ns_nc || null,
            funcionHabilitar:casillero.expresion_habilitar,
            calculada:casillero.unidad_analisis && casillero.unidad_analisis!=unidadAnalisis || casillero.despliegue?.includes('calculada')
        }
        estructura.variables[casillero.var_name]=variableDef;
    }
    if(casillero.casilleros){
        casillero.casilleros.forEach((casillero:CasillerosImplementados)=>
            rellenarVariablesYOpciones(estructura, casillero, unidadAnalisis)
        )
    }
}

type RegistroDestinos={[destino in IdDestino]:IdVariable|null};

function obtenerDestinosCasilleros(casillero:CasillerosImplementados, destinos?:RegistroDestinos):RegistroDestinos{
    if(destinos==null) return obtenerDestinosCasilleros(casillero, {} as RegistroDestinos);
    if(casillero.tipoc!='F' && casillero.tipoc!='O' && casillero.tipoc!='OM'){
        destinos[casillero.casillero]=casillero.primera_variable||null
    }
    if(casillero.casilleros){
        casillero.casilleros.forEach(c=>obtenerDestinosCasilleros(c,destinos));
    }
    return destinos;
}

function rellenarDestinos(estructura:EstructuraRowValidator, destinos:RegistroDestinos):EstructuraRowValidator{
    function obtenerDestino(idVariableQueTieneUnDestino:IdVariable|null|undefined):IdVariable|null{
        return idVariableQueTieneUnDestino!=null && destinos[idVariableQueTieneUnDestino as IdDestino] || null
    }
    return {
        ...estructura,
        variables:likeAr(estructura.variables).map(variableDef=>({
            ...variableDef,
            salto:obtenerDestino(variableDef.salto),
            saltoNsNr:obtenerDestino(variableDef.saltoNsNr),
            opciones:variableDef.opciones!=null ? likeAr(variableDef.opciones).map(opcionDef=>({salto:obtenerDestino(opcionDef.salto)})).plain():undefined
        })).plain()
    }
}

function generarEstructuraRowValidator(casillero:CasillerosImplementados):EstructuraRowValidator{
    var estructuraIncompleta:EstructuraRowValidator={variables:{}} as unknown as EstructuraRowValidator;
    rellenarVariablesYOpciones(estructuraIncompleta, casillero, casillero.unidad_analisis);
    var destinos=obtenerDestinosCasilleros(casillero);
    return rellenarDestinos(estructuraIncompleta, destinos);
}

export function toPlainForPk(forPk:ForPk):PlainForPk{
    // @ts-ignore sabemos que hay que hacer un JSON
    return JSON.stringify(forPk);
}

export function gotoSincronizar(){
    history.replaceState(null, '', `${location.origin+location.pathname}/../menu#i=sincronizar`);
    location.reload();   
}

export function goToTem(){
    history.replaceState(null, '', `${location.origin+location.pathname}/../menu#i=configurar,muestra,tem`);
    location.reload();   
}

export async function dmTraerDatosFormulario(opts:{modoDemo:boolean, vivienda?: IdCaso, useSessionStorage?:boolean}){
    opts.useSessionStorage= opts.useSessionStorage||false;
    var createInitialState = async function createInitialState(){
        var casillerosOriginales:{} = await my.ajax.operativo_estructura({ operativo: OPERATIVO });
        console.log(casillerosOriginales)
        //TODO: GENERALIZAR
        //@ts-ignore
        casillerosOriginales['F:F2_personas']=casillerosOriginales['F:F2'].childs.find(casillero=>casillero.data.casillero=='LP');
        //@ts-ignore
        var casillerosTodosFormularios:{[f in IdFormulario]:{casilleros:Formulario, estructuraRowValidator:EstructuraRowValidator}}=
            likeAr(casillerosOriginales).map(
                (casillerosJerarquizados:any)=>{
                    var casillerosAplanados:CasillerosImplementados = aplanarLaCurva(casillerosJerarquizados);
                    return {
                        casilleros: casillerosAplanados,
                        estructuraRowValidator: generarEstructuraRowValidator(casillerosAplanados)
                    }
                }
            ).plain();
        var initialState:CasoState={
            estructura:{
                formularios:casillerosTodosFormularios,
                mainForm:MAIN_FORM
            },
            datos:{
                cargas:{
                    // @ts-expect-error tengo que agregar toDmy en los tipos
                    "2020-07-07":{fecha:bestGlobals.date.iso("2020-07-07").toDmy(), observaciones:'lugar de entrega: Hospital San Martín. Ascasubi 333'},
                    // @ts-expect-error tengo que agregar toDmy en los tipos
                    "2020-07-08":{fecha:bestGlobals.date.iso("2020-07-08").toDmy(), observaciones:'lugar de entrega: Hospital San Martín. Ascasubi 333'}
                },
                hdr:{
                    '10901':{
                        tem:{
                            observaciones:'Ejemplo de relevamiento vacío', carga:"2020-07-07",
                            nomcalle:'Bolivar', nrocatastral:'541', piso:'6', departamento:'C'
                        } as TEM,
                        // @ts-ignore
                        respuestas:{personas:[]}
                    },
                    '10902':{
                        tem:{
                            observaciones:'Otro ejemplo vacío', carga:"2020-07-07",
                            nomcalle:'Bolivar', nrocatastral:'541', piso:'3', departamento:'B'
                        } as TEM,
                        // @ts-ignore
                        respuestas:{personas:[]}
                    },
                    '10904':{
                        respuestas:{
                            "dv1":"1","dv2":"1/7/2020","dv4":"2"
                            ,personas:[{}],
                        } as unknown as Respuestas,
                        tem:{observaciones:'Ejemplo incompleto listo para cargar personas',carga:"2020-07-08", nomcalle:'Bolivar', nrocatastral:'531' } as TEM
                    },
                    '13303':{
                        tem:{
                            observaciones:'Ejemplo incompleto con 3 miembros cargados',carga:"2020-07-08",
                            nomcalle:'Bolivar', nrocatastral:'593', piso:'3', departamento:'B',
                            edificio:'SUR', sector:'2'
                        } as TEM,
                        respuestas:{
                            // @ts-ignore
                            "personas":[{"p1":"Carolina","p2":"2","p3":"33","p4":"1"},{"p1":"Alfonso","p2":"1","p3":"72","p4":"1"},{"p1":"Berta","p3":"68","p2":"2","p4":"1"}],"dv1":"1","dv2":"1/7/2020","dv4":"2","cp":"3","_personas_incompletas":0
                        }
                    },
                    '13308':{
                        tem:{
                            observaciones:'Ejemplo de relevamiento terminado',carga:"2020-07-07",
                            nomcalle:'Bolivar', nrocatastral:'541', piso:'PB', departamento:'A',
                        } as TEM,
                        respuestas:{
                            // @ts-ignore
                            "personas":[{"p1":"Carolina","p2":"2","p3":"33","p4":"1"},{"p1":"Alfonso","p2":"1","p3":"72","p4":"1"},{"p1":"Berta","p3":"68","p2":"2","p4":"1"},{"p1":"Lucas","p4":null,"p2":"1","p3":"12"}],"p11":1,"p12":"Carolina","dv1":"1","dv2":"1/7/2020","dv4":"2","cp":4,"_personas_incompletas":0,"p9":"1","s1":"1","s2":"1","s3":"1","d1":"1","d2":"1","d4":"2","d5c":null,"d6_1":"2","d6_2":"2","d6_3":"2","d6_4":"1","d6_5":"2","d6_6":"2","d6_7":"2","d6_8":"2","d6_9":"2","a1_1":"2","a1_2":"2","a1_3":"2","a1_4":"2","a1_5":"2","a2":"2","a3":"2","a4":"159","a5":"59","cv1":"2","cv3":"1","cv4_1":2,"cv4_2":2,"cv4_3":2,"cv4_4":2,"cv4_5":2,"cv4_6":1,"t1":"1","t2_1":"2","t2_2":"2","t2_3":"2","t2_4":"2","t2_5":"2","t2_6":"1","t2_7":"2","t2_8":"2","t3":"2","e1":"Carolina Martinez","e2":"1","e6":"34567890","c1":"15-16171819","c2":"preuba@prueba.com","fin":null,"_edad_maxima":72,"_edad_minima":12,"c5":"1234-56","c4":null,"d5":"9","d12":"1"
                        }
                    },
                    '13309':{
                        tem:{
                            observaciones:'Ejemplo incompleto y avanzado',carga:"2020-07-07",
                            nomcalle:'Bolivar', nrocatastral:'609',
                        } as TEM,
                        respuestas:{
                            // para ver cómo las opciones con ocultar se ocultan
                            // @ts-ignore
                            "personas":[{"p1":"Úrsula","p2":"2","p3":"42","p4":"1"},{"p1":"José Arcadio","p2":"1","p3":"45","p4":"1"},{"p1":"José Aradio","p2":"1","p3":"27","p4":"1"},{"p1":"Aureliano","p2":"1","p3":"25","p4":"2"},{"p1":"Amaranta","p2":"2","p3":"22","p4":"2"},{"p1":"Rebeca","p2":"2","p3":"21","p4":"2"}],"dv1":"1","dv2":"1/7/2020","dv4":"2","cp":6,"s1":"1","_personas_incompletas":0,"s2":"1","s3":"1","d1":"1","d2":"1","d3":null,"d4":"2","d5":"2","d6_1":"2","d6_2":"2","d6_3":"2","d6_4":"2","d6_6":"2","d6_7":"2","d6_5":"2","d6_8":"2","d6_9":"2","a1_1":"2","a1_2":"2","a1_3":"2","a1_4":"2","a1_5":"2","a2":"2","a3":"2","a4":"161","a5":"59","cv1":"2","cv3":"1","t1":null,"e1":null,"e2":null,"e6":null,"c3":null,"e4":null,"cv2_1":null,"p9":"1","d5c":null,"_edad_maxima":45,"_edad_minima":21,"p11":2,"p12":"José Arcadio"
                        }
                    },
                    '13399':{
                        tem:{
                            observaciones:'Ejemplo con error',carga:"2020-07-07",
                            nomcalle:'Bolivar', nrocatastral:'633',
                        } as TEM,
                        respuestas:{
                            // para ver cómo las opciones con ocultar se ocultan
                            // @ts-ignore
                            "personas":[{"p1":"Carolina","p2":"2","p3":"33","p4":"1"},{"p1":"Alfonso","p2":"1","p3":"72","p4":"1"},{"p1":"Berta","p3":"68","p2":"2","p4":"1"},{"p1":"Lucas","p4":null,"p2":"1","p3":"12"}],"p11":1,"p12":"Carolina","dv1":"1","dv2":"1/7/2020","dv4":"2","cp":4,"_personas_incompletas":0,"p9":"1","s1":"1","s2":"1","s3":"1","d1":"1","d2":"1","d4":"2","d5c":null,"d6_1":"2","d6_2":"2","d6_3":"2","d6_4":"2","d6_5":"2","d6_6":"2","d6_7":"2","d6_8":"2","d6_9":"2","a1_1":"2","a1_2":"2","a1_3":"2","a1_4":"2","a1_5":"2","a2":"2","a3":"2","a4":"159","a5":"59","cv1":"2","cv3":"1","cv4_1":2,"cv4_2":2,"cv4_3":2,"cv4_4":2,"cv4_5":2,"cv4_6":2,"t1":"1","t2_1":"2","t2_2":"2","t2_3":"2","t2_4":"2","t2_5":"2","t2_6":"1","t2_7":"2","t2_8":"2","t3":"2","e1":"Carolina Martinez","e2":"1","e6":"34567890","c1":"15-16171819","c2":"preuba@prueba.com","fin":null,"_edad_maxima":72,"_edad_minima":12,"c5":"1234-56","c4":null,"d5":"9","d12":"1"
                        }
                    }
                }
            },
            opciones:{
                modoDespliegue:'relevamiento',
                bienvenido:false,
                forPk:null,
                modoDirecto: false
            },
            modo:{
                demo:false
            },
            // @ts-ignore lo lleno después
            feedbackRowValidator:{}
        };
        // @ts-ignore variable global
        if(myOwn.config.config.ambiente=='test'){
            likeAr(initialState.datos.hdr).forEach((viv,_k,_,i)=>{ 
                // @ts-ignore lo lleno después
                viv.respuestas={personas:[]}; 
                viv.tem.observaciones=i==1?'Timbre verde':''
            })
        }
        // @ts-ignore variable global
        if(myOwn.config.config.ambiente=='produccion'){
            // @ts-ignore lo vacio
            initialState.datos={hdr:{}, casos:{}}
        }
        var vivienda:IdCaso;
        var formulario:IdFormulario;
        // @ts-ignore esto se va
        for(var vivienda in initialState.datos.hdr){
            // @ts-ignore esto se va
            for(var formulario in initialState.estructura.formularios){
                initialState.feedbackRowValidator[toPlainForPk({vivienda,formulario})]=
                    rowValidator(
                        initialState.estructura.formularios[formulario].estructuraRowValidator, 
                        initialState.datos.hdr[vivienda].respuestas
                    )
            }
        }
        return initialState;
    }
    var loadState = async function loadState():Promise<CasoState>{
        var casoState:CasoState|null = opts.useSessionStorage?my.getSessionVar(LOCAL_STORAGE_STATE_NAME):my.getLocalVar(LOCAL_STORAGE_STATE_NAME);
        if(casoState && !opts.modoDemo){
            if(casoState.estructura==null){
                initialState = await createInitialState();
                casoState = {...initialState, ...casoState};
                casoState={
                    ...casoState,
                    opciones: {
                        ...casoState.opciones,
                        modoDirecto: opts.vivienda?true:false,
                        forPk: opts.vivienda?{vivienda:opts.vivienda, formulario:MAIN_FORM}:null,
                        bienvenido:true,
                    }
                }
            }
        }else{
            var initialState = await createInitialState();
            if(opts.modoDemo){
                initialState = {
                    ...initialState, 
                    modo:{
                        ...initialState.modo, 
                        //@ts-ignore es un booleano pero pongo ahí los datos de demo!
                        demo: initialState.datos && 
                            // @ts-ignore
                            myOwn.config.config.ambiente=='test' || myOwn.config.config.ambiente=='demo',
                    }
                };
                if(casoState){
                    initialState = {
                        ...initialState, 
                        datos:casoState.datos, 
                        opciones:casoState.opciones,
                        feedbackRowValidator:casoState.feedbackRowValidator
                    }
                }
            }
            //inicializo feedbacks
            
            return initialState;
        }
        for(var vivienda in casoState.datos.hdr){
            casoState=calcularFeedback(casoState, {vivienda:vivienda as IdCaso, formulario: 'F:F1' as IdFormulario});
        }
        return casoState;
    }
    var saveState = function saveState(state:CasoState){
        opts.useSessionStorage?my.setSessionVar(LOCAL_STORAGE_STATE_NAME, state):my.setLocalVar(LOCAL_STORAGE_STATE_NAME, state);
    }
    /* DEFINICION CONTROLADOR */
    var initialState:CasoState = await loadState();
    const hdrReducer = createReducer(reducers, initialState);
    /* FIN DEFINICION CONTROLADOR */
    /* CARGA Y GUARDADO DE STATE */

    
    /* CREACION STORE */
    const store = createStore(hdrReducer, initialState); 
    saveState(store.getState());
    store.subscribe(function(){
         saveState(store.getState());
    });
    /* FIN CREACION STORE */

    //HDR CON STORE CREADO
    return store;
}


