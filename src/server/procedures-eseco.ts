"use strict";

import { ProcedureDef, TableDefinition, Client } from "./types-eseco";
import { adaptParameterTypes, TablaDatos, OperativoGenerator, ProcedureContext, CoreFunctionParameters, ForeignKey } from "meta-enc";
import * as likeAr from "like-ar";
export * from "./types-eseco";
import {VALOR_BLANQUEO} from './table-resultados_test_nullables';
import {json, jsono} from "pg-promise-strict";

import {changing, datetime, date } from 'best-globals';
import {promises as  fs} from "fs";
var path = require('path');
var sqlTools = require('sql-tools');

var discrepances = require('discrepances');

//NO SE USA MAS, ahora en tabla resultados_test
//const  ResultadosLaboratorio = ['Positivo', 'Negativo', 'Indeterminado','Escasa muestra']; 

const OPERATIVO = 'ESECO';
const OPERATIVO_ETIQUETAS = 'ESECO211';
const formPrincipal = 'F:F1';
const MAIN_TABLENAME ='viviendas';

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

var getHdrQuery =  function getHdrQuery(quotedCondViv:string){
    return `
        with viviendas as 
            (select enc, t.json_encuesta as respuestas, t.resumen_estado as "resumenEstado", 
                jsonb_build_object(
                    'nomcalle'      , nomcalle      ,
                    'sector'        , sector        ,
                    'edificio'      , edificio      ,
                    'entrada'       , entrada       ,
                    'nrocatastral'  , nrocatastral  ,
                    'piso'          , piso          ,
                    'departamento'  , departamento  ,
                    'habitacion'    , habitacion    ,
                    'casa'          , casa          ,
                    'prioridad'     , reserva+1     ,
                    'observaciones' , tt.carga_observaciones ,
                    'seleccionado_anterior', seleccionado_anterior,
                    'cita'          , cita ,
                    'carga'         , t.area         
                ) as tem, t.area,
                tt.visitas,
                --TODO: GENERALIZAR
                jsonb_object_agg(coalesce(tarea,'rel'),jsonb_build_object(
					'tarea', tarea,
					'notas', notas,
					'fecha_asignacion', fecha_asignacion,
					'asignado', asignado
				)) as tareas,
                min(fecha_asignacion) as fecha_asignacion
                from tem t join tareas_tem tt using (operativo, enc)
                where ${quotedCondViv}
                group by t.enc, t.json_encuesta, t.resumen_estado, nomcalle,sector,edificio, entrada, nrocatastral, piso,departamento,habitacion,casa,reserva,tt.carga_observaciones, seleccionado_anterior, cita, t.area, tt.visitas
            )
            select ${jsono(`select enc, respuestas, "resumenEstado", tem, tareas, coalesce(visitas,'[]') as visitas from viviendas`, 'enc')} as hdr,
                ${json(`
                    select area as carga, observaciones_hdr as observaciones, min(fecha_asignacion) as fecha
                        from viviendas inner join areas using (area) 
                        group by area, observaciones_hdr`, 
                    'fecha')} as cargas
    `
}

type TipoResultado='resultado_s'|'resultado_n'|'resultado_d';
var cargarResultadoFun = async (tipoResultado:TipoResultado, resultado:string|null, parameters:CoreFunctionParameters, context:ProcedureContext, rectifica:boolean)=>{
    try{
        if(resultado){
            await context.client.query(
                `select * from resultados_test where resultado = $1`,
                [resultado]
            ).fetchUniqueRow();
        }
    }catch(err){
        throw new Error(`El valor ${resultado} no es válido para el resultado ${tipoResultado}`)
    }
    var etiquetaAnteriorRow = (await context.client.query(`
        select * from etiquetas where etiqueta = $1`,
        [parameters.etiqueta]
    ).fetchUniqueRow()).row;
    try{
        let queryParamsList = [
            parameters.etiqueta,
            parameters.observaciones,
            context.username,
            resultado,
        ];
        if(!rectifica){
            queryParamsList.push(resultado);
        }
        await context.client.query(
            `update etiquetas 
                set observaciones = $2, fecha = current_date, 
                    hora = date_trunc('seconds',current_timestamp-current_date), laboratorista = $3,
                    ingreso_lab = coalesce(ingreso_lab, current_timestamp), ${context.be.db.quoteIdent(tipoResultado)} = $4
                where etiqueta = $1 
                    ${rectifica?``:`and (${context.be.db.quoteIdent(tipoResultado)} is null or ${context.be.db.quoteIdent(tipoResultado)} = $5)`}
                returning *`,
                queryParamsList
        ).fetchUniqueRow();
        //Si el valor era el mismo (ej: Positivo x Positivo, avisa con un cartel para que se de cuenta si le erró al renglón)
        if(resultado && etiquetaAnteriorRow[tipoResultado]==resultado){
            return `El resultado cargado en ${tipoResultado} ya había sido cargado previamente con el mismo valor (${resultado})`
        }else{
            return 'ok'
        }
    }catch(err){
        //Si el valor no era el mismo (ej Positivo x Negativo) le aclara que antes había un valor distinto, y cuál y le indica que vaya a rectificaciones.
        throw new Error(`El ${tipoResultado} fue cargado anteriormente con el valor ${etiquetaAnteriorRow[tipoResultado]}, rectifique si es necesario.`)
    }
}

