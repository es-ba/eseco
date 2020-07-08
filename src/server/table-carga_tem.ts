"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

import {tem} from "./table-tem";
import { changing } from "best-globals";

export function carga_tem(context:TableContext):TableDefinition {
    var tableDef=tem(context);
    tableDef.name='carga_tem';
    tableDef.tableName='tem';
    tableDef.editable=true;
    tableDef.detailTables=tableDef.detailTables.filter(t=>t.table=='inconsistencias')||[];
    tableDef.fields.push({name: "his_persona", typeName:'integer', inTable:false});
    tableDef.fields.push({name: "his_rol"    , typeName:'text'   , inTable:false});
    tableDef.fields.push({name: "his_fecha"  , typeName:'date'   , inTable:false});
    tableDef.sql=changing(tableDef.sql,{
        isTable:false,
        from:`(
            select tem.*, 
                e.carga_persona as his_persona, 
                e.carga_rol     as his_rol,
                e.carga   as his_carga
              from ${tableDef.sql.from} tem 
              inner join (
                        select operativo, enc, carga_persona, carga_rol, carga, carga_observaciones
                            from tem_estados inner join estados using (estado)
                            where tipo_estado='cargado'
                            group by operativo, enc, carga_persona, carga_rol, carga
                    ) e using(operativo, enc)
        )`
    });
    return tableDef;
}