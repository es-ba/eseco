"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function cargas(context:TableContext):TableDefinition {
    var q = context.be.db.quoteLiteral;
    var admin = context.user.rol==='admin';
    return {
        name:'cargas',
        elementName:'cargas',
        editable:admin,
        fields:[
            {name:'carga'           , typeName:'date'   },
            {name:'carga_persona'   , typeName:'integer'},
            {name:'carga_rol'       , typeName:'text'   },
            {name:'encuestas'       , typeName:'integer'},
            {name:'mio'             , typeName:'boolean', label:'mío'},
        ],
        primaryKey:['carga', 'carga_persona'],
        softForeignKeys:[
            {references:'personal', fields:[{source:'carga_persona',target:'persona'}]},
            {references:'roles'   , fields:[{source:'carga_rol'    ,target:'rol'}]}
        ],
        detailTables:[
            {table:'carga_tem'    , fields:[
                /*'operativo'*/
                {source:'carga'  , target:'his_carga'  },
                {source:'carga_persona', target:'his_persona'},
                {source:'carga_rol'    , target:'his_rol'    },
            ], abr:'E', label:'encuestas'},
        ],
        sql:{
            from:`(
                select carga, carga_persona, carga_rol, 
                        count(*) as encuestas,
                        (recepcionista.usuario=${q(context.user.usuario)}) is true as mio 
                    from tem_estados inner join personal on carga_persona=persona
                         inner join estados using(estado)
                         left join personal as recepcionista on recepcionista.persona = personal.recepcionista
                    where carga is not null and tipo_estado = 'cargado'
                    group by carga, carga_persona, carga_rol, recepcionista.usuario 
                    order by carga, carga_persona, carga_rol 
            )`,
            isTable:false
        }
    };
}

