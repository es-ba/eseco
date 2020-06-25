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
export type IdCasillero = IdVariable | IdPregunta | IdBloque | IdFormulario
export type IdFin = 'FIN'
export type IdDestino = IdPregunta | IdBloque | IdFin

export type DataCasillero = {
    tipoc:'P'|'O'|'F'|'CP'|'B'|'OM', 
    casillero:IdCasillero, 
    nombre:string, 
    salto:IdDestino|IdFin|null,
    ver_id:string|null,
    despliegue:string|null
}

export type Opcion={
    data:DataCasillero & {tipoc:'O'}
    childs:PreguntaSimple[]
}

export type OpcionMultiple={
    data:DataCasillero & {tipoc:'OM'}
    childs:Opcion[]
}

export type DataPreguntaBase = DataCasillero & {tipoc:'P', casillero:IdCasillero}

export type TipoVariables = 'texto'|'numero'|'fecha'

export type PreguntaSimple = {
    data: DataPreguntaBase & {tipovar:TipoVariables}
    childs: []
}

export type PreguntaConOpciones = {
    data: DataPreguntaBase & {tipovar:'opcion'}
    childs: Opcion[]
}

export type PreguntaConOpcionesMultiples = {
    data: DataPreguntaBase & {tipovar:'multiple'}
    childs: OpcionMultiple[]
}

export type Pregunta=PreguntaSimple | PreguntaConOpciones | PreguntaConOpcionesMultiples

export type ConjuntoPreguntas={
    data:DataCasillero & {tipoc:'CP'}
    childs:Pregunta[]
}

export interface IContenido{
    data:DataCasillero
    childs:IContenido[]
}

export type ContenidoFormulario=Bloque|Pregunta|ConjuntoPreguntas

export type Bloque={
    data:DataCasillero & {tipoc:'B', casillero:IdBloque}
    childs:ContenidoFormulario[]
}

export type Formulario={
    data:DataCasillero & {tipoc:'F', casillero:IdFormulario, formulario_principal:boolean}
    childs:ContenidoFormulario[]
}

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
