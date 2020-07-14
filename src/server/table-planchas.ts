"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function planchas(context:TableContext):TableDefinition {
    var admin = context.user.rol==='admin';
    return {
        name:'planchas',
        elementName:'plancha',
        editable:false,
        fields:[
            {name:'plancha'          , typeName:'text'      , nullable:false  },
            {name:'impresa'          , typeName:'date'      },
            {name:'relevador'        , typeName:'text'      },
            {name:'observaciones'    , typeName:'text'      },
        ],
        primaryKey:['plancha'],
        detailTables:[
            {table:'etiquetas'     , fields:['plancha'], abr:'E'},
        ],
    };
}

