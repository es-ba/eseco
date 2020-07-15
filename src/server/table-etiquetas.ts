"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function etiquetas(context:TableContext):TableDefinition {
    var admin = context.user.rol==='admin';
    return {
        name:'etiquetas',
        elementName:'etiqueta',
        editable:admin,
        fields:[
            {name:'operativo'        , typeName:'text'      , nullable:false, defaultValue:'ESECO201'  },
            {name:'etiqueta'         , typeName:'text'      , nullable:false  },
            {name:'plancha'          , typeName:'text'      },
            {name:'resultado'        , typeName:'text'      },
            {name:'fecha'            , typeName:'date'      },
            {name:'hora'             , typeName:'interval'  },
            {name:'laboratorista'    , typeName:'integer'   },
            {name:'observaciones'    , typeName:'text'      },
            {name:'rectificacion'    , typeName:'integer', defaultDbValue: 0},
        ],
        primaryKey:['etiqueta'],
        foreignKeys:[
            {references:'planchas'     , fields:['plancha']},
            {references:'personal'     , fields:[{source:'laboratorista', target:'persona'}]},
        ],
    };
}

