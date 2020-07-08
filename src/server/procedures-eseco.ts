"use strict";

import { ProcedureDef, TableDefinition } from "./types-eseco";
import { adaptParameterTypes, TablaDatos, OperativoGenerator, ProcedureContext, CoreFunctionParameters, ForeignKey } from "meta-enc";
import * as likeAr from "like-ar";
export * from "./types-eseco";

var changing = require('best-globals').changing;
var fs = require('fs-extra');
var path = require('path');
var sqlTools = require('sql-tools');

var discrepances = require('discrepances');

const OPERATIVO = 'ESECO';
const formPrincipal = 'F:F1';

/*definición de estructura completa, cuando exista ing-enc hay que ponerlo ahí*/ 
type EstructuraTabla={tableName:string, pkFields:{fieldName:string}[], childTables:EstructuraTabla[]};
function createStructure(context:ProcedureContext, tableName:string){
    var be = context.be;
    var mainTableDef:TableDefinition = be.tableStructures[tableName](context);
    var getPkFromTableDef = function getPkFromTableDef(tableDef:TableDefinition){
        return tableDef.primaryKey.map(function(pk){
            return {fieldName:pk};
        })
    };
    var getFkFromTableDef = function getFkFromTableDef(tableDef:TableDefinition, parentTableName: string){
        // return tableDef.foreignKeys? tableDef.foreignKeys.map(fk=>fk.fields): [];
        let parentFk = (<ForeignKey[]> tableDef.foreignKeys).find(fk=>fk.references == parentTableName);
        return parentFk? parentFk.fields: [];
    }
    var struct:EstructuraTabla={
        tableName:mainTableDef.name,
        pkFields:getPkFromTableDef(mainTableDef),
        childTables:[]
    };
    if(mainTableDef.detailTables && mainTableDef.detailTables.length){
        mainTableDef.detailTables.forEach(function(detailTable){
            struct.childTables.push(
                changing(
                    createStructure(context, detailTable.table),
                    {fkFields: getFkFromTableDef(be.tableStructures[detailTable.table](context), tableName)}
                )
            );
        })
    }
    return struct;
}
/* fin definicion estructura completa */

type AnyObject = {[k:string]:any}

