"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function etiquetas(context:TableContext):TableDefinition {
    var admin = context.user.rol==='admin';
    var esCoor = context.forDump || context.puede.campo.administrar;
    return {
        name:'etiquetas',
        elementName:'etiqueta',
        editable:esCoor,
        fields:[
            {name:'operativo'        , typeName:'text'      ,editable:false , nullable:false, defaultValue:'ESECO201'  },
            {name:'etiqueta'         , typeName:'text'      ,editable:false , nullable:false  },
            {name:'plancha'          , typeName:'text'      ,editable:esCoor },
            {name:'resultado'        , typeName:'text'      ,editable:false },
            {name:'fecha'            , typeName:'date'      ,editable:false },
            {name:'hora'             , typeName:'interval'  ,editable:false },
            {name:'laboratorista'    , typeName:'text'      ,editable:false },
            {name:'observaciones'    , typeName:'text'      ,editable:false },
			{name:'rectificacion'    , typeName:'integer'   ,editable:false, defaultDbValue: 0}
        ],
        primaryKey:['etiqueta'],
        foreignKeys:[
            {references:'planchas'     , fields:['plancha']},
            {references:'usuarios'     , fields:[{source:'laboratorista', target:'usuario'}]},
        ],
    };
}

