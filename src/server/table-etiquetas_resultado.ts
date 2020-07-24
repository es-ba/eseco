"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function etiquetas_resultado(context:TableContext):TableDefinition {
    var admin = context.user.rol==='admin';
    return {
        name:'etiquetas_resultado',
        elementName:'etiqueta',
        editable:false,
        fields:[
            {name:'operativo'               , typeName:'text'      ,editable:false , nullable:false, defaultValue:'ESECO201'  },
            {name:'etiqueta'                , typeName:'text'      ,editable:false , nullable:false  },
            {name:'resultado'               , typeName:'text'      ,editable:false },
            {name:'fecha'                   , typeName:'date'      ,editable:false },
            {name:'hora'                    , typeName:'interval'  ,editable:false },
            {name:'laboratorista'           , typeName:'text'      ,editable:false },
            {name:'observaciones'           , typeName:'text'      ,editable:false },
            {name:'rectificacion'           , typeName:'integer'   ,editable:false, defaultDbValue: 0},
            {name:'apellido'                , typeName:'text'      ,editable:false, inTable: false },
            {name:'nombre'                  , typeName:'text'      ,editable:false, inTable: false },
            {name:'sexo'                    , typeName:'text'      ,editable:false, inTable: false },
            {name:'edad'                    , typeName:'integer'   ,editable:false, inTable: false },
            {name:'tipo_documento'          , typeName:'text'      ,editable:false, inTable: false },
            {name:'pais_documento'          , typeName:'text'      ,editable:false, inTable: false },
            {name:'numero_documento'        , typeName:'text'      ,editable:false, inTable: false },
            {name:'celular'                 , typeName:'text'      ,editable:false, inTable: false },
            {name:'email'                   , typeName:'text'      ,editable:false, inTable: false },
            {name:'numero_linea_vivienda'   , typeName:'text'      ,editable:false, inTable: false },
            {name:'tel_alternativo'         , typeName:'text'      ,editable:false, inTable: false },
        ],
        primaryKey:['etiqueta'],
        foreignKeys:[
            {references:'usuarios'     , fields:[{source:'laboratorista', target:'usuario'}]},
        ],
        sql:{
            from:`(
                select e.*, 
                (json_encuesta->>'e1')::text as apellido,
                (json_encuesta->>'e2')::text as nombre,
                case when ((json_encuesta->>'e3')) = '1' then 'DNI'
                    when ((json_encuesta->>'e3')) = '2' then 'Documento extranjero'
                    when ((json_encuesta->>'e3')) = '3' then 'No tiene documento'
                    when ((json_encuesta->>'e3')) = '4' then (json_encuesta->>'e4')
                    else (json_encuesta->>'e4') end as tipo_documento,
                (json_encuesta->>'e4')::text as tipo_documento_esp,
                case when ((json_encuesta->>'e3')) = '1' then 'Argentina'
                    when ((json_encuesta->>'e5')) = '1' then 'Uruguay'
                    when ((json_encuesta->>'e5')) = '2' then 'Paraguay'
                    when ((json_encuesta->>'e5')) = '3' then 'Brasil'
                    when ((json_encuesta->>'e5')) = '4' then 'Bolivia'
                    when ((json_encuesta->>'e5')) = '5' then 'Chile'
                    when ((json_encuesta->>'e5')) = '6' then 'Perú'
                    when ((json_encuesta->>'e5')) = '7' then 'Venezuela'
                    when ((json_encuesta->>'e5')) = '8' then (json_encuesta->>'e6')
                    else (json_encuesta->>'e6') end as pais_documento,
                (json_encuesta->>'e7')::text as numero_documento,
                (json_encuesta->>'c1')::text as celular,
                (json_encuesta->>'c2')::text as email,
                (json_encuesta->>'c3')::text as numero_linea_vivienda,
                (json_encuesta->>'c4')::text as tel_alternativo,
                case json_encuesta->'personas'->((json_encuesta->>'p11')::integer - 1)->>'p2'::text when '1' then 'Varón' when '2' then 'Mujer' else json_encuesta->'personas'->(json_encuesta->>'p11')->>'p2'::text end as sexo,
                (json_encuesta->'personas'->((json_encuesta->>'p11')::integer - 1)->>'p3')::integer as edad
                from etiquetas e
                left join tem t using(etiqueta)
                where (ingreso_lab is not null or resultado is not null or observaciones is not null)
            )`,
            isTable: true,
        }
    };
}

