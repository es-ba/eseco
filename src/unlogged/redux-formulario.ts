import { createStore } from "redux";
import { CasoState, IdFormulario } from "./tipos";
import { deepFreeze } from "best-globals";
import { createReducer, createDispatchers, ActionsFrom } from "redux-typed-reducer";
import * as JSON4all from "json4all";
import * as likeAr from "like-ar";

var my=myOwn;

const OPERATIVO='ESECO';
const MAIN_FORM='F:F3';

/* REDUCERS */

var defaultActionFormulario = function defaultActionFormulario(
    formularioState:CasoState, 
){
    return deepFreeze({
        ...formularioState
    })
};

var reducers={
    REGISTRAR_RESPUESTA: (payload: {forPk:{vivienda:number, persona:number}, variable:string, respuesta:any}) => 
        function(state: CasoState){
            return {
                ...state,
                datos:{
                    ...state.datos,
                    respuestas: {
                        ...state.datos.respuestas,
                        [payload.variable]: payload.respuesta
                    }
                }
            }
        },
}

export type ActionFormularioState = ActionsFrom<typeof reducers>;
/* FIN ACCIONES */

export const dispatchers = createDispatchers(reducers);

export async function dmTraerDatosFormulario(){
    var casilleros = await my.ajax.operativo_estructura({ operativo: OPERATIVO });
    console.log(casilleros);
    var initialState:CasoState={
        estructura:{formularios:casilleros},
        mainForm:MAIN_FORM as IdFormulario,
        datos:{
            respuestas:{}
        },
        estado:{
            formularioActual:MAIN_FORM as IdFormulario
        }
    };
    /* DEFINICION CONTROLADOR */
    const hdrReducer = createReducer(reducers, initialState);
    /* FIN DEFINICION CONTROLADOR */
    /* CARGA Y GUARDADO DE STATE */

    /* CREACION STORE */
    const store = createStore(hdrReducer, initialState); 
    store.subscribe(function(){
        // saveState(store.getState());
    });
    /* FIN CREACION STORE */

    //HDR CON STORE CREADO
    return store;
}

