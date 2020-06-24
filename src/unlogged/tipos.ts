"use strict";
/* TODO: controlar los nombres y tipos de la base
 * atributo
 * producto
 * 
 */


export type Opcion={opcion:number, texto:string, salto:string|null}

export type Pregunta={pregunta:string, texto:string, tipovar:string, opciones?:Opcion[], salto:string|null}

export type FormularioState={
    estructura:{
        preguntas:Pregunta[]
    },
    datos:{
        respuestas:{
            [pregunta:string]:any
        }
    }
}

