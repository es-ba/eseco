"use strict";

import {TableDefinition, TableContext} from "./types-eseco";
import { FieldDefinition } from "rel-enc";

export function tareas_tem(context:TableContext, opt:any):TableDefinition {
    var opt=opt||{}
    var mis=opt.mis?'mis_':'';
    var be=context.be;
    var db=be.db;
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';
    var fields:FieldDefinition[]=[
        {name:'tarea'    , typeName:'text', isPk:1},
        {name:'operativo', typeName:'text', isPk:2},
        {name:'enc'      , typeName:'text', isPk:3},
        {name:'asignado' , typeName:'text'}, // va a la hoja de ruta
        {name:'asignante' , typeName:'text'}, // va a la hoja de ruta
        {name:'operacion' , typeName:'text'}, // cargar/descargar
        {name:'fecha_asignacion', typeName:'date'}, // cargar/descargar
        {name:'resultado'       , typeName:'text'}, // fk tareas_resultados 
        {name:'fecha_resultado' , typeName:'date'}, // fk tareas_resultados 
        {name:'notas'           , typeName:'text'}, // viene de la hoja de ruta
    ];
    return {
        name:`${mis}tareas_tem`,
        tableName:`tareas_tem`,
        editable:puedeEditar,
        fields,
        primaryKey:['tarea','operativo','enc'],
        foreignKeys:[
            {references:'tem' , fields:['operativo','enc'], displayFields:[], alias:'te'},
            {references:'tareas' , fields:['tarea']},
            {references:'usuarios', fields:[{source:'asignante', target:'idper'}], alias:'at'},
            {references:'usuarios', fields:[{source:'asignado' , target:'idper'}], alias:'ad'},
            {references:'resultados_tarea', fields:['resultado']},
        ],
        softForeignKeys:[
            {references:'tem_recepcion' , fields:['operativo','enc'], displayAllFields:true},
        ],
        sql:{
            insertIfNotUpdate:true,
            from:`(
                select tareas.tarea, t.operativo, t.enc
                    ${fields.filter(x=>!x.isPk).map(x=>`, tt.${db.quoteIdent(x.name)}`).join('')}
                    from tareas, tem t
                        left join lateral (select * from tareas_tem where tarea=tareas.tarea and operativo=t.operativo and enc=t.enc) tt on true
                    ${opt.mis?`where (asignante = ${db.quoteNullable(context.user.idper)} or asignado = ${db.quoteNullable(context.user.idper)})`:''}
            )`
        }
    };
}

