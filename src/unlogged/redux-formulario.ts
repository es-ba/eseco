import { createStore } from "redux";
import { CasilleroBase, CasillerosImplementados, CasoState, 
    DatosVivienda, EstructuraRowValidator, 
    FeedbackVariable, Formulario, ForPk, 
    IdCasillero, IdCaso, IdDestino, IdFin, IdFormulario, IdVariable, 
    ModoDespliegue, 
    Opcion, PlainForPk, Respuestas,
    TEM
} from "./tipos";
import { deepFreeze } from "best-globals";
import { createReducer, createDispatchers, ActionsFrom } from "redux-typed-reducer";
import { getRowValidator, Structure, Opcion as RowValidatorOpcion, FormStructureState } from "row-validator";
import * as JSON4all from "json4all";
import * as likeAr from "like-ar";
import * as bestGlobals from "best-globals";

var my=myOwn;

export const MAXCP=20;
const OPERATIVO='ESECO';
const MAIN_FORM:IdFormulario='F:F1' as IdFormulario;
export const LOCAL_STORAGE_STATE_NAME ='hdr-campo';

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
type Persona={p1:string, p2:number, p3:number, p4:number}

function variablesCalculadas(datosVivienda: DatosVivienda):DatosVivienda{
    // TODO: GENERALIZAR
    var cp='cp' as IdVariable;
    var _personas_incompletas = '_personas_incompletas' as IdVariable
    var p9='p9' as IdVariable;
    //@ts-ignore
    var cantidadPersonasActual:number = datosVivienda.respuestas.personas?.length||0;
    //@ts-ignore
    var personasIncompletas=datosVivienda.respuestas.personas.filter(p=>!p.p1 || !p.p2 || !p.p3 || p.p3>=18 && !p.p4).length;
    if(
        (datosVivienda.respuestas[cp]||1)==cantidadPersonasActual
        && datosVivienda.respuestas[_personas_incompletas]==personasIncompletas
        && datosVivienda.respuestas[p9]!=2
    ) return datosVivienda;
    datosVivienda=bestGlobals.changing({respuestas:{personas:[{}]}},datosVivienda) // deepCopy
    var respuestas = datosVivienda.respuestas as unknown as {cp:number, personas:Persona[], _personas_incompletas:number, p9:number|null};
    if(respuestas.p9==2){
        respuestas.cp=Math.max(respuestas.personas.length,respuestas.cp)+1
        respuestas.p9=null;
    }
    if(respuestas.cp>MAXCP) respuestas.cp=MAXCP;
    if(respuestas.cp<respuestas.personas.length){
        respuestas.personas=respuestas.personas.filter(p=>p.p1||p.p2||p.p3||p.p4);
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
    console.log(JSON.stringify(respuestas));
    var nuevosRows = likeAr([
        {forPk:{vivienda, formulario:'F:F1' as IdFormulario}, formulario:'F:F1' as IdFormulario},
        {forPk:{vivienda, formulario:'F:F2' as IdFormulario}, formulario:'F:F2' as IdFormulario},
        {forPk:{vivienda, formulario:'F:F3' as IdFormulario}, formulario:'F:F3' as IdFormulario},
        ...bestGlobals.serie({
            from:1, 
            //@ts-ignore existen las personas y es un array
            to:respuestas.personas.length
        }).map(persona=>({forPk:{vivienda, formulario:'F:F2' as IdFormulario, persona}, formulario:'F:F2_personas' as IdFormulario}))
    ]).build(({forPk, formulario})=>{
        var respuestasUnidadAnalisis=state.datos.hdr[forPk.vivienda].respuestas;
        // TODO: GENERALIZAR:
        if('persona' in forPk && forPk.persona!=null){
            // @ts-ignore exite
            respuestasUnidadAnalisis=respuestasUnidadAnalisis.personas[forPk.persona-1];
        }
        return {
            [toPlainForPk(forPk)]: rowValidator(
                state.estructura.formularios[formulario].estructuraRowValidator, 
                respuestasUnidadAnalisis
            )
        }
    })
    return {
        ...state,
        feedbackRowValidator:{
            ...state.feedbackRowValidator,
            ...nuevosRows
        }
    }
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
            // @ts-ignore optativa podría no existir, quedará null.
            optativa:casillero.optativa!,
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

export async function dmTraerDatosFormulario(opts:{modoDemo:boolean}){
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
                hdr:{
                    '10902':{
                        tem:{
                            observaciones:'Encuesta vacía',
                            nomcalle:'Bolivar', nrocatastral:'541', piso:'3', departamento:'B'
                        } as TEM,
                        // @ts-ignore
                        respuestas:{personas:[]}
                    },
                    '10904':{
                        respuestas:{
                            "dv1":"1","dv2":"1/7/2020","dv4":"2","cp":"3"
                            ,personas:[{},{},{}],
                        } as unknown as Respuestas,
                        tem:{observaciones:'Lista par el individual', nomcalle:'Bolivar', nrocatastral:'531' } as TEM
                    },
                    '13303':{
                        tem:{
                            observaciones:'Encuesta empezada',
                            nomcalle:'Bolivar', nrocatastral:'593', piso:'3', departamento:'B',
                            edificio:'SUR', sector:'2'
                        } as TEM,
                        respuestas:{
                            // para ver cómo las opciones con ocultar se ocultan
                            // @ts-ignore
                            "dv1":"1","dv2":"1/7/2020","dv4":"2","cp":"3"
                            // @ts-ignore
                            ,personas:[{"p1":"asdfa","p2":"1","p3":"33","p4":"1"},{"p1":"asdf","p2":"1"},{}]
                        }
                    },
                    '13308':{
                        tem:{
                            observaciones:'Encuesta terminada',
                            nomcalle:'Bolivar', nrocatastral:'541', piso:'PB', departamento:'A',
                        } as TEM,
                        respuestas:{
                            // para ver cómo las opciones con ocultar se ocultan
                            // @ts-ignore
                            "dv2":"1/7/2020","dv1":"1","dv4":"1","cp":"33","p1":"Esteban","p2":"2","p3":"33","p4":"1","s1":"1","s2":"1","s3":"1","d1":"1","d2":"2","d3":"23","d4":"1","d6_1":null
                            ,personas:[]
                        }
                    }
                }
            },
            opciones:{
                modoDespliegue:'relevamiento',
                bienvenido:false,
                forPk:null,
            },
            modo:{
                demo:false
            },
            // @ts-ignore lo lleno después
            feedbackRowValidator:{}
        };
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
        var casoState:CasoState|null = my.getLocalVar(LOCAL_STORAGE_STATE_NAME);
        if(casoState && !opts.modoDemo){
            return casoState;
        }else{
            var initialState = await createInitialState();
            if(opts.modoDemo){
                initialState = {...initialState, modo:{...initialState.modo, demo:opts.modoDemo}};
                if(casoState){
                    initialState = {...initialState, datos:casoState.datos}
                }
            }
            return initialState;
        }
    }
    var saveState = function saveState(state:CasoState){
        my.setLocalVar(LOCAL_STORAGE_STATE_NAME, state);
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


