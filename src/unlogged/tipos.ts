"use strict";
/* TODO: controlar los nombres y tipos de la base
 * atributo
 * producto
 * 
 */

import {FormStructureState, Structure} from "row-validator";

export type IdOpcion = number
export type IdVariable = 'v1'|'v2'|'etc...'
export type IdPregunta = 'P1'|'P2'|'etc...'
export type IdBloque = 'B1'|'B2'|'etc...'
export type IdFormulario = 'F1'|'F2'|'etc...'
export type IdFiltro = 'FILTRO1' | 'FILTRO2' | 'etc...'
export type IdCasillero = IdVariable | IdPregunta | IdBloque | IdFormulario | IdFiltro | IdOpcion
export type IdFin = never // TODO: poder poner 'FIN'
export type IdDestino = IdPregunta | IdBloque | IdFin | IdFiltro 
export type Valor = string|number|Date|null;
export type TipocDestinos = 'P'|'CP'|'B'|'FILTRO'
export type Tipoc = TipocDestinos | 'F'|'O'|'OM'

export type TipoVariables = 'texto'|'numero'|'fecha'

export type CasilleroBase = {
    tipoc:Tipoc
    casillero:IdCasillero
    nombre:string
    salto:IdDestino|IdFin|null
    ver_id:string|null
    despliegue:string|null
    aclaracion:string|null
    primera_variable?:IdVariable|null
    var_name?:IdVariable|null
    tipovar?:TipoVariables|'opciones'|'si_no'|null
    casilleros?:CasillerosImplementados[]|null
    expresion_habilitar?:string
}

export type Opcion=CasilleroBase & {
    tipoc:'O'
    casillero:IdOpcion
    casilleros:PreguntaSimple[]
    var_name?:null
    tipovar?:null
    primera_variable?:null
}

export type OpcionSi=Opcion & {
    casillero:1
    nombre:'Sí'
    casilleros:PreguntaSimple[] 
}

export type OpcionNo=Opcion & {
    casillero:2
    nombre:'No'
    casilleros:PreguntaSimple[] 
}

export type OpcionMultiple=CasilleroBase & {
    tipoc:'OM'
    var_name:IdVariable
    casilleros:[OpcionSi, OpcionNo]
}

export type PreguntaBase = CasilleroBase & {
    tipoc:'P'
    optativa:boolean|null
    casillero:IdPregunta
}

export type PreguntaSimple = PreguntaBase & {
    tipovar:TipoVariables
    var_name:IdVariable
    longitud:string
    salto_ns_nc:IdVariable|null
    casilleros: PreguntaSimple[]
}

export type PreguntaConSiNo = PreguntaBase & {
    tipovar:'si_no'
    var_name:IdVariable
    salto_ns_nc:IdVariable|null
    casilleros: [OpcionSi, OpcionNo]
}

export type PreguntaConOpciones = PreguntaBase & {
    tipovar:'opciones'
    var_name:IdVariable
    salto_ns_nc:IdVariable|null
    casilleros: Opcion[]
}

export type PreguntaConOpcionesMultiples = PreguntaBase & {
    var_name?:null
    tipovar?:null
    casilleros: OpcionMultiple[]
}

export type Pregunta=PreguntaSimple | PreguntaConSiNo | PreguntaConOpciones | PreguntaConOpcionesMultiples

export type ConjuntoPreguntas= CasilleroBase & {
    tipoc:'CP'
    casillero:IdPregunta
    var_name?:null
    tipovar?:null
    casilleros:Pregunta[]
}

/*
export interface IContenido extends CasilleroBase {
    casilleros:IContenido[]
}
*/

export type Filtro = CasilleroBase & {
    tipoc:'FILTRO'
    casillero:IdFiltro
    var_name?:null
    tipovar?:null
    primera_variable?:null
}

export type ContenidoFormulario=Bloque|Pregunta|ConjuntoPreguntas|Filtro

export type Bloque= CasilleroBase & {
    tipoc:'B'
    casillero:IdBloque
    casilleros:ContenidoFormulario[]
    var_name?:null
    tipovar?:null
}

export type Formulario= CasilleroBase & {
    tipoc:'F'
    casillero:IdFormulario
    formulario_principal:boolean
    casilleros:ContenidoFormulario[]
    var_name?:null
    tipovar?:null
}

export type CasillerosImplementados=Formulario|Bloque|Filtro|ConjuntoPreguntas|Pregunta|OpcionMultiple|Opcion

export type ForPk={vivienda:number, persona:number}

export type Respuestas={
        [pregunta in IdVariable]:Valor
    }

export type EstructuraRowValidator=Structure<IdVariable,IdFin>;

export type ModoDespliegue = 'metadatos'|'relevamiento'|'estricto'

export type CasoState={
    estructura:{
        formularios:{
            [nombreFormulario in IdFormulario]:Formulario
        },
        estructuraRowValidator:EstructuraRowValidator
    },
    mainForm:IdFormulario
    datos:{
        respuestas:Respuestas
    }
    estado:{
        formularioActual:IdFormulario
        modoDespliegue:ModoDespliegue
    },
    formStructureState:FormStructureState<IdVariable,IdFin>
}

