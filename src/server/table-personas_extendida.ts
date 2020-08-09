"use strict";
                
import {TableDefinition, TableContext} from "./types-eseco";
import {personas} from "./table-personas";

export function personas_extendida(context:TableContext):TableDefinition {
    return personas(context, {extendida:true});
}
