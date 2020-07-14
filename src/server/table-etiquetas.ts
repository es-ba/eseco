"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function etiquetas(context:TableContext):TableDefinition {
    var admin = context.user.rol==='admin';
    return {
        name:'etiquetas',
        elementName:'etiqueta',
        editable:false,
        fields:[
            {name:'operativo'        , typeName:'text'      , nullable:false, defaultValue:'ESECO201'  },
            {name:'etiqueta'         , typeName:'text'      , nullable:false  },
            {name:'plancha'          , typeName:'text'      },
            {name:'observaciones'    , typeName:'text'      },
        ],
        primaryKey:['etiqueta'],
        foreignKeys:[
            {references:'planchas'     , fields:['plancha']},
        ],
    };
}

