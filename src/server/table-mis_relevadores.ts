"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function mis_relevadores(context:TableContext):TableDefinition {
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';
    return {
        name:'mis_relevadores',
        elementName:'relevador',
        editable:false,
        fields:[
            { name: "relevador"     , typeName: "text"    },
            { name: "nombre"        , typeName: "text"    ,isName:true},
            { name: "apellido"      , typeName: "text"    ,isName:true},
            { name: "cuit"          , typeName: "text"    },
            { name: "usuario"       , typeName: "text"    },
            { name: "activo"        , typeName: "boolean" },
            { name: "recepcionista" , typeName: "text" },
            {name:'telefono'         , typeName:'text'    , title:'teléfono'},
            {name:'interno'          , typeName:'text'                      },
            {name:'mail'             , typeName:'text'                      },
            {name:'mail_alternativo' , typeName:'text'                      },
            {name:'carga_hoy'               , typeName:'integer' , editable:false  },
            {name:'carga_1'                 , typeName:'integer' , editable:false  },
            {name:'carga_2'                 , typeName:'integer' , editable:false  },
            {name:'carga_3'                 , typeName:'integer' , editable:false  },
            {name:'reas_m'                  , typeName:'integer' , editable:false  },
            {name:'no_reas'                 , typeName:'integer' , editable:false  },
            {name:'incompletas'             , typeName:'integer' , editable:false  },
            {name:'vacias'                  , typeName:'integer' , editable:false  },
            {name:'reas_dia'                , typeName:'decimal' , editable:false  , title:'reas/día'},
        ],
        primaryKey:['relevador'],
        detailTables:[
            {table:'areas'           , fields:['relevador'], abr:'A'},
            {table:'tem_recepcion'   , fields:['relevador'], abr:'E'},
        ],
        sql:{
            isTable:false,
            from:`(
                select u.idper as relevador, u.*, t.*
                    from usuarios u, lateral (
                        select sum(case when a.fecha = current_date then 1 else null end) as carga_hoy,
                                sum(case when a.fecha = current_date + interval '1 day' then 1 else null end) as carga_1,
                                sum(case when a.fecha = current_date + interval '2 day' then 1 else null end) as carga_2,
                                sum(case when a.fecha = current_date + interval '3 day' then 1 else null end) as carga_3,
                                sum(case when t.rea_m = 1 then 1 else null end) as reas_m,
                                sum(case when t.resumen_estado = 'no rea' then 1 else null end) as no_reas,
                                sum(case when t.resumen_estado in ('incompleta', 'con problemas') then 1 else null end) as incompletas,
                                sum(case when t.resumen_estado in ('vacia') then 1 else null end) as vacias,
                                sum(case when a.fecha is not null and t.rea_m = 1 then 1 else null end)*1.0 / nullif(count(distinct a.fecha),0) as reas_dia
                            from tem t inner join areas a using (area)
                            where t.relevador = u.idper
                    ) t
                    ${context.user.rol=='recepcionista'?`where recepcionista = ${context.be.db.quoteLiteral(context.user.idper)}`:''}
            )`
        }
    };
}
