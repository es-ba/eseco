"use strict";
                
import {TableDefinition, TableContext} from "./types-eseco";
import {viviendas} from "./table-viviendas";

export function viviendas_extendida(context:TableContext):TableDefinition {
    var tableDef=viviendas(context);
    tableDef.name= 'viviendasExt';
    tableDef.title= 'ViviendasExtendida';
    tableDef.tableName='viviendas_extendida';
    tableDef.detailTables=[
        {
            "table": "personas_extendida",
            "fields": [
                "operativo",
                "enc"
            ],
            "abr": "p"
        }
    ];
    tableDef.fields.splice(8,0,{name: "areaup", editable:false, typeName:'text', inTable:false}
        , {name: "id_marco", editable:false, typeName:'bigint', inTable:false}
        , {name: "estrato_ing", editable:false, typeName:"integer", inTable:false}
        , {name: "tipo_domicilio", editable:false, typeName:"integer", inTable:false}
        , {name: "edad_sel_rango", editable:false, typeName:"integer", inTable:false}
    );
//    tableDef.sql=changing(tableDef.sql,{
//        isTable:false
//    });
    return tableDef;
}

