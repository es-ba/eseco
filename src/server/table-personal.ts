"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function personal(context:TableContext):TableDefinition {
    var esEditable = context.user.rol === 'admin'||context.puede.configurar.editar;
    return {
        name: 'personal',
        elementName: 'persona',
        editable: esEditable,
        fields: [
            { name: "persona"     , typeName: "integer" },
            { name: "nombre"      , typeName: "text"    ,isName:true},
            { name: "apellido"    , typeName: "text"    ,isName:true},
            { name: "rol"         , typeName: "text"    ,editable:false, inTable:false},
            { name: "cuit"        , typeName: "text"    },
            { name: "usuario"     , typeName: "text"    },
            { name: "activo"      , typeName: "boolean" },
            { name: "recepcionista", typeName: "integer" },
        ],
        primaryKey: ['persona'],
        foreignKeys:[
            {references:'personal', fields:[{source:'recepcionista', target:'persona'}], alias:'recepcionista', }
        ],
        detailTables:[
            {table:'personal_rol', fields:['persona'], abr:'R', label:'roles', refreshParent:true}
        ],
        sql:{
            fields:{
                rol:{
                    expr:`(select string_agg(rol, ', ') from personal_rol where persona=personal.persona)`
                }
            }
        }
    };
}
