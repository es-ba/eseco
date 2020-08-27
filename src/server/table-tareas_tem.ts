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
        {name:'abrir'    , typeName:'text'    , editable:false, inTable:false, clientSide:'abrirRecepcion'},
        {name:'tarea'    , typeName:'text', isPk:1},
        {name:'operativo', typeName:'text', isPk:2},
        {name:'enc'      , typeName:'text', isPk:3},
        {name:'area'     , typeName: 'integer', editable: false },
        {name:'asignado' , typeName:'text'}, // va a la hoja de ruta
        {name:'asignante' , typeName:'text'}, // va a la hoja de ruta
        {name:'operacion' , typeName:'text'}, // cargar/descargar
        {name:'fecha_asignacion', typeName:'date'}, // cargar/descargar
        {name:'resultado'       , typeName:'text'}, // fk tareas_resultados 
        {name:'fecha_resultado' , typeName:'date'}, // fk tareas_resultados 
        {name:'notas'           , typeName:'text'}, // viene de la hoja de ruta
        {name:"carga_observaciones", typeName: "text", editable: true},
        {name:"cargado"         , typeName: "boolean", editable: false},
        {name:"habilitada"      , typeName: "boolean", editable: puedeEditar},
        {name:'rea_m'           , typeName:'integer' , editable: false   },
    //    {name:'cod_no_rea'      , typeName:'text'    , editable:false , inTable: false   },
    //    {name:'gru_no_rea'      , typeName:'text'    , editable:false , inTable: false   },
        {name:"resumen_estado"  , typeName:'text'    , editable:false    },
        {name:'etiqueta'        , typeName:'text'    , editable:false    },
        {name:'fecha_rel'       , typeName:'date'    , editable:false    },
        {name:'tipos_inconsist' , typeName:'text'    , editable:false    },
        {name:'cant_p'          , typeName:'bigint'  , editable:false    },
        {name:'sexo_sel'        , typeName:'bigint'  , editable:false    },
        {name:'edad_sel'        , typeName:'bigint'  , editable:false    },        
        {name:'seleccionado'    , typeName:'bigint'  , editable:false    },
    ];
    return {
        name:`${mis}tareas_tem`,
        tableName:`tareas_tem`,
        editable:puedeEditar,
        fields,
        primaryKey:['tarea','operativo','enc'],
        foreignKeys:[
            {references:'areas' , fields:['area']},
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
                    ${fields.filter(x=>!(x.isPk || x.inTable===false)).map(x=>`, tt.${db.quoteIdent(x.name)}`).join('')}
                   -- , ${be.sqlNoreaCase('no_rea').replace('json_encuesta', 'tt.json_encuesta','g')} as cod_no_rea
                   -- , ${be.sqlNoreaCase('grupo').replace('json_encuesta', 'tt.json_encuesta','g')} as gru_no_rea
                    from tareas, tem t
                        left join lateral (select * from tareas_tem where tarea=tareas.tarea and operativo=t.operativo and enc=t.enc) tt on true
                    ${opt.mis?`where (asignante = ${db.quoteNullable(context.user.idper)} or asignado = ${db.quoteNullable(context.user.idper)})`:''}
            )`
        }
    };
}

