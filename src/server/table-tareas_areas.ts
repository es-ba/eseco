"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function tareas_areas(context:TableContext):TableDefinition {
    var be=context.be;
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';
    return {
        name:'tareas_areas',
        editable:puedeEditar,
        fields:[
            {name:'tarea'            , typeName:'text'},
            {name:'area'             , typeName:'integer'},
            {name:'persona'          , typeName:'text'},
            {name:'accion'           , typeName:'text'},
            {name:'fecha_asignacion' , typeName:'date'},
        ],
        primaryKey:['tarea','area'],
        foreignKeys:[
            {references:'tareas', fields:['tarea']},
            {references:'areas',  fields:['area']},
        ],
        detailTables:[
            {table:'tareas_tem'       , fields:['tarea'], abr:'T', refreshParent:true},
        ],
        sql:{
            insertIfNotUpdate:true,
            from:`(
                select t.tarea, a.area
                    from tareas t, areas a
            )`
        }
    };
}