export const ProceduresEseco : ProcedureDef[] = [
    {
        action:'generar_formularios',
        parameters:[
            {name:'annio', typeName:'integer', references:'annio'},
            {name:'mes'  , typeName:'integer', references:'mes'  },
            {name:'lote' , typeName:'integer', references:'lotes'},
        ],
        coreFunction:async function(context:ProcedureContext, parameters:CoreFunctionParameters){
            var be=context.be;
            let resultUA = await context.client.query(
                `select *
                   from unidad_analisis
                   where principal = true and operativo = $1
                `,
                [OPERATIVO]
            ).fetchOneRowIfExists();
            if (resultUA.rowCount === 0){
                throw new Error('No se configuró una unidad de analisis como principal');
            }
            let row = resultUA.row;
            let resultPreguntas = await be.procedure.preguntas_ua_traer.coreFunction(context, row)
            var contenedorVacio:{[key:string]:any} = {};
            resultPreguntas.forEach(function(defPregunta){
                contenedorVacio[defPregunta.var_name] = defPregunta.unidad_analisis?[]:null;
            });
            contenedorVacio.annio= parameters.annio;
            contenedorVacio.mes  = parameters.mes  ;
            contenedorVacio.lote = parameters.lote ;
            
            var result = await context.client.query(
                `select debe_haber.id_caso, s as id
                    from (select lote, armar_id(annio, mes, lote, s) as id_caso, s
                        from (select annio,mes,lote, cant_cues from lotes where (annio,mes,lote)=($2,$3,$4)) r, lateral generate_series(1,cant_cues) s
                    ) debe_haber left join defgen hay on hay.id_caso = debe_haber.id_caso and hay.operativo=$1
                    where hay.id_caso is null`,
                [ OPERATIVO, parameters.annio, parameters.mes, parameters.lote]
            ).fetchAll();
            var params = {operativo: OPERATIVO};
            for(var i=0; i < result.rowCount; i++){
                await be.procedure.caso_guardar.coreFunction(
                    context, 
                    changing(params,{id_caso:result.rows[i].id_caso, datos_caso:changing(contenedorVacio,{id:result.rows[i].id})})
                )
            }
            return {agregadas:result.rowCount}
        }
    },
    {
        action:'upload_file',
        progress: true,
        parameters:[
            {name: 'id_adjunto', typeName: 'integer'},
            {name: 'nombre', typeName: 'text'},
        ],
        files:{count:1},
        coreFunction:function(context, parameters, files){
            let be=context.be;
            let client=context.client;
            context.informProgress({message:be.messages.fileUploaded});
            let file = files[0]
            let ext = path.extname(file.path).substr(1);
            let originalFilename = file.originalFilename.slice(0,-(ext.length+1));
            let filename= parameters.nombre || originalFilename;
            let newPath = 'local-attachments/file-';
            var createResponse = function createResponse(adjuntoRow){
                let resultado = {
                    message: 'La subida se realizó correctamente (update)',
                    nombre: adjuntoRow.nombre,
                    nombre_original: adjuntoRow.nombre_original,
                    ext: adjuntoRow.ext,
                    fecha: adjuntoRow.fecha,
                    hora: adjuntoRow.hora,
                    id_adjunto: adjuntoRow.id_adjunto
                }
                return resultado
            }
            var moveFile = function moveFile(file, id_adjunto, extension){
                fs.move(file.path, newPath + id_adjunto + '.' + extension, { overwrite: true });
            }
            return Promise.resolve().then(function(){
                if(parameters.id_adjunto){
                    return context.client.query(`update adjuntos set nombre= $1,nombre_original = $2, ext = $3, ruta = concat('local-attachments/file-',$4::text,'.',$3::text), fecha = now(), hora = date_trunc('seconds',current_timestamp-current_date)
                        where id_adjunto = $4 returning *`,
                        [filename, originalFilename, ext, parameters.id_adjunto]
                    ).fetchUniqueRow().then(function(result){
                        return createResponse(result.row)
                    }).then(function(resultado){
                        moveFile(file,resultado.id_adjunto,resultado.ext);
                        return resultado
                    });
                }else{
                    return context.client.query(`insert into adjuntos (nombre, nombre_original, ext, fecha, hora) values ($1,$2,$3,now(), date_trunc('seconds',current_timestamp-current_date)) returning *`,
                        [filename, originalFilename, ext]
                    ).fetchUniqueRow().then(function(result){
                        return context.client.query(`update adjuntos set ruta = concat('local-attachments/file-',id_adjunto::text,'.',ext)
                            where id_adjunto = $1 returning *`,
                            [result.row.id_adjunto]
                        ).fetchUniqueRow().then(function(result){
                            return createResponse(result.row)
                        }).then(function(resultado){
                            moveFile(file,resultado.id_adjunto,resultado.ext);
                            return resultado
                        });
                    });
                }
            }).catch(function(err){
                throw err;
            });
        }
    },
    {
        action:'caso_guardar',
        parameters:[
            {name:'operativo'   , typeName:'text', references:'operativos'},
            {name:'id_caso'     , typeName:'text'      },
            {name:'datos_caso'  , typeName:'jsonb'     },
        ],
        definedIn: 'eseco',
        //@ts-ignore especifico el tipo de los parámetros
        coreFunction:async function(context:ProcedureContext, parameters:{
            operativo:string, 
            id_caso:string,
            datos_caso:AnyObject
        }){
            var client=context.client;
            var struct_defgen = createStructure(context, 'defgen');
            var sql = sqlTools.structuredData.sqlRead({operativo: parameters.operativo, id_caso:parameters.id_caso}, struct_defgen);
            var sql_rec = {...sql, text:sql.text.replace(/from\s*\w+\b/g,'$&_rec')};
            var sql_ing = {...sql, text:sql.text.replace(/from\s*\w+\b/g,'$&_ing')};
            var {value:datos_ori} = await client.query(sql_rec).fetchUniqueValue();
            var {value:datos_ing} = await client.query(sql_ing).fetchUniqueValue();
            parameters.datos_caso['operativo'] = parameters.operativo;
            parameters.datos_caso['id_caso'] = parameters.id_caso;
            var struct_defgen=createStructure(context, 'defgen_ing');
            struct_defgen.childTables=[];
            var datos_ingresados = likeAr(parameters.datos_caso).map((value, key)=>
                datos_ing[key] || datos_ori[key]!=value?value:null
            ).plain();
            var queries = sqlTools.structuredData.sqlWrite(datos_ingresados, struct_defgen);
            return await queries.reduce(function(promise, query){
                return promise.then(function() {
                    return client.query(query).execute().then(function(result){
                        return 'ok';
                    });
                });
            },Promise.resolve()).then(function(){
                return "ok";
            }).catch(function(err:Error){
                console.log("ENTRA EN EL CATCH: ",err)
                throw err
            })
           
        }
    },
    {
        action: 'caso_traer',
        parameters: [
            {name:'formulario'    ,                          typeName:'text'},
            {name:'operativo'     ,references:'operativos',  typeName:'text'},
            {name:'id_caso'       ,typeName:'text'},
        ],
        resultOk: 'goToEnc',
        definedIn: 'eseco',
        coreFunction:async function(context:ProcedureContext, parameters:CoreFunctionParameters){
            var client=context.client;
            var struct_defgen = createStructure(context, 'defgen');
            var sql = sqlTools.structuredData.sqlRead({operativo: parameters.operativo, id_caso:parameters.id_caso}, struct_defgen);
            var result = await client.query(sql).fetchUniqueValue();
            var rows_prov = await context.be.procedure['traer_provincias'].coreFunction(context, parameters);
            var response = {
                operativo: parameters.operativo,
                id_caso: parameters.id_caso,
                datos_caso: result.value,
                formulario: parameters.formulario,
                provincias: rows_prov
            };
            return response;
        }
    },
    {
        action: 'id_caso_obtener',
        parameters: [
            {name:'operativo' ,references:'operativos',typeName:'text'   },
            {name:'annio'                             ,typeName:'integer'},
            {name:'mes'                               ,typeName:'integer'},
            {name:'lote'                              ,typeName:'integer'},
            {name:'id'                                ,typeName:'integer'},
        ],
        coreFunction:async function(context:ProcedureContext, parameters:CoreFunctionParameters){
            var client=context.client;
            return client.query(
                `select id_caso 
                    from defgen 
                    where operativo=$1 and annio = $2 and mes = $3 and lote = $4 and id = $5`,
                [parameters.operativo, parameters.annio,parameters.mes,parameters.lote,parameters.id]
            ).fetchUniqueValue().then(function(result){
                return result.value;
            }).catch(function(err){
                console.log('ERROR',err.message);
                throw err;
            });
        }
    },
    {
        action: 'caso_traer_o_crear',
        parameters: [
            {name:'operativo'     ,references:'operativos',  typeName:'text'},
            {name:'id_caso'       ,typeName:'text'},
        ],
        resultOk: 'goToEnc',
        // bitacora:{always:true},
        coreFunction:async function(context:ProcedureContext, parameters:CoreFunctionParameters){
            var be = context.be;
            try{
                var result = await be.procedure['caso_traer'].coreFunction(context, parameters);
                return result
            }catch(err){
                var json = await be.procedure['caso_preparar'].coreFunction(context, parameters);
                await be.procedure['caso_guardar'].coreFunction(context, changing(parameters, {datos_caso:json}));
                return await be.procedure['caso_traer'].coreFunction(context, parameters);
            }
        }
    },
    {
        action:'pasar_json2ua',
        parameters:[
        ],
        coreFunction:async function(context:ProcedureContext, parameters:CoreFunctionParameters){
            /* GENERALIZAR: */
            var be=context.be;
            let mainTable=be.db.quoteIdent('defgen');
            /* FIN-GENERALIZAR: */
            let resultMain = await context.client.query(`SELECT * FROM ${mainTable} LIMIT 1`).fetchAll();
            if(resultMain.rowCount>0){
                console.log('HAY DATOS',resultMain.rows)
                throw new Error('HAY DATOS. NO SE PUEDE INICIAR EL PASAJE');
            }
            let resultJson = await context.client.query(
                `SELECT operativo, id_caso, datos_caso FROM formularios_json WHERE operativo=$1`,
                [OPERATIVO]
            ).fetchAll();
            var procedureGuardar = be.procedure.caso_guardar;
            if(procedureGuardar.definedIn!='eseco'){
                throw new Error('hay que sobreescribir caso_guardar');
            }
            return Promise.all(resultJson.rows.map(async function(row){
                await procedureGuardar.coreFunction(context, row)
                if(!('r4_esp' in row.datos_caso)){
                    row.datos_caso.r4_esp = null;
                }
                var {datos_caso, id_caso, operativo} = await be.procedure.caso_traer.coreFunction(context, {operativo:row.operativo, id_caso:row.id_caso})
                var verQueGrabo = {datos_caso, id_caso, operativo}
                try{
                    discrepances.showAndThrow(verQueGrabo,row)
                }catch(err){
                    console.log(verQueGrabo,row)
                }
                return 'Ok!';
            })).catch(function(err){
                throw err;
            }).then(function(result){
                return result;
            })
        }
    },
    {
        action:'asignacion_recepcion',
        parameters:[
            {name:'operativo'        ,references:'operativos',  typeName:'text'   , defaultValue:OPERATIVO },
            {name:'area1'                                    ,  typeName:'integer' },
            {name:'area2'                                    ,  typeName:'integer' },
            //TODO   areas???
        ],
        progress:true,
        // bitacora:{always:true},
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            let res = await context.client.query(`
                select *
                  from tem
                  where operativo=$1 and (area=$2 or area=$3)
                  order by reserva, enc`,
                [parameters.operativo, parameters.area1, parameters.area2]
            ).fetchAll();
            return res.rows;
        }
    },
];

