"use strict";
/* TODO: controlar los nombres y tipos de la base
 * atributo
 * producto
 * 
 */


type FormularioData ={
}

export function getDefaultOptions(customDataMode:boolean):OpcionesHojaDeRuta{
    return {
        pantallaOpciones: false,
        queVer: 'todos',
        idActual: null,
        relVisPk: null,
        letraGrandeFormulario: false,
        mostrarColumnasFaltantesYAdvertencias: false,
        allForms: false,
        searchString: '',
        verRazon: true,
        compactar: false,
        posHdr: 0,
        posFormularios: [],
        observacionesFiltradasIdx: [],
        observacionesFiltradasEnOtrosIdx: [],
        customDataMode: customDataMode
    }
}

export type FocusOpts={
    moveToElement: boolean
}

export type HojaDeRuta={
    encuestador:string,
    nombreencuestador:string,
    apellidoencuestador:string,
    panel: number,
    tarea: number,
    dispositivo:string,
    fecha_carga:Date,
    informantes:RelInf[]
    opciones: OpcionesHojaDeRuta
}

export type OptsHdr={
    addrParamsHdr?: AddrParamsHdr
    customData?:{
        estructura: Estructura,
        hdr: HojaDeRuta    
    }
}

export type AddrParamsHdr={
    periodo: string | null
    panel: number | null
    tarea: number | null
}