import { createStore } from "redux";
import { Opcion, FormularioState, Pregunta } from "./tipos";
import { deepFreeze } from "best-globals";
import { createReducer, createDispatchers, ActionsFrom } from "redux-typed-reducer";
import * as JSON4all from "json4all";
import * as likeAr from "like-ar";

var my=myOwn;


/* REDUCERS */

var defaultActionFormulario = function defaultActionFormulario(
    formularioState:FormularioState, 
){
    return deepFreeze({
        ...formularioState
    })
};

var reducers={
    REGISTRAR_RESPUESTA: (payload: {forPk:{vivienda:number, persona:number}, variable:string, respuesta:any}) => 
        function(state: FormularioState){
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
    var initialState:FormularioState={
        estructura:{
            preguntas:[
                {pregunta:'P1', texto:'eae asdf asdf asdfqwef asdjkfla;ewjf asef as', tipovar:'numero', salto:'P3'},
                {pregunta:'P2', texto:'eae asdf asdf asdfqwef asdjkfla;ewjf asef as', tipovar:'numero', salto:null},
                {pregunta:'P3', texto:'eae asdf asdf asdfqwef asdjkfla;ewjf asef as', tipovar:'numero', salto:null},
            ]
        },
        datos:{
            respuestas:{}
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

