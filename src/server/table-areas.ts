"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function areas(context:TableContext):TableDefinition {
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';
    return {
        name:'areas',
        elementName:'area',
        editable:puedeEditar,
        fields:[
            {name:'area'                    , typeName:'integer'                , nullable:false  },
            {name:'recepcionista'           , typeName:'text'                      },
            {name:'relevador'               , typeName:'text'                      },
            {name:'operacion_area'          , typeName:'text'                      },
            {name:'fecha'                   , typeName:'date'                      },
            {name:'observaciones_hdr'       , typeName:'text'                      },
            {name:'cantidad_cargadas'       , typeName:'integer' , editable:false  },
            {name:'reas'                    , typeName:'integer' , editable:false  },
            {name:'no_reas'                 , typeName:'integer' , editable:false  },
            {name:'incompletas'             , typeName:'integer' , editable:false  },
            {name:'vacias'                  , typeName:'integer' , editable:false  },
            {name:'inhabilitadas'           , typeName:'integer' , editable:false  },
            {name:'obs_recepcionista'       , typeName:'text'                      },
            {name:'cantidad_cargadas_bkp'   , typeName:'integer' , editable:false  },
            {name:'reas_bkp'                , typeName:'integer' , editable:false  },
            {name:'no_reas_bkp'             , typeName:'integer' , editable:false  },
            {name:'incompletas_bkp'         , typeName:'integer' , editable:false  },
            {name:'vacias_bkp'              , typeName:'integer' , editable:false  },
            {name:'inhabilitadas_bkp'       , typeName:'integer' , editable:false  },
        ],
        primaryKey:['area'],
        foreignKeys:[
            {references:'operaciones', fields:[{source:'operacion_area', target:'operacion'}]},
            {references:'usuarios', fields:[{source:'relevador'    , target:'idper'}], alias:'per_enc', displayFields:[]},
            {references:'usuarios', fields:[{source:'recepcionista', target:'idper'}], alias:'per_recep', displayFields:[]},
        ],
        detailTables:[
            {table:'tem'     , fields:['area'], abr:'E'},
        ],
    };
}

