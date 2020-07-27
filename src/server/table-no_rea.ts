"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function no_rea(context:TableContext):TableDefinition {
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';
    return {
        name:'no_rea',
        elementName:'no_rea',
        editable:puedeEditar,
        fields:[
            {name:'no_rea'                  , typeName:'text', references:'recepcionistas'},
            {name:'descripcion'             , typeName:'text', references:'recepcionistas'},
            {name:'grupo'                   , typeName:'text', references:'recepcionistas'},
            {name:'variable'                , typeName:'text', references:'recepcionistas'},
            {name:'valor'                   , typeName:'text', references:'recepcionistas'},
        ],
        primaryKey:['no_rea'],
    };
}

