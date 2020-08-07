"use strict";
                
import {TableDefinition, TableContext} from "./types-eseco";

export function personas(context:TableContext):TableDefinition {
    var puedeEditar = context.forDump || context.user.rol==='admin';
    return {
    "name": "personas",
    elementName:'persona',
    editable: puedeEditar,
    allow:{delete:context.superuser, insert:context.superuser},
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
            "references": "viviendas",
            "fields": [
                "operativo",
                "enc"
            ]
        }
    ],
    "sql": {
        isTable: false,
        "isReferable": true,
        from: `(
            select t.operativo, t.enc
                , coalesce(t.tipo_domicilio,1) tipo_domicilio
                , t.area, t.areaup, t.id_marco, t.estrato_ing
                , t.nrocomuna
                , (t.json_encuesta->>'p11')::integer p11
                , x.p1, x.p2, x.p3, x.p4
                ,  ordinality persona
            from (select *, validar_tipodato(enc, json_encuesta) tipodato_inconsist from tem) t 
                join etiquetas using(etiqueta)
                , jsonb_populate_recordset(null::personas , case when tipodato_inconsist is null then json_encuesta->'personas'else null::jsonb end) with ordinality as x
            where json_encuesta->'personas' not in  ('[{}]'::jsonb, '[]'::jsonb) 
               and rea_m=1
               and resultado in ('Negativo','Positivo')
       )`
    },
};
}
