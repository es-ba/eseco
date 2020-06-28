import { createStore } from "redux";
import { CasilleroBase, CasillerosImplementados, CasoState, 
    EstructuraRowValidator, 
    Formulario, ForPk, 
    IdCasillero, IdDestino, IdFormulario, IdVariable, 
    Opcion, Respuestas
} from "./tipos";
import { deepFreeze } from "best-globals";
import { createReducer, createDispatchers, ActionsFrom } from "redux-typed-reducer";
import { getRowValidator, Structure, Opcion as RowValidatorOpcion } from "row-validator";
import * as JSON4all from "json4all";
import * as likeAr from "like-ar";

var my=myOwn;

const OPERATIVO='ESECO';
const MAIN_FORM:IdFormulario='F:F3' as IdFormulario;

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

function getFuncionHabilitar(nombreFuncionComoExpresion:string):FuncionHabilitar{
    if(!funcionesHabilitar[nombreFuncionComoExpresion]){
        var cuerpo = nombreFuncionComoExpresion.replace(/\b.+?\b/g, function(elToken){
            var elTokenTrimeado=elToken.trim();
            if(elTokenTrimeado in reemplazosHabilitar){
                return reemplazosHabilitar[elTokenTrimeado];
            }else if(/^\d+\.?\d*$/.test(elTokenTrimeado)){
                return elToken
            }else if(/^\W+$/.test(elTokenTrimeado)){
                return elToken
            }
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

var reducers={
    REGISTRAR_RESPUESTA: (payload: {forPk:ForPk, variable:string, respuesta:any}) => 
        function(state: CasoState){
            var nuevoEstado = {
                ...state,
                datos:{
                    ...state.datos,
                    respuestas: {
                        ...state.datos.respuestas,
                        [payload.variable]: payload.respuesta
                    }
                }
            }
            return {
                ...nuevoEstado,
                formStructureState:rowValidator(nuevoEstado.estructura.estructuraRowValidator, nuevoEstado.datos.respuestas)
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
    casilleros:readonly IDataConCasilleros<T>[]
}

const casilleroVacio={salto:null, despliegue:null, aclaracion:null, ver_id:null}

const opcionesSiNo: Opcion[] = [
    {...casilleroVacio, casillero:1, tipoc:'O', nombre:'Sí', casilleros:[]},
    {...casilleroVacio, casillero:2, tipoc:'O', nombre:'No', casilleros:[]},
]

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
            tipo:casillero.tipoc=='OM'?'opciones':casillero.tipovar,
            // @ts-ignore optativa podría no existir, quedará null.
            optativa:casillero.optativa!,
            opciones:(casillero.tipoc=='OM' || casillero.tipovar=='opciones'?
                likeAr.createIndex(casillero.casilleros, 'casillero'):{}) as unknown as { [key: string]: RowValidatorOpcion<IdVariable> },
            salto:casillero.salto as IdVariable,
            saltoNsNr:'salto_ns_nc' in casillero && casillero.salto_ns_nc || null
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

export async function dmTraerDatosFormulario(){
    var casillerosOriginales = await my.ajax.operativo_estructura({ operativo: OPERATIVO });
    console.log(casillerosOriginales)
    //@ts-ignore
    var casilleros:{[f in IdFormulario]:Formulario} = likeAr(casillerosOriginales).map((x:any)=>aplanarLaCurva(x));
    var estructuraRowValidator:EstructuraRowValidator = generarEstructuraRowValidator(casilleros[MAIN_FORM]);
    console.log('casilleros',casilleros);
    console.log('estructuraRowValidator',estructuraRowValidator);
    var initialState:CasoState={
        estructura:{
            formularios:casilleros,
            estructuraRowValidator
        },
        mainForm:MAIN_FORM,
        datos:{
            respuestas:{
            } as unknown as Respuestas
        },
        estado:{
            formularioActual:MAIN_FORM as IdFormulario
        },
        formStructureState:{
            resumen:'vacio',
            estados:{},
            siguientes:{},
            actual:null,
            primeraFalla:null
        }
    };
    initialState.formStructureState=rowValidator(initialState.estructura.estructuraRowValidator, initialState.datos.respuestas)
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


