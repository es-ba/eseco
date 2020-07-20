"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function etiquetas(context:TableContext):TableDefinition {
    var admin = context.user.rol==='admin';
    var esCoor = context.forDump || context.puede.campo.administrar;
    return {
        name:'etiquetas',
        elementName:'etiqueta',
        editable:esCoor,
        fields:[
            {name:'operativo'               , typeName:'text'      ,editable:false , nullable:false, defaultValue:'ESECO201'  },
            {name:'etiqueta'                , typeName:'text'      ,editable:false , nullable:false  },
            {name:'plancha'                 , typeName:'text'      ,editable:esCoor },
            {name:'resultado'               , typeName:'text'      ,editable:false },
            {name:'fecha'                   , typeName:'date'      ,editable:false },
            {name:'hora'                    , typeName:'interval'  ,editable:false },
            {name:'laboratorista'           , typeName:'text'      ,editable:false },
            {name:'observaciones'           , typeName:'text'      ,editable:false },
            {name:'rectificacion'           , typeName:'integer'   ,editable:false, defaultDbValue: 0}
            {name:'apellido'                , typeName:'text'      ,editable:false, inTable: false },
            {name:'nombre'                  , typeName:'text'      ,editable:false, inTable: false },
            {name:'tipo_documento'          , typeName:'text'      ,editable:false, inTable: false },
            {name:'tipo_documento_esp'      , typeName:'text'      ,editable:false, inTable: false },
            {name:'pais_documento'          , typeName:'text'      ,editable:false, inTable: false },
            {name:'pais_documento_esp'      , typeName:'text'      ,editable:false, inTable: false },
            {name:'numero_documento'        , typeName:'text'      ,editable:false, inTable: false },
            {name:'celular'                 , typeName:'text'      ,editable:false, inTable: false },
            {name:'email'                   , typeName:'text'      ,editable:false, inTable: false },
            {name:'numero_linea_vivienda'   , typeName:'text'      ,editable:false, inTable: false },
            {name:'tel_alternativo'         , typeName:'text'      ,editable:false, inTable: false },
        ],
        primaryKey:['etiqueta'],
        foreignKeys:[
            {references:'planchas'     , fields:['plancha']},
            {references:'usuarios'     , fields:[{source:'laboratorista', target:'usuario'}]},
        ],
        sql:{
            from:`(
                select e.*, 
                (json_encuesta->>'e1')::text as apellido,
                (json_encuesta->>'e2')::text as nombre,
                case when ((json_encuesta->>'e3')) = '1' then 'DNI argentino'
                    when ((json_encuesta->>'e3')) = '2' then 'Documento extranjero'
                    when ((json_encuesta->>'e3')) = '3' then 'No tiene documento'
                    when ((json_encuesta->>'e3')) = '4' then 'Otro'
                    else null end as tipo_documento,
                (json_encuesta->>'e4')::text as tipo_documento_esp,
                case when ((json_encuesta->>'e5')) = '1' then 'Uruguay'
                    when ((json_encuesta->>'e5')) = '2' then 'Paraguay'
                    when ((json_encuesta->>'e5')) = '3' then 'Brasil'
                    when ((json_encuesta->>'e5')) = '4' then 'Bolivia'
                    when ((json_encuesta->>'e5')) = '5' then 'Chile'
                    when ((json_encuesta->>'e5')) = '6' then 'Perú'
                    when ((json_encuesta->>'e5')) = '7' then 'Venezuela'
                    when ((json_encuesta->>'e5')) = '8' then 'Otro'
                    else null end as pais_documento,
                (json_encuesta->>'e6')::text as pais_documento_esp,
                (json_encuesta->>'e7')::text as numero_documento,
                (json_encuesta->>'c1')::text as celular,
                (json_encuesta->>'c2')::text as email,
                (json_encuesta->>'c3')::text as numero_linea_vivienda,
                (json_encuesta->>'c4')::text as tel_alternativo
                from etiquetas e
                left join tem t using(etiqueta)
            )`,
            isTable: true,
        }
    };
}

