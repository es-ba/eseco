import { createStore } from "redux";
import { CasilleroBase, CasillerosImplementados, CasoState, 
    EstructuraRowValidator, 
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

function calcularFeedback(state: CasoState):CasoState{
    var forPk=state.opciones.forPk;
    if(forPk==null){
        return state;
    }
    console.log('vivenda',forPk.vivienda);
    console.log(JSON.stringify(state.datos.hdr[forPk.vivienda].respuestas))
    return {
        ...state,
        feedbackRowValidator:{
            ...state.feedbackRowValidator,
            [toPlainForPk(forPk)]:rowValidator(
                state.estructura.formularios[forPk.formulario].estructuraRowValidator, 
                state.datos.hdr[forPk.vivienda].respuestas
            )
        }
    }
}

var reducers={
    REGISTRAR_RESPUESTA: (payload: {forPk:ForPk, variable:string, respuesta:any}) => 
        function(state: CasoState){
            var datosVivienda=state.datos.hdr[payload.forPk.vivienda];
            if(datosVivienda==null){
                return state;
            }
            /////////// ESPECIALES
            var otrasRespuestasCalculadas={};
            if(payload.variable=='dv1' && payload.respuesta != null 
                // @ts-ignore en esta encuesta existe
                && datosVivienda.respuestas.dv2 == null
            ){
                otrasRespuestasCalculadas={dv2: bestGlobals.date.today()}
            }
            ////////// FIN ESPECIALES
            var nuevosDatosVivienda={
                ...datosVivienda,
                respuestas:{
                    ...datosVivienda.respuestas,
                    ...otrasRespuestasCalculadas,
                    [payload.variable]: payload.respuesta
                }
            }
            return calcularFeedback({
                ...state,
                datos:{
                    ...state.datos,
                    hdr:{
                        ...state.datos.hdr,
                        [payload.forPk.vivienda]:nuevosDatosVivienda
                    }
                }
            })
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

function rellenarVariablesYOpciones(estructura:EstructuraRowValidator, casillero:CasillerosImplementados){
    if(casillero.var_name != null){
        var variableDef={
            tipo:casillero.tipoc=='OM' || casillero.tipovar=='si_no'?'opciones':casillero.tipovar,
            // @ts-ignore optativa podría no existir, quedará null.
            optativa:casillero.optativa!,
            opciones:(casillero.tipoc=='OM' || casillero.tipovar=='opciones' || casillero.tipovar=='si_no'?
                likeAr.createIndex(casillero.casilleros, 'casillero'):{}) as unknown as { [key: string]: RowValidatorOpcion<IdVariable> },
            salto:casillero.salto as IdVariable,
            saltoNsNr:'salto_ns_nc' in casillero && casillero.salto_ns_nc || null,
            funcionHabilitar:casillero.expresion_habilitar
        }
        estructura.variables[casillero.var_name]=variableDef;
    }
    if(casillero.casilleros){
        casillero.casilleros.forEach((casillero:CasillerosImplementados)=>
            rellenarVariablesYOpciones(estructura, casillero)
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
    rellenarVariablesYOpciones(estructuraIncompleta, casillero);
    var destinos=obtenerDestinosCasilleros(casillero);
    return rellenarDestinos(estructuraIncompleta, destinos);
}

export function toPlainForPk(forPk:ForPk):PlainForPk{
    // @ts-ignore sabemos que hay que hacer un JSON
    return JSON.stringify(forPk);
}

export async function dmTraerDatosFormulario(){
    var createInitialState = async function createInitialState(){
        var casillerosOriginales:{} = await my.ajax.operativo_estructura({ operativo: OPERATIVO });
        console.log(casillerosOriginales)
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
                    10202:{
                        respuestas:{
                            "dv1":"1", "dv5":"4",
                            // hasta la D11
                            "s1":"1","s2":"2","s3":"1","d1":"2","d3":"2","d4":"2","d5":"2","d6":"2","d7":"2","d8":"2","d9":"2","d10":"1","d11":"1"
                            // hasta la t9
                            // "s1":"1","s2":"2","s3":"1","d1":"2","d3":"2","d4":"2","d5":"2","d6":"2","d7":"2","d8":"2","d9":"2","d10":"2","d11":"2","a_1":"1","a_2":"1","a_3":"1","a_4":"2","a_5":"2","a6":"2","a7":"2","a8":"156","a9":"89","cv1":"2","cv3":"2","t1":"2","t2":"2","t3":"1","t4":"2","t5":"2","t6":"2","t7":"2","t8":"2"
                            // hasta la pregunta de texto:
                            //"s2":"2","s1":"2","s3":"1","d1":"1","d3":"1","d4":"1","d5":"1","d7":"2","d6":"2","d8":"1","d9":"1","d10":"1","d11":"1","d12":"1","a1":"1","a2":"1","a3":"1","a4":"1","a5":"1","a6":"1","a7":"1"
                            // d3=1 || d4=1 || d5=1 || d6=1 || d7=1 || d8=1 || d9=1 || d10=1 || d11=1
                            // d3=1 or d4=1 or d5=1 or d6=1 or d7=1 or d8=1 or d9=1 or d10=1 or d11=1
                            // t1=2 & t2=2 & t3=2 & t4=2 & t5=2 & t6=2 & t7=2 & t8=2 & t9=2
                        } as unknown as Respuestas,
                        tem:{observaciones:'Encuesta vacía', nomcalle:'Bolivar', nrocatastral:'531' } as TEM
                    },
                    '10902':{
                        tem:{
                            observaciones:'Lista par el individual',
                            nomcalle:'Bolivar', nrocatastral:'541', piso:'3', departamento:'B'
                        } as TEM,
                        // @ts-ignore
                        respuestas:{}
                    },
                    '10909':{
                        tem:{
                            observaciones:'Encuesta empezada',
                            nomcalle:'Bolivar', nrocatastral:'593', piso:'3', departamento:'B',
                            edificio:'SUR', sector:'2'
                        } as TEM,
                        respuestas:{
                            // para ver cómo las opciones con ocultar se ocultan
                            // @ts-ignore
                            "dv2":"2020-07-01","dv1":"1","dv4":"1","dv5":"33","p1":"Esteban","p2":"2","p3":"33","p4":"1","s1":"1","s2":"1","s3":"1","d1":"1","d2":"2","d3":"23","d4":"1","d6_1":null
                        }
                    }
                }
            },
            opciones:{
                modoDespliegue:'relevamiento',
                forPk:null//{vivienda:'10202', formulario:'F:F3' as IdFormulario} // null
                // modoDespliegue:'metadatos'
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
        if(casoState){
            return casoState;
        }else{
            var initialState = await createInitialState();
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


