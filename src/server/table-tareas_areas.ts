"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function tareas_areas(context:TableContext, opt:any):TableDefinition {
    var opt=opt||{}
    var mis=opt.mis?'mis_':'';
    var be=context.be;
    var db=be.db;
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';
    var fields:FieldDefinition[] = [
        {name:'tarea'            , typeName:'text'   ,isPk:1},
        {name:'area'             , typeName:'integer',isPk:2},
        {name:'asignante'        , typeName:'text'},
        {name:'asignado'         , typeName:'text'},
        {name:'operacion'        , typeName:'text'},
        {name:'fecha_asignacion' , typeName:'date'},
    ];
    return {
        name:`${mis}tareas_areas`,
        tableName:`tareas_areas`,
        editable:puedeEditar,
        fields,
        primaryKey:['tarea','area'],
        foreignKeys:[
            {references:'tareas', fields:['tarea']},
            {references:'areas',  fields:['area'], displayAllFields:true},
            {references:'usuarios', fields:[{source:'asignante', target:'idper'}], alias:'at'},
            {references:'usuarios', fields:[{source:'asignado' , target:'idper'}], alias:'ad'},
        ],
        detailTables:[
            {table:`${mis}tareas_tem`       , fields:['tarea', 'area'], abr:'T', refreshParent:true},
        ],
        sql:{
            insertIfNotUpdate:true,
            from:`(
                select t.tarea, a.area
                    ${fields.filter(x=>!x.isPk).map(x=>`, ${db.quoteIdent(x.name)}`).join('')}
                    from tareas t, areas a
                        left join lateral (select * from tareas_areas where area=a.area and tarea=t.tarea ) ta on true
                    ${opt.mis?`where (asignante = ${db.quoteNullable(context.user.idper)} or asignado = ${db.quoteNullable(context.user.idper)})`:''}
            )`
        }
    };
}

