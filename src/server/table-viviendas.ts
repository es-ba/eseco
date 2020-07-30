"use strict";
                
import {TableDefinition, TableContext} from "./types-eseco";

export function viviendas(context:TableContext):TableDefinition {
    var puedeEditar = context.forDump || context.user.rol==='admin';
    return {
    "name": "viviendas",
    title: 'Viviendas',
    editable: puedeEditar,
    allow:{delete:context.superuser, insert:context.superuser},
    "fields": [
        {
            "name": "operativo",
            "typeName": "text",
            "visible": false,
            "nullable": false
        },
        {
            "name": "enc",
            "typeName": "text",
            "nullable": false
        },
        {name:'resultado', typeName:'text'},
        {name:'observaciones', typeName:'text'},
        {
            "name": "g1",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "g2",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "g3",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "g4",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "g5",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "ug2",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "ug3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "ug4",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "ug5",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "ug6",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "ug7",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "g9",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "dv1",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "dv2",
            "typeName": "date",
            "nullable": true
        },
        {
            "name": "dv3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "dv3otros",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "dv4",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "dv5",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cp",
            "typeName": "bigint",
            "nullable": true
        },        
        //{
        //    "name": "p1!",
        //    "typeName": "text",
        //    "nullable": true
        //},
        {
            "name": "sexo_sel",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "edad_sel",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "p9",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "p11",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "p12",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "s1",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "s2",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "s3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d1",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d2",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d4",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d5",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d6_1",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d6_2",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d6_3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d6_4",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d6_5",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d6_6",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d6_7",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d6_8",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d6_9",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "d12",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "a1_1",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "a1_2",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "a1_3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "a1_4",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "a1_5",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "a2",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "a3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "a4",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "a5",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv1",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv2_1",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv2_2",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv2_3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv2_4",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv2_5",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv2_6",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv4_1",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv4_2",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv4_3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv4_4",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv4_5",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "cv4_6",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "t1",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "t2_1",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "t2_2",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "t2_3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "t2_4",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "t2_5",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "t2_6",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "t2_7",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "t2_8",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "t3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "e1",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "e2",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "e3",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "e4",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "e5",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "e6",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "e7",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "c1",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "c2",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "c3",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "c4",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "c5",
            "typeName": "text",
            "nullable": true
        },
        {
            "name": "c5ok",
            "typeName": "bigint",
            "nullable": true
        },
        {
            "name": "observaciones_viv",
            "typeName": "text",
            "nullable": true
        },
//        {
//            "name": "fin",
//            "typeName": "text",
//            "nullable": true
//        },
        {
            "name": "personas",
            "typeName": "jsonb",
            "nullable": true
        },
        {
            "name": "_edad_maxima",
            "typeName": "integer",
            "nullable": true,
            editable  : false
        },
        {
            "name": "_edad_minima",
            "typeName": "integer",
            "nullable": true,
            editable  : false
        },
    ],
    //"sql": {
    //    "isReferable": true
    //},
    "primaryKey": [
        "operativo",
        "enc"
    ],
    "detailTables": [
        {
            "table": "personas",
            "fields": [
                "operativo",
                "enc"
            ],
            "abr": "p"
        }
    ],
    "foreignKeys": [
        {
            "references": "tem",
            "fields": [
                "operativo",
                "enc"
            ]
        }
    ],
    sql:{
        isTable: false,
        isReferable:true,
        from:`
            (select t.operativo, t.enc 
                (json_encuesta->'personas'->(json_encuesta->'p11')::integer - 1->>'p2')::integer sexo_sel,
                (json_encuesta->'personas'->(json_encuesta->'p11')::integer - 1->>'p3')::integer edad_sel,  
                , x."g1"
                ,x."g2"
                ,x."g3"
                ,x."g4"
                ,x."g5"
                ,x."ug2"
                ,x."ug3"
                ,x."ug4"
                ,x."ug5"
                ,x."ug6"
                ,x."ug7"
                ,x."g9"
                ,x."dv1"
                ,x."dv2"
                ,x."dv3"
                ,x."dv3otros"
                ,x."dv4"
                ,x."dv5"
                ,x."cp"
                ,x."p9"
                ,x."p11"
                ,x."p12"
                ,x."s1"
                ,x."s2"
                ,x."s3"
                ,x."d1"
                ,x."d2"
                ,x."d3"
                ,x."d4"
                ,coalesce(x."d5",x."d5c") as "d5"
                ,x."d6_1"
                ,x."d6_2"
                ,x."d6_3"
                ,x."d6_4"
                ,x."d6_5"
                ,x."d6_6"
                ,x."d6_7"
                ,x."d6_8"
                ,x."d6_9"
                ,x."d12"
                ,x."a1_1"
                ,x."a1_2"
                ,x."a1_3"
                ,x."a1_4"
                ,x."a1_5"
                ,x."a2"
                ,x."a3"
                ,x."a4" 
                ,x."a5"
                ,x."cv1"
                ,x."cv2_1"
                ,x."cv2_2"
                ,x."cv2_3"
                ,x."cv2_4"
                ,x."cv2_5"
                ,x."cv2_6"
                ,x."cv3"
                ,x."cv4_1"
                ,x."cv4_2"
                ,x."cv4_3"
                ,x."cv4_4"
                ,x."cv4_5"
                ,x."cv4_6"
                ,x."t1"
                ,x."t2_1"
                ,x."t2_2"
                ,x."t2_3"
                ,x."t2_4"
                ,x."t2_5"
                ,x."t2_6"
                ,x."t2_7"
                ,x."t2_8"
                ,x."t3"
                ,x."e1"
                ,x."e2"
                ,x."e3"
                ,x."e4"
                ,x."e5"
                ,x."e6"
                ,x."e7"
                ,x."c1"
                ,x."c2"
                ,x."c3"
                ,x."c4"
                ,x."c5"
                ,x."c5ok"
                ,x."fin" as observaciones_viv
                ,x."personas"
                ,x."_edad_maxima"
                ,x."_edad_minima"
              from tem t inner join etiquetas using(etiqueta) , jsonb_populate_record(null::viv_fields_json , json_encuesta) as x
              where rea_m=1
            )
        `, 
    }   
    };
}