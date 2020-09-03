"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function comunas(context:TableContext):TableDefinition {
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';
    return {
        name:'comunas',
        elementName:'comuna',
        editable:puedeEditar,
        fields:[
            {name:'comuna'                  , typeName:'intger'},
            {name:'zona'                    , typeName:'text'},
            {name:'grupo'                   , typeName:'text'},
            {name:'variable'                , typeName:'text'},
            {name:'valor'                   , typeName:'text'},
        ],
        primaryKey:['comuna'],
    };
}