var getResultadosNoNulosDeParametros = (parameters: CoreFunctionParameters):{[key:string]:string}=>{
    var {resultado_s, resultado_n, resultado_d}:{[key:string]:string|null} = parameters;
    var resultados = {resultado_s, resultado_n, resultado_d};
    //@ts-ignore siempre devuelve resultados no nulos
    return likeAr(resultados).filter((result)=>result!=null).plain();
    //return [resultado_s, resultado_n, resultado_d].filter((param)=>param!=null)
}

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
            var datos_json=parameters.datos_caso;
            var struct_eseco = createStructure(context, MAIN_TABLENAME);
            datos_json['operativo'] = parameters.operativo;
            datos_json['enc'] = parameters.id_caso;
            if (datos_json.personas && datos_json.personas.length>=1) {
                var personas_con_pk =datos_json.personas.map(function(per: Object,i: number){
                    return {...per,'persona': i +1}
                });
                datos_json.personas=personas_con_pk;
            }
            var queries = sqlTools.structuredData.sqlWrite(datos_json, struct_eseco);
            //console.log("#############",queries);

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
            //{name:'formulario'    ,                          typeName:'text'},
            {name:'operativo'     ,references:'operativos',  typeName:'text'},
            {name:'id_caso'       ,typeName:'text'},
        ],
        resultOk: 'goToEnc',
        definedIn: 'eseco',
        coreFunction:async function(context:ProcedureContext, parameters:CoreFunctionParameters){
            var client=context.client;
             var struct_eseco = createStructure(context, MAIN_TABLENAME);
            var sql = sqlTools.structuredData.sqlRead({operativo: parameters.operativo, enc:parameters.id_caso}, struct_eseco);
            var result = await client.query(sql).fetchUniqueValue();
            var response = {
                operativo: parameters.operativo,
                id_caso: parameters.id_caso,
                datos_caso: result.value,
                formulario: formPrincipal,
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
            /* FIN-GENERALIZAR: */
            let resultMain = await context.client.query(`SELECT * FROM ${MAIN_TABLENAME} LIMIT 1`).fetchAll();
            if(resultMain.rowCount>0){
                console.log('HAY DATOS',resultMain.rows)
                throw new Error('HAY DATOS. NO SE PUEDE INICIAR EL PASAJE');
            }
            let resultJson = await context.client.query(
                `SELECT operativo, enc id_caso, json_encuesta datos_caso from tem WHERE operativo=$1`,
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
                var {datos_caso, enc, operativo} = await be.procedure.caso_traer.coreFunction(context, {operativo:row.operativo, enc:row.id_caso})
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
        action:'dm_enc_cargar',
        parameters:[
            {name:'enc'         , typeName:'text'},
        ],
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            var be=context.be;
            var condviv= ` t.operativo= $1 and t.enc =$2`;
            //GENERALIZAR
            var soloLectura = !!(await context.client.query(
                `select *
                    from tareas_tem
                    where operativo= $1 and enc = $2 and tarea = $3 and cargado_dm is not null`
                ,
                [OPERATIVO, parameters.enc, "rel"]
            ).fetchOneRowIfExists()).rowCount;
            var {row} = await context.client.query(getHdrQuery(condviv),[OPERATIVO,parameters.enc]).fetchUniqueRow();
            return {
                ...row,
                soloLectura,
                idPer:context.user.idper,
                cargas:likeAr.createIndex(row.cargas.map(carga=>({...carga, fecha:carga.fecha?date.iso(carga.fecha).toDmy():null})), 'carga')
            };
        }
    },
    {
        action:'dm_sincronizar',
        parameters:[
            {name:'datos'       , typeName:'jsonb'},
        ],
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            var be=context.be;
            var num_sincro:number=0;
            var token:string|null=parameters.datos?.token;
            if(!token){
                token = (await be.procedure.token_get.coreFunction(context, {
                    useragent: context.session.req.useragent, 
                    username: context.username
                })).token;
            }
            var {value} = await context.client.query(`
                INSERT INTO sincronizaciones (token, usuario, datos)
                    VALUES ($1,$2,$3) 
                    RETURNING sincro
                `, [token, context.username, parameters.datos]
            ).fetchUniqueValue();
            num_sincro=value;
            var condviv= `
                        operativo= $1 
                        and asignado = (select idper from usuarios where idper=$2)
                        and tt.operacion='cargar' 
                        and tt.habilitada
                        and (tt.cargado_dm is null or tt.cargado_dm = ${context.be.db.quoteLiteral(token)})
            `
            if(parameters.datos){
                await Promise.all(likeAr(parameters.datos.hdr).map(async (vivienda,idCaso)=>{
                    var tareas = vivienda.tareas;
                    for(let tarea in tareas){
                        var puedoGuardarEnTEM=true;
                        var queryTareasTem = await context.client.query(
                            `update tareas_tem
                                set cargado_dm=null, notas = $4, visitas = $5
                                where operativo= $1 and enc = $2 and tarea = $3 and cargado_dm = ${context.be.db.quoteLiteral(token!)}
                                returning 'ok'`
                            ,
                            [OPERATIVO, idCaso, tarea, tareas[tarea].notas, JSON.stringify(vivienda.visitas || [])]
                        ).fetchOneRowIfExists();
                        if(queryTareasTem.rowCount==0){
                            var puedoGuardarEnTEM=false;
                            await fs.appendFile('local-recibido-sin-token.txt', JSON.stringify({now:new Date(),user:context.username,idCaso,vivienda, tarea, tareas})+'\n\n', 'utf8');
                        }
                        //GENERALIZAR
                        if(tarea == 'rel' && puedoGuardarEnTEM){
                            await context.client.query(
                                `update tem
                                    set json_encuesta = $3, resumen_estado=$4
                                    where operativo= $1 and enc = $2
                                    returning 'ok'`
                                ,
                                [OPERATIVO, idCaso, vivienda.respuestas, vivienda.resumenEstado]
                            ).fetchUniqueRow();
                        }
                        if(!puedoGuardarEnTEM){
                            await fs.appendFile('local-recibido-sin-token.txt', JSON.stringify({now:new Date(),user:context.username,idCaso,vivienda})+'\n\n', 'utf8');
                        }
                    }
                }).array());
            }
            var {row} = await context.client.query(getHdrQuery(condviv),[OPERATIVO,context.user.idper]).fetchUniqueRow();
            await context.client.query(
                `update tareas_tem tt
                    set  cargado_dm=$3
                    where ${condviv} `
                ,
                [OPERATIVO, parameters.enc?parameters.enc:context.user.idper, token]
            ).execute();
            return {
                ...row,
                token,
                num_sincro,
                idper:context.user.idper,
                cargas:likeAr.createIndex(row.cargas.map(carga=>({...carga, fecha:carga.fecha?date.iso(carga.fecha).toDmy():null})), 'carga')
            };
        }
    },
    {
        action:'dm_enc_descargar',
        parameters:[
            {name:'datos'       , typeName:'jsonb'},
        ],
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            await Promise.all(likeAr(parameters.datos.hdr).map(async (vivienda,idCaso)=>{
                //GENERALIZAR
                var result = await context.client.query(
                    `select *
                        from tareas_tem
                        where operativo= $1 and enc = $2 and tarea = $3 and cargado_dm is not null`
                    ,
                    [OPERATIVO, idCaso, "rel"]
                ).fetchOneRowIfExists();
                if(result.rowCount){
                    throw new Error('La encuesta que intenta guardar ha sido cargada por un encuestador.')
                }
                await context.client.query(
                    `update tem
                        set json_encuesta = $3, resumen_estado=$4
                        where operativo= $1 and enc = $2
                        returning 'ok'`
                    ,
                    [OPERATIVO, idCaso, vivienda.respuestas, vivienda.resumenEstado]
                ).fetchUniqueRow();
            }).array());
            return 'ok'
        }
    },
    {
        action:'dm_backup',
        parameters:[
            {name:'token'         , typeName:'text'},
            {name:'casos'         , typeName:'jsonb'},
        ],
        unlogged:true,
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            var {be, client} =context;
            var num_sincro:number=0;
            var token:string|null=parameters.token;
            if(token == null){
                return {ok:'ok:N/T'};
            }else{
                var {rowCount} = await client.query(`select 1 from tokens where token = $1`,[token]).fetchOneRowIfExists();
                if(!rowCount){
                    return {ok:'ok:N/T'};
                }
            }
            if(parameters.casos){
                await Promise.all(parameters.casos.map(async ({vivienda,idCaso}:{vivienda:{respuestas:object},idCaso:string})=>{
                    await context.client.query(
                        `update tem
                            set json_backup = $3
                            where operativo= $1 and enc = $2 and json_backup is distinct from $4
                            returning 'ok'`
                        ,
                        [OPERATIVO, idCaso, vivienda.respuestas, vivienda.respuestas]
                    ).fetchOneRowIfExists();
                }));
            }
            return {
                ok:'ok'
            };
        }
    },
    {
        action:'qrs_traer',
        resultOk:'qrs_traer',
        parameters:[
            {name:'desde', typeName:'text', references:'planchas', defaultValue:'101'},
            {name:'hasta', typeName:'text', references:'planchas', defaultValue:'103'}
        ],
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            const DGEyC = "DGEyC";
            const OPERATIVO = "ESECO211";
            var {rows:etiquetas} = await context.client.query(
                `SELECT 'DGEyC' as dgeyc, * FROM etiquetas WHERE plancha BETWEEN $1 AND $2 ORDER BY plancha, etiqueta`,
                [parameters.desde, parameters.hasta||parameters.desde]
            ).fetchAll();
            return {etiquetas}
        }
    },
    {
        action:'etiqueta_verificar',
        parameters:[
            {name:'operativo'      , typeName:'text' , defaultValue:OPERATIVO_ETIQUETAS },
            {name:'etiqueta'       , typeName: 'text' }
        ],
        resultOk:'resultado_cargar',
        roles:['lab','jefe_lab'],
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            var persona = await context.client.query(
                `select *
                    from usuarios
                    where usuario = $1 and activo`
                ,
                [context.user.usuario]
            ).fetchOneRowIfExists();
            if(persona.rowCount === 0){
                throw new Error('No se encuentra el usuario en personal o el mismo se encuentra inactivo.');
            }
            var result = await context.client.query(
                `select * 
                    from etiquetas where etiqueta = $1`,
                [parameters.etiqueta]
            ).fetchOneRowIfExists();
            if (result.rowCount === 0){
                throw new Error('No se encuentra la etiqueta ingresada.');
            }
            return {etiqueta:result.row, persona: persona.row};
        }
    },
    {
        action:'etiqueta_avisar',
        parameters:[
            {name:'operativo'      , typeName:'text' , defaultValue:OPERATIVO_ETIQUETAS },
            {name:'etiqueta'       , typeName: 'text' }
        ],
        roles:['lab','jefe_lab','comunicacion'],
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            var persona = await context.client.query(
                `select *
                    from usuarios
                    where usuario = $1 and activo`
                ,
                [context.user.usuario]
            ).fetchOneRowIfExists();
            if(persona.rowCount === 0){
                throw new Error('No se encuentra el usuario en personal o el mismo se encuentra inactivo.');
            }
            var result = await context.client.query(
                `update etiquetas 
                    set avisado_fecha = current_date, avisado_quien = $3
                    where operativo = $1 and etiqueta = $2
                    returning *`,
                [parameters.operativo, parameters.etiqueta, context.username]
            ).fetchOneRowIfExists();
            if (result.rowCount === 0){
                throw new Error('No se encuentra la etiqueta ingresada.');
            }
            return 'ok';
        }
    },
    {
        action:'datos_tem_traer',
        parameters:[
            {name:'etiqueta'       , typeName: 'text' }
        ],
        resultOk:'resultado_cargar',
        roles:['lab','jefe_lab'],
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            var tem = await context.client.query(
                `select * 
                    from tem
                    where etiqueta = $1`,
                [parameters.etiqueta]
            ).fetchOneRowIfExists();
            var datos = null;
            var hayDatos= tem.rowCount != 0;
            if(hayDatos){
                datos = {
                    apellido: tem.row.json_encuesta.e1,
                    nombres: tem.row.json_encuesta.e2,
                    tipoDocumento: tem.row.json_encuesta.e3,
                    tipoDocumentoEspecificado: tem.row.json_encuesta.e4,
                    paisDocumento: tem.row.json_encuesta.e5,
                    paisDocumentoEspecificado: tem.row.json_encuesta.e6,
                    documento: tem.row.json_encuesta.e7,
                    celular: tem.row.json_encuesta.c1,
                    email: tem.row.json_encuesta.c2,
                    numLineaVivienda: tem.row.json_encuesta.c3,
                    telefonoAlternativo: tem.row.json_encuesta.c4,
                    observaciones: tem.row.json_encuesta.fin,
                    
                }
            }
            return {hayDatos, datos}
        }
    },
    {
        action:'laboratorio_ingresar',
        parameters:[
            {name:'operativo'      , typeName:'text' , defaultValue:OPERATIVO_ETIQUETAS },
            {name:'etiqueta'       , typeName: 'text' },
        ],
        resultOk:'laboratorio_ingresar',
        roles:['lab','jefe_lab'],
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            var be = context.be;
            var {etiqueta, persona} = await be.procedure.etiqueta_verificar.coreFunction(context, parameters)
            var estado;
            if(etiqueta.resultado){
                estado = 'tenia';
            }else{
                estado = 'ok';
                await context.client.query(
                    `update etiquetas 
                        set laboratorista = $2,
                            ingreso_lab = coalesce(ingreso_lab, current_timestamp)
                        where etiqueta = $1
                        returning true`,
                    [parameters.etiqueta, context.username]
                ).fetchUniqueRow();
            }
            var {hayDatos, datos} = await be.procedure.datos_tem_traer.coreFunction(context, parameters)
            return {estado, hayDatos, datos}
        }
    },
    {
        action:'resultado_cargar',
        parameters:[
            {name:'operativo'      , typeName:'text' , defaultValue:OPERATIVO_ETIQUETAS },
            {name:'etiqueta'       , typeName: 'text' },
            {name:'resultado_s'    , typeName: 'text' , references:'resultados_test', defaultValue:null},
            {name:'resultado_n'    , typeName: 'text' , references:'resultados_test', defaultValue:null},
            {name:'resultado_d'    , typeName: 'text' , references:'resultados_test', defaultValue:null},
            {name:'observaciones'  , typeName: 'text', defaultValue:null},
        ],
        resultOk:'resultado_cargar',
        roles:['lab','jefe_lab'],
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            var be = context.be;
            if(!parameters.resultado_s && !parameters.resultado_n && !parameters.resultado_d){
                throw new Error('Por favor ingrese al menos 1 resultado.');
            }
            var {etiqueta, persona} = await be.procedure.etiqueta_verificar.coreFunction(context, parameters)
            const RECTIFICA = false;
            var messages:string[]=[]
            var resultadosNoNulos = getResultadosNoNulosDeParametros(parameters);
            for(let key in resultadosNoNulos){
                messages.push(await cargarResultadoFun(key as TipoResultado,resultadosNoNulos[key], parameters, context, RECTIFICA));
            }
            var estado = 'ok';
            var {hayDatos, datos} = await be.procedure.datos_tem_traer.coreFunction(context, parameters)
            return {estado, hayDatos, datos, messages:messages.filter(message=>message!='ok')}
        }
    },
    {
        action:'resultado_rectificar',
        parameters:[
            {name:'operativo'             , typeName:'text' , defaultValue:OPERATIVO_ETIQUETAS },
            {name:'etiqueta'              , typeName: 'text'    },
            {name:'resultado_s'    , typeName: 'text' , references:'resultados_test_nullables', defaultValue:null},
            {name:'resultado_n'    , typeName: 'text' , references:'resultados_test_nullables', defaultValue:null},
            {name:'resultado_d'    , typeName: 'text' , references:'resultados_test_nullables', defaultValue:null},
            {name:'observaciones'         , typeName: 'text', defaultValue:null},
            {name:'numero_rectificacion'  , typeName: 'integer' },
        ],
        resultOk:'resultado_rectificar',
        roles:['lab','jefe_lab'],
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            //VALOR_BLANQUEO
            var be = context.be;
            if(!parameters.resultado_s && !parameters.resultado_n && !parameters.resultado_d){
                throw new Error('Por favor ingrese al menos 1 resultado.');
            }
            var {etiqueta, persona} = await be.procedure.etiqueta_verificar.coreFunction(context, parameters)
            var estado;
            estado = 'ok';
            try{
                await context.client.query(
                    `update etiquetas 
                        set rectificacion = $3
                        where etiqueta = $1 and rectificacion + 1 = $2
                    returning *`,
                    [
                        parameters.etiqueta, 
                        parameters.numero_rectificacion, 
                        parameters.numero_rectificacion
                    ]
                ).fetchUniqueRow();
            }catch(err){
                throw new Error('Numero de rectificacion incorrecto.')
            }
            var sanitizarValorBlanqueo = (resultado:string)=>
                resultado==VALOR_BLANQUEO?null:resultado
            const RECTIFICA = true;
            var messages:string[]=[]
            var resultadosNoNulos = getResultadosNoNulosDeParametros(parameters);
            for(let key in resultadosNoNulos){
                messages.push(await cargarResultadoFun(key as TipoResultado, sanitizarValorBlanqueo(resultadosNoNulos[key]), parameters, context, RECTIFICA));
            }
            var {hayDatos, datos} = await be.procedure.datos_tem_traer.coreFunction(context, parameters)
            return {estado, hayDatos, datos, messages:messages.filter(message=>message!='ok')}
        }
    },
    {
        action:'resultado_consultar',
        parameters:[
            {name:'etiqueta'          , typeName:'text'},
            {name:'numero_documento'  , typeName:'text'},
        ],
        bitacora:{error:true, always:true},
        unlogged:true,
        coreFunction:async function(context: ProcedureContext, parameters: CoreFunctionParameters){
            var {be, client} =context;
            var result = await client.query(`
                select e.resultado,(json_encuesta->>'e1')::text as apellido,
                    (json_encuesta->>'e2')::text as nombre, pagina_texto
                        from  etiquetas e
                        left join resultados_test rt using (resultado)
                        left join tem t using(etiqueta)
                        where e.etiqueta =$1 and (t.json_encuesta->>'e7')::text = $2 and resultado is not null
            `,
                [parameters.etiqueta, parameters.numero_documento]
            ).fetchOneRowIfExists();
            return result.rowCount?result.row:null
        }
    },
];