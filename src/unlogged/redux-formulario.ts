import { createStore } from "redux";
import { CasilleroBase, CasillerosImplementados, CasoState, 
    Formulario, ForPk, IdFormulario, Opcion, Respuestas, IdVariable 
} from "./tipos";
import { deepFreeze } from "best-globals";
import { createReducer, createDispatchers, ActionsFrom } from "redux-typed-reducer";
import { Structure } from "row-validator";
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
    REGISTRAR_RESPUESTA: (payload: {forPk:ForPk, variable:string, respuesta:any}) => 
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

interface IDataSeparada<T extends {tipoc:string}> {
    data:T,
    childs:IDataSeparada<T>[]
}

type IDataConCasilleros<T> = T & {
    casilleros:IDataConCasilleros<T>[]
}

const casilleroVacio={salto:null, despliegue:null, aclaracion:null, ver_id:null}

const opcionesSiNo: Opcion[] = [
    {...casilleroVacio, casillero:1, tipoc:'O', nombre:'Sí', casilleros:[]},
    {...casilleroVacio, casillero:2, tipoc:'O', nombre:'No', casilleros:[]},
]

function aplanarLaCurva<T extends {tipoc:string}>(casillerosData:IDataSeparada<T>):IDataConCasilleros<T|CasilleroBase>{
    return {
        ...casillerosData.data,
        casilleros: !casillerosData.childs.length && casillerosData.data.tipoc=='OM' ? opcionesSiNo :
             casillerosData.childs.map(casillero=>aplanarLaCurva(casillero))
    }
}

function rellenarEstructura(estructura:CasoState['estructura']['estructuraRowValidator'], casillero:CasillerosImplementados){
    if('var_name' in casillero){
        estructura.variables[casillero.var_name]={
            tipo:casillero.tipoc=='OM'?'opciones':casillero.tipovar,
            // @ts-ignore TODO: acá el salto se refiere a la pregunta y hay que poner la variable
            salto:casillero.salto,
            //optativa:casillero.optativa,
        }
    }
    casillero.casilleros.forEach((casillero)=>
        rellenarEstructura(estructura, casillero);
    )
}

export async function dmTraerDatosFormulario(){
    var casillerosOriginales = await my.ajax.operativo_estructura({ operativo: OPERATIVO });
    console.log(casillerosOriginales)
    //@ts-ignore
    var casilleros:{[f in IdFormulario]:Formulario} = likeAr(casillerosOriginales).map((x:any)=>aplanarLaCurva(x));
    console.log(casilleros);
    var initialState:CasoState={
        estructura:{
            formularios:casilleros,
            estructuraRowValidator:{variables:{}, marcaFin:'NO_HAY_POR_AHORA'} as unknown as CasoState['estructura']['estructuraRowValidator']
        },
        mainForm:MAIN_FORM as IdFormulario,
        datos:{
            respuestas:{
                "s1": 1,
                "a8": "hola"
            } as unknown as Respuestas
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

