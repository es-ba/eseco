"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function resultados_tarea(context:TableContext):TableDefinition {
    var be=context.be;
    var puedeEditar = context.forDump || context.user.rol==='admin';
    return {
        name:'resultados_tarea',
        editable:puedeEditar,
        fields:[
            {name:'resultado'    , typeName:'text'},
            {name:'descripcion'  , typeName:'text'},
        ],
        primaryKey:['resultado']
    };
}

