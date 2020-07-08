"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function carga_fechas(context:TableContext):TableDefinition {
    var admin = context.user.rol==='admin' || context.user.rol==='recepcionista' || context.user.rol==='coordinador'  || context.user.rol==='subcoordinador' ; 
    return {
        name:'carga_fechas',
        elementName:'fecha',
        editable:admin,
        fields:[
            {name:'carga'     , typeName:'date'   , editable:false },
            {name:'encuestas'       , typeName:'integer', editable:false },
            {name:'mios'            , typeName:'boolean', clientSide:'mios', label:'míos'},
        ],
        primaryKey:['carga'],
        detailTables:[
            {table:'cargas'         , fields:['carga',{source:'mios', target:'mio'}], abr:'P', label:'personal'},
        ],
        sql:{
            from:`(
                select carga, 
                        count(*) as encuestas 
                    from tem_estados inner join estados using(estado)
                    where carga is not null and tipo_estado = 'cargado'
                    group by carga 
                    order by carga desc 
            )`,
            isTable:false
        }
    };
}

