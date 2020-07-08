"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

import {tem} from "./table-tem";
import { changing } from "best-globals";

export function tem_seleccionable(context:TableContext):TableDefinition {
    var tableDef=tem(context);
    tableDef.name='tem_seleccionable';
    tableDef.tableName='tem';
    tableDef.editable=true;
    tableDef.detailTables=[];
    tableDef.fields.splice(2,0,{name: "seleccionar", editable:true, typeName:'boolean', inTable:false, clientSide:'seleccionarCaso'});
    tableDef.sql=changing(tableDef.sql,{
        isTable:false
    });
    return tableDef;
}