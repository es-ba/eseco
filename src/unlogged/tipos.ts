"use strict";
/* TODO: controlar los nombres y tipos de la base
 * atributo
 * producto
 * 
 */

export type IdVariable = 'v1'|'v2'|'etc...'
export type IdPregunta = 'V1'|'V2'|'etc...'
export type IdBloque = 'B1'|'B2'|'etc...'
export type IdFormulario = 'F1'|'F2'|'etc...'
export type IdFiltro = 'FILTRO1' | 'FILTRO2' | 'etc...'
export type IdCasillero = IdVariable | IdPregunta | IdBloque | IdFormulario | IdFiltro | number
export type IdFin = 'FIN'
export type IdDestino = IdPregunta | IdBloque | IdFin | IdFiltro 
 
export type CasilleroBase = {
    tipoc:'P'|'O'|'F'|'CP'|'B'|'OM'|'FILTRO', 
    casillero:IdCasillero, 
    nombre:string, 
    salto:IdDestino|IdFin|null,
    ver_id:string|null,
    despliegue:string|null,
    aclaracion:string|null
}

export type Opcion=CasilleroBase & {
    tipoc:'O', 
    casilleros:PreguntaSimple[] 
}

export type OpcionSi=Opcion & {
    casillero:1,
    nombre:'Sí'
    casilleros:PreguntaSimple[] 
}

export type OpcionNo=Opcion & {
    casillero:2,
    nombre:'No'
    casilleros:PreguntaSimple[] 
}

export type OpcionMultiple=CasilleroBase & {
    tipoc:'OM',
    casilleros:[OpcionSi, OpcionNo]
}

export type PreguntaBase = CasilleroBase & {
    tipoc:'P', 
    casillero:IdPregunta
}

export type TipoVariables = 'texto'|'numero'|'fecha'

export type PreguntaSimple = PreguntaBase & {
    tipovar:TipoVariables,
    longitud:string,
    casilleros: []
}

export type PreguntaConSiNo = PreguntaBase & {
    tipovar:'si_no',
    casilleros: [OpcionSi, OpcionNo]
}

export type PreguntaConOpciones = PreguntaBase & {
    tipovar:'opciones',
    casilleros: Opcion[]
}

export type PreguntaConOpcionesMultiples = PreguntaBase & {
    tipovar:null,
    casilleros: OpcionMultiple[]
}

export type Pregunta=PreguntaSimple | PreguntaConSiNo | PreguntaConOpciones | PreguntaConOpcionesMultiples

export type ConjuntoPreguntas= CasilleroBase & {
    tipoc:'CP',
    casilleros:Pregunta[]
}

export interface IContenido extends CasilleroBase {
    casilleros:IContenido[]
}

export type Filtro = CasilleroBase & {
    tipoc:'FILTRO',
    casillero:IdFiltro
}

export type ContenidoFormulario=Bloque|Pregunta|ConjuntoPreguntas|Filtro

export type Bloque= CasilleroBase & {
    tipoc:'B', 
    casillero:IdBloque,
    casilleros:ContenidoFormulario[]
}

export type Formulario= CasilleroBase & {
    tipoc:'F', 
    casillero:IdFormulario, 
    formulario_principal:boolean,
    casilleros:ContenidoFormulario[]
}

export type CasillerosImplementados=Formulario|Bloque|Filtro|ConjuntoPreguntas|Pregunta|OpcionMultiple|Opcion

export type CasoState={
    estructura:{
        formularios:{
            [nombreFormulario in IdFormulario]:Formulario
        }
    },
    mainForm:IdFormulario,
    datos:{
        respuestas:{
            [pregunta:string]:any
        }
    }
    estado:{
        formularioActual:IdFormulario
    }
}
