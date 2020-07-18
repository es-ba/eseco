"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function roles_subordinados(context:TableContext):TableDefinition {
    var admin = context.user.rol==='admin';
    return {
        name:'roles_subordinados',
        elementName:'roles_subordinados',
        editable:admin,
        fields:[
            {name:'rol'              , typeName:'text'      , nullable:false  },
            {name:'rol_subordinado'  , typeName:'text'      , nullable:false  },
        ],
        primaryKey:['rol','rol_subordinado'],
        detailTables:[
        ],
        foreignKeys:[
            {references:'roles'    , fields:['rol']              , onDelete: 'cascade'},
        //    {references:'roles'  , fields:[{source:'rol_subordinado', target:'rol'}], alias: 'rol_subordinado rol fk'},
        ]
    };
}
