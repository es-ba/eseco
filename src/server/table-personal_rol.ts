"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function personal_rol(context:TableContext):TableDefinition {
    var esEditable = context.user.rol==='admin' || context.puede.configurar.editar; 
    return {
        name: 'personal_rol',
        elementName: 'rol de la persona',
        editable: esEditable,
        fields: [
            { name: "persona"     , typeName: "integer" },
            { name: "rol"         , typeName: "text"    },
        ],
        primaryKey: ['persona','rol'],
        foreignKeys:[
            {references:'personal', fields:['persona']},
            {references:'roles'   , fields:['rol']    },
        ]
    };
}
