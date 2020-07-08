"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function estados(context:TableContext):TableDefinition {
    var admin = context.user.rol === 'admin';
    return {
        name: 'estados',
        elementName: 'estado',
        editable: admin,
        fields: [
            { name: "estado"         , typeName: "text"                       },
            { name: "orden"          , typeName: "integer"                    },
            { name: "nombre"         , typeName: "text"                       },
            { name: "editable"       , typeName: "boolean"                    },
            { name: 'rol'            , typeName: 'text'                       },
            { name: 'tipo_estado'    , typeName: 'text'                       },
        ],
        primaryKey: ['estado'],
        foreignKeys: [
            {references:'roles'         ,fields:['rol']        },
            {references:'tipos_estados' ,fields:['tipo_estado']}
        ],
        detailTables:[
            {table:'estados_roles',fields:['estado'], abr:'R'}
        ],
    };
}
