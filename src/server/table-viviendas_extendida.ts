"use strict";
                
import {TableDefinition, TableContext} from "./types-eseco";
import {viviendas} from "./table-viviendas";

export function viviendas_extendida(context:TableContext):TableDefinition {
    return viviendas(context, {extendida:true});
}

