"use strict";
                
import {TableDefinition, TableContext} from "./types-eseco";
import {personas} from "./table-personas";

export function personas_extendida(context:TableContext):TableDefinition {
    var tableDef=personas(context);
    tableDef.name= 'personasExt';
    tableDef.title= 'personasExtendida';
    tableDef.tableName='personas_extendida';
    tableDef.detailTables=[];
    tableDef.fields.splice(2,0
        , {name: "tipo_domicilio", editable:false, typeName:"integer", inTable:false}
        , {name: "area", editable:false, typeName:'integer', inTable:false}
        , {name: "areaup", editable:false, typeName:'text', inTable:false}
        , {name: "id_marco", editable:false, typeName:'bigint', inTable:false}
        , {name: "estrato_ing", editable:false, typeName:"integer", inTable:false}
        , {name: "nrocomuna", editable:false, typeName:"integer", inTable:false}
        , {name: "p11", editable:false, typeName:"integer", inTable:false}
    );
    return tableDef;
}
