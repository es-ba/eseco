"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function tareas_tem(context:TableContext):TableDefinition {
    var be=context.be;
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';
    return {
        name:'tareas_tem',
        editable:puedeEditar,
        fields:[
            {name:'tarea'    , typeName:'text'},
            {name:'operativo', typeName:'text'},
            {name:'enc'      , typeName:'text'},
            {name:'persona'  , typeName:'text'}, // va a la hoja de ruta
            {name:'accion'   , typeName:'text'}, // cargar/descargar
            {name:'fecha_asignacion', typeName:'date'}, // cargar/descargar
            {name:'resultado'       , typeName:'text'}, // fk tareas_resultados 
            {name:'fecha_resultado' , typeName:'date'}, // fk tareas_resultados 
            {name:'notas'           , typeName:'date'}, // viene de la hoja de ruta
        ],
        primaryKey:['tarea','operativo','enc'],
        foreignKeys:[
            {references:'tem' , fields:['operativo','enc']},
            {references:'tareas' , fields:['tarea']},
            {references:'usuarios', fields:[{source:'persona', target:'idper'}]},
            {references:'resultados_tarea', fields:['resultado']},
        ],
        detailTables:[
            {table:'tem_recepcion'    , fields:['operativo','enc'], abr:'A', refreshParent:true},
        ],
    };
}

