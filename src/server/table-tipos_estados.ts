"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function tipos_estados(context:TableContext):TableDefinition {
    var admin = context.user.rol === 'admin';
    return {
        name: 'tipos_estados',
        elementName: 'tipo_estado',
        editable: admin,
        fields: [
            { name: "tipo_estado"      , typeName: "text" },
        ],
        primaryKey: ['tipo_estado']
    };
}
