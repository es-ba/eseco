"use strict";

import {TableDefinition, TableContext, FieldDefinition} from "./types-eseco";

export function control_campo(context:TableContext):TableDefinition {
    var be=context.be;
    var db=be.db;
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';
    var camposCorte:FieldDefinition[]=[
        {name:'tipo_vivienda', typeName:'bigint'}
    ];
    var camposCalculados:(FieldDefinition &  {condicion:string})[]=[
        {name:'total'        , typeName:'bigint', title:'total', condicion:'true'},
        {name:'no_salieron'  , typeName:'bigint', title:'no salieron a campo', condicion:`resumen_estado is null`},
        {name:'sin_resultado', typeName:'bigint', condicion:`resumen_estado='vacio'`},
        {name:'incompleto'   , typeName:'bigint', title:'ausente o con problemas', condicion:`resumen_estado in ('incompleto','con problemas')`},
        {name:'rea'          , typeName:'bigint', condicion:`rea_m=1`},
        {name:'asuente_viv'  , typeName:'bigint', title:'ausente de vivienda', condicion:`cod_no_rea=7`},
        {name:'asuente_mie'  , typeName:'bigint', title:'ausente de miembro seleccionado', condicion:`cod_no_rea=75`},
    ];
    return {
        name:'control_campo',
        editable:false,
        fields:[
            ...camposCorte,
            ...camposCalculados.map(f=>{var {condicion, ...fieldDef}=f; return fieldDef})
        ],
        primaryKey:camposCorte.map(f=>f.name),
        sql:{
            isTable:false,
            from:` 
            (   
                select ${[
                    ...camposCorte.map(f=>f.name),
                    ...camposCalculados.map(f=>`count(*) filter where (klase=${db.quoteLiteral(f.name)}) as ${f.name}`),
                    'count(*) filter where (klase is null) as otros'
                ].join(',')}
                from (
                    select t.*, 
                        case ${camposCalculados.map(f=>
                            `when ${f.condicion} then ${db.quoteLiteral(f.name)})`
                            ).join('')} else null end as klase
                        from (
                            select t.*, ${be.sqlNoreaCase('no_rea')} as cod_no_rea
                                from tem t
                        ) t
                ) t
                ${camposCorte.length?`group by ${camposCorte.map(f=>f.name)}`:''}
            )`
        }

    };
}

