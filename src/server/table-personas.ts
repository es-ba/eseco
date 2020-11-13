"use strict";
                
import {TableDefinition, TableContext} from "./types-eseco";

export function personas(context:TableContext, opts:{extendida:boolean}):TableDefinition {
    var be=context.be;
    opts=opts||{};
    var puedeEditar = context.forDump || context.user.rol==='admin';
    var fieldsExtendida=opts.extendida?[        
          {name: "tipo_domicilio", editable:false, typeName:"integer", inTable:false}
        , {name: "cluster"       , editable:false, typeName:"integer" }
        , {name: "area"          , editable:false, typeName:'integer', inTable:false}
        , {name: "areaup"        , editable:false, typeName:'text'   , inTable:false}
        , {name: "id_marco"      , editable:false, typeName:'bigint' , inTable:false}
        , {name: "estrato_ing"   , editable:false, typeName:"integer", inTable:false}
        , {name: "nrocomuna"     , editable:false, typeName:"integer", inTable:false}
        , {name: "p11"           , editable:false, typeName:"integer", inTable:false}
    ]:[];
    return {
    "name": opts.extendida?'personas_extendida':"personas",
    elementName:'persona',
    editable: false,
    "fields": [
        {
            "name": "operativo",
            "typeName": "text",
            "nullable": false
        },
        {
            "name": "enc",
            "typeName": "text",
            "nullable": false
        },
        ...fieldsExtendida,
        {
            "name": "persona",
            "typeName": "integer",
            "nullable": false
        },
        {
            "name": "p1",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "p2",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "p3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "p4",
            "typeName": "bigint",
            "nullable": true
        },
    ] ,//.map(x=>({...x, typeName:x.typeName=='integer'?'integer':'text'})),
    "primaryKey": [
        "operativo",
        "enc",
        "persona"
    ],
    "detailTables": [],
    "foreignKeys": [
        {
            "references": opts.extendida?"viviendas_extendida":"viviendas",
            "fields": [
                "operativo",
                "enc"
            ]
        }
    ],
    "sql": {
        isTable: !opts.extendida,
        "isReferable": true,
        from: `(
            select t.operativo, t.enc
                , t.tipo_domicilio
                , t.cluster
                , t.area, t.areaup, t.id_marco, t.estrato_ing
                , t.nrocomuna
                , (t.json_encuesta->>'p11')::integer p11
                , x.p1, x.p2, x.p3, x.p4
                ,  ordinality persona
            from  tem t 
                ${opts.extendida?`left`:``} join etiquetas using(etiqueta)
                , jsonb_populate_recordset(null::personas , case when tipos_inconsist is null then json_encuesta->'personas'else null::jsonb end) with ordinality as x
            where json_encuesta->'personas' not in  ('[{}]'::jsonb, '[]'::jsonb) 
                ${opts.extendida?` and (json_encuesta->>'dv1' is not null or resultado is not null)`:`
                and rea_m=1
                and resultado in ('Negativo','Positivo')
                 `}
       )`
    },
};
}
