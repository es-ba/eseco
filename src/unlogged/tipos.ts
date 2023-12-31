"use strict";
/* TODO: controlar los nombres y tipos de la base
 * atributo
 * producto
 * 
 */

import {FormStructureState, Structure, Feedback} from "row-validator";

export type IdOpcion = number
export type IdVariable = 'v1'|'v2'|'personas'|'etc...'
export type IdPregunta = 'P1'|'P2'|'etc...'
export type IdBloque = 'B1'|'B2'|'etc...'
export type IdFormulario = 'F1'|'F2'|'etc...'
export type IdBotonFormulario = 'BF:F1'|'BF:F2'|'etc...'
export type IdConsistencia = 'CONS1'|'CONS2'|'etc...'
export type IdFiltro = 'FILTRO1' | 'FILTRO2' | 'etc...'
export type IdCasillero = IdVariable | IdPregunta | IdBloque | IdFormulario | IdFiltro | IdOpcion
export type IdFin = never // TODO: poder poner 'FIN'
export type IdDestino = IdPregunta | IdBloque | IdFin | IdFiltro 
export type Valor = string|number|Date|null;
export type TipocDestinos = 'P'|'CP'|'B'|'FILTRO'|'BF'
export type Tipoc = TipocDestinos | 'F'|'O'|'OM'|'CONS'

export type IdTarea = 'rel'|'sen'|'sup';

export type FeedbackVariable = Feedback<IdVariable, IdFin>

export type TipoVariables = 'texto'|'numero'|'fecha'

export type Despliegue = 'calculada'|'libre'|'no_leer'|'leer'

export type CasilleroBase = {
    tipoc:Tipoc
    casillero:IdCasillero
    nombre:string
    salto:IdDestino|IdFin|null
    ver_id:string|null
    despliegue:Despliegue|null
    aclaracion:string|null
    primera_variable?:IdVariable|null
    var_name?:IdVariable|null
    var_name_especial?:string|null
    tipovar?:TipoVariables|'opciones'|'si_no'|null
    casilleros?:CasillerosImplementados[]|null
    expresion_habilitar?:string
    unidad_analisis?:string|null
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
    optativo:boolean|null
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

export type ContenidoFormulario=Bloque|Pregunta|ConjuntoPreguntas|Filtro|BotonFormulario|Consistencia

export type Bloque = CasilleroBase & {
    tipoc:'B'
    casillero:IdBloque
    casilleros:ContenidoFormulario[]
    var_name?:null
    tipovar?:null
}

export type Consistencia = CasilleroBase & {
    tipoc:'CONS'
    casillero:IdConsistencia
    var_name?:null
    tipovar?:null
    primera_variable?:null
}

export type BotonFormulario = CasilleroBase & {
    tipoc:'BF'
    casillero:IdBotonFormulario
    var_name?:null
    tipovar?:null
    primera_variable?:null
}

export type Formulario = CasilleroBase & {
    tipoc:'F'
    casillero:IdFormulario
    formulario_principal:boolean
    casilleros:ContenidoFormulario[]
    var_name?:null
    tipovar?:null
}

export type CasillerosImplementados=Formulario|Bloque|Filtro|ConjuntoPreguntas|Pregunta|OpcionMultiple|Opcion|BotonFormulario|Consistencia

export type ForPk={vivienda:IdCaso, formulario:IdFormulario, persona?:number}
export type PlainForPk='{"vivienda":"10202","formulario":"F:F1","persona":null}'|'etc...';

export type Respuestas={
        [pregunta in IdVariable]:Valor
    }

export type IdCaso='10202'|'10902'|'10909'|'etc...' // el caso es una vivienda

export type TEM = {
    nomcalle:string
    sector:string
    edificio:string
    entrada:string
    nrocatastral:string
    piso:string	
    departamento:string
    habitacion:string
    casa:string
    prioridad:1|2|3
    observaciones:string
    seleccionado:number,
    seleccionado_anterior:{
        apellido: string,
        nombre: string,
        tipo_documento: string,
        tipo_documento_esp: string,
        pais_documento: string,
        numero_documento: string,
        celular: string,
        email: string,
        numero_linea_vivienda: string,
        tel_alternativo: string,
        sexo: string,
        edad: string
    }
    cita: string,
    carga:string
}

export type ResumenEstado = 'vacio' | 'con problemas' | 'incompleto' | 'ok' | 'no rea' | 'cita pactada';

export type InfoTarea= {
    tarea: IdTarea
    notas:string
    fecha_asignacion:Date
    asignado:string
}

export type Tareas = {
    [tarea in IdTarea]:InfoTarea
}

export type Visita={
    fecha: string | null
    hora: string | null
    idper: string | null
    observaciones: string | null
}

export type DatosVivienda= {
    respuestas: Respuestas
    tareas: Tareas
    tem: TEM
    resumenEstado: ResumenEstado
    visitas: Visita[]
    dirty?:boolean,
}

export type HojaDeRuta={
    [idCaso in IdCaso]: DatosVivienda
}

export type IdCarga="2020-07-07"|"2020-07-08"

export type EstadoCarga='resumen'|'relevamiento'|'recibo'

export type Carga={
    fecha: Date
    estado_carga: EstadoCarga
    necesarias: number
    observaciones: string
}

export type Cargas={
    [idCarga in IdCarga]: Carga
}

export type EstructuraRowValidator=Structure<IdVariable,IdFin>;

export type ModoDespliegue = 'metadatos'|'relevamiento'|'PDF'

export type InfoFormulario={
    casilleros:Formulario, // casilleros aplanados
    estructuraRowValidator:EstructuraRowValidator // estructura de variables para el RowValidator
}

export type TareasEstructura={
    [idTarea in IdTarea]:{
        resultados:{
            [idResultado in IdResultado]:{
                descripcion:string
            }
        }
    }
}

export type CasoState={
    estructura:{
        formularios:{ 
            [nombreFormulario in IdFormulario]:InfoFormulario
        }
        tareas:TareasEstructura
        mainForm:IdFormulario
    }
    datos:{
        hdr:HojaDeRuta
        token?:string
        persona:string
        tarea:IdTarea
        num_sincro?:number
        idper:string
        cargas: Cargas
        soloLectura?: boolean
    }
    opciones:{ // datos de navegación que elije el usuario
        forPk:ForPk|null // índice dentro de las unidades de análisis. Null = en hoja de ruta
        modoDespliegue:ModoDespliegue
        bienvenido:boolean
        modoDirecto:boolean
    },
    modo:{ // no se persiste
        demo:boolean
    }
    feedbackRowValidator:{  // no se persiste
        [formulario in PlainForPk]:FormStructureState<IdVariable,IdFin> // resultado del rowValidator para estado.forPk
    }
}

export type EtiquetaOpts={
    dgeyc: string,
    operativo: string,
    etiqueta: string,
    plancha: string
}
