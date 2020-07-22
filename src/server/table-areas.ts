"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function areas(context:TableContext):TableDefinition {
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';
    return {
        name:'areas',
        elementName:'area',
        editable:puedeEditar,
        fields:[
            /*
            {
                "name": "operativo",
                "editable": false,
                "typeName": "text",
                "nullable": false,
                "defaultValue": 'ESECO'
            },
            */    
            { 
                name: 'area',
                typeName: 'integer',
                nullable: false,
                editable: false
            },
            {name:'recepcionista'           , typeName:'text', references:'recepcionistas'},
            {name:'relevador'               , typeName:'text', references:'mis_relevadores'},
            {name:'operacion_area'          , typeName:'text'                      },
            {name:'fecha'                   , typeName:'date'                      },
            {name:'observaciones_hdr'       , typeName:'text'                      },
            {name:'cargado'                 , typeName:'boolean' , editable:false  },
            {name:'cargadas'                , typeName:'integer' , editable:false  },
            {name:'reas'                    , typeName:'integer' , editable:false  },
            {name:'no_reas'                 , typeName:'integer' , editable:false  },
            {name:'incompletas'             , typeName:'integer' , editable:false  },
            {name:'vacias'                  , typeName:'integer' , editable:false  },
            {name:'inhabilitadas'           , typeName:'integer' , editable:false  },
            {name:'verificado_rec'          , typeName:'text'                      },
            {name:'obs_recepcionista'       , typeName:'text'                      },
            {name:'cargadas_bkp'            , typeName:'integer' , editable:false  },
            {name:'reas_bkp'                , typeName:'integer' , editable:false  },
            {name:'no_reas_bkp'             , typeName:'integer' , editable:false  },
            {name:'incompletas_bkp'         , typeName:'integer' , editable:false  },
            {name:'vacias_bkp'              , typeName:'integer' , editable:false  },
            {name:'inhabilitadas_bkp'       , typeName:'integer' , editable:false  },
        ],
        primaryKey:['area'],
        foreignKeys:[
            //{references:'operativos', fields:['operativo']},
            {references:'operaciones', fields:[{source:'operacion_area', target:'operacion'}]},
            {references:'usuarios', fields:[{source:'relevador'    , target:'idper'}], alias:'per_enc', displayFields:[]},
            {references:'usuarios', fields:[{source:'recepcionista', target:'idper'}], alias:'per_recep', displayFields:[]},
        ],
        softForeignKeys:[
            //{references:'operativos', fields:['operativo']},
            {references:'relevadores', fields:[{source:'relevador', target:'persona'}]},
        ],
        detailTables:[
            {table:'tem_recepcion'     , fields:['area'], abr:'E'},
        ],
        sql:{
            isTable:true,
            from:` 
            (select a.area, a.recepcionista, a.relevador, a.operacion_area, a.fecha, a.observaciones_hdr,  
                  t.cargado, t.cargadas, t.reas, t.no_reas, t.incompletas, t.vacias, t.inhabilitadas, a.verificado_rec, a.obs_recepcionista,
                  a.cargadas_bkp, a.reas_bkp, a.no_reas_bkp, a.incompletas_bkp, a.vacias_bkp, a.inhabilitadas_bkp
                from areas a, lateral(
                    select bool_or( cargado_dm is not null )       as cargado , 
                        count( cargado_dm )                            as cargadas,
                        sum ( rea_m )                                  as reas,
                        count(*) filter ( where etiqueta is null and resumen_estado='no rea')       as no_reas,
                        count(*) filter ( where resumen_estado in ('incompleto', 'con problemas') ) as incompletas, 
                        count(*) filter ( where etiqueta is null and resumen_estado in ('vacio' ) ) as vacias,
                        count(*) filter ( where habilitada is not true )    as inhabilitadas
                        from tem
                        where area=a.area
                ) t
            )`
        }

    };
}

