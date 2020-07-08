"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function tem_estados(context:TableContext):TableDefinition {
    var admin = context.user.rol==='admin';
    return {
        name:'tem_estados',
        elementName:'cambio de estado de la tem',
        editable:admin,
        fields:[
            {name:'operativo'          , typeName:'text'     },
            {name:'estado'             , typeName:'text'     },
            {name:'enc'                , typeName:'text'     },
            {name:'cuando'             , typeName:'timestamp'},
            {name:'carga'              , typeName:'date'     },
            {name:'carga_persona'      , typeName:'integer'  },
            {name:'carga_rol'          , typeName:'text'     },
            {name:'carga_observaciones', typeName:'text'     },
        ],
        primaryKey:['operativo', 'estado', 'enc', 'cuando'],
        foreignKeys:[
            {references:'tem'     , fields:['operativo','enc']},
            {references:'estados' , fields:['estado']},
            {references:'roles'   , fields:[{source:'carga_rol'    , target:'rol'}]},
            {references:'personal', fields:[{source:'carga_persona', target:'persona'}]},
        ],
        constraints:[
            // {constraintType:'unique', fields:['operativo', 'carga', 'carga_persona', 'enc']}
        ]
    };
}

