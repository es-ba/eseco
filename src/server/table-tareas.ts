"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function tareas(context:TableContext, opts:any):TableDefinition {
    var opts=opts||{};
    var mis=opts.mis?'mis_':'';
    var be=context.be;
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';
    return {
        name:`${mis}tareas`,
        tableName:`tareas`,
        elementName:'tarea',
        editable:puedeEditar,
        fields:[
            {name:'tarea', typeName:'text'},
            {name:'nombre', typeName:'text'}
        ],
        primaryKey:['tarea'],
        detailTables:[
            {table:`${mis}tareas_areas`     , fields:['tarea'], abr:'A', refreshParent:true},
            {table:`${mis}tareas_tem`       , fields:['tarea'], abr:'T', refreshParent:true},
            // tareas_resultados
        ]
    };
}

