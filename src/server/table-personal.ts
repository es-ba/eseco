"use strict";

import {TableDefinition, TableContext} from "./types-eseco";
import { FieldDefinition } from "rel-enc";
import * as likeAr from "like-ar";

export function personal(context:TableContext):TableDefinition {
    var esEditable = context.user.rol === 'admin'||context.puede.configurar.editar;
    var fields:FieldDefinition[]=[
        { name: "persona"       , typeName: "text" , originalName:"idper"},
        { name: "nombre"        , typeName: "text"    ,isName:true},
        { name: "apellido"      , typeName: "text"    ,isName:true},
        { name: "rol"           , typeName: "text"    },
        { name: "cuit"          , typeName: "text"    },
        { name: "usuario"       , typeName: "text"    },
        { name: "activo"        , typeName: "boolean" },
        { name: "recepcionista" , typeName: "integer" },
        // { name: "jefe_equipo"   , typeName: "boolean" ,"defaultValue": false},
    ];
    return {
        name: 'personal',
        elementName: 'persona',
        editable: esEditable,
        fields,
        primaryKey: ['persona'],
        foreignKeys:[
            {references:'personal', fields:[{source:'recepcionista', target:'persona'}], alias:'recepcionista', }
        ],
        detailTables:[
            {table:'personal_rol', fields:['persona'], abr:'R', label:'roles', refreshParent:true}
        ],
        sql:{
            isTable:false,
            viewBody:`select ${likeAr(fields).map(f=>f.originalName||f.name).join(', ')}
                from usuarios
                where idper is not null`,
                /*
            fields:{
                rol:{
                    expr:`(select string_agg(rol, ', ') from personal_rol where persona=personal.persona)`
                }
            }
            */
        }
    };
}
