"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function tareas(context:TableContext):TableDefinition {
    var be=context.be;
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';
    return {
        name:'tareas',
        elementName:'tarea',
        editable:puedeEditar,
        fields:[
            {name:'tarea', typeName:'text'},
            {name:'nombre', typeName:'text'}
        ],
        primaryKey:['tarea'],
        foreignKeys:[
        ],
        detailTables:[
            {table:'tareas_areas'     , fields:['tarea'], abr:'A', refreshParent:true},
            {table:'tareas_tem'       , fields:['tarea'], abr:'T', refreshParent:true},
        ],
    };
}

