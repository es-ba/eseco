"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

import {tareas} from "./table-tareas";

export function mis_tareas(context:TableContext):TableDefinition {
    return tareas(context, {mis:true});
}

