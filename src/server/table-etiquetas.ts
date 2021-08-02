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
            {name:'operativo'               , typeName:'text'      ,editable:false , nullable:false, defaultValue:'ESECO211'  },
            {name:'etiqueta'                , typeName:'text'      ,editable:false , nullable:false  },
            {name:'plancha'                 , typeName:'text'      ,editable:esCoor },
            {name:'resultado_s'             , typeName:'text'      ,editable:false },
            {name:'resultado_n'             , typeName:'text'      ,editable:false },
            {name:'resultado_d'             , typeName:'text'      ,editable:false },
            {name:'resultado'               , typeName:'text'      ,editable:false },
            {name:'fecha'                   , typeName:'date'      ,editable:false },
            {name:'hora'                    , typeName:'interval'  ,editable:false },
            {name:'laboratorista'           , typeName:'text'      ,editable:false },
            {name:'observaciones'           , typeName:'text'      ,editable:false },
            {name:'ingreso_lab'             , typeName:'timestamp' ,editable:false, visible:false},
            {name:'rectificacion'           , typeName:'integer'   ,editable:false, defaultDbValue: 0},
            {name:'avisado_fecha'           , typeName:'date'      ,editable:false },
            {name:'avisado_quien'           , typeName:'text'      ,editable:false },
            {name:'avisado_observaciones'   , typeName:'text'      ,editable:false }
        ],
        primaryKey:['etiqueta'],
        foreignKeys:[
            {references:'planchas'        , fields:['plancha']},
            {references:'usuarios'        , fields:[{source:'laboratorista', target:'usuario'}]},
            {references:'usuarios'        , fields:[{source:'avisado_quien', target:'usuario'}], alias:'avi'},
            {references:'resultados_test' , fields:['resultado']},
            {references:'resultados_test' , fields:[{source:'resultado_s', target:'resultado'}], alias:'rts'},
            {references:'resultados_test' , fields:[{source:'resultado_n', target:'resultado'}], alias:'rtn'},
            {references:'resultados_test' , fields:[{source:'resultado_d', target:'resultado'}], alias:'rtd'},
        ],
        sql:{
        }
    };
}

