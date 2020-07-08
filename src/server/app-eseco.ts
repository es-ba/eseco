"use strict";

import * as procesamiento from "procesamiento";
import {ProceduresEseco} from "./procedures-eseco";

import * as pg from "pg-promise-strict";
import * as miniTools from "mini-tools";
import {Request, Response} from "./types-eseco";

import * as yazl from "yazl";
import { NextFunction } from "express-serve-static-core";

//import { casos               } from "./table-casos";
import { roles               } from "./table-roles";
import { personal            } from "./table-personal";
import { personal_rol        } from "./table-personal_rol";
import { permisos            } from "./table-permisos";
import { roles_permisos      } from "./table-roles_permisos";

import {tipos_estados} from "./table-tipos_estados";
import {estados} from "./table-estados";
import {tem} from "./table-tem";
import {carga_tem} from "./table-carga_tem";
import {cargas} from "./table-cargas";
import {carga_fechas} from "./table-carga_fechas";
import {tem_estados} from "./table-tem_estados";
import {tem_seleccionable} from "./table-tem_seleccionable";



import {defConfig} from "./def-config"
import { FieldDefinition } from "procesamiento";

interface Context extends procesamiento.Context{
  puede:object
  superuser?:true
}

export type Constructor<T> = new(...args: any[]) => T;
export function emergeAppEseco<T extends Constructor<procesamiento.AppProcesamientoType>>(Base:T){
  return class AppEseco extends Base{
    constructor(...args:any[]){ 
        super(args); 
    }
    async getProcedures(){
        var procedimientoAReemplazar=["caso_guardar","caso_traer"];
        var parentProc = await super.getProcedures();
        parentProc = parentProc.filter((procedure:any) => !procedimientoAReemplazar.includes(procedure.action));
        return parentProc.concat(ProceduresEseco);
    }

    addSchrödingerServices(mainApp:procesamiento.Express, baseUrl:string){
        let be=this;
        super.addSchrödingerServices(mainApp, baseUrl);
        mainApp.use(function(req:Request,res:Response, next:NextFunction){
            if(req.session && !req.session.install){
                req.session.install=Math.random().toString().replace('.','');
            }
            next();
        })
        mainApp.get(baseUrl+'/campo',async function(req,res,_next){
            // @ts-ignore sé que voy a recibir useragent por los middlewares de Backend-plus
            var {useragent, user} = req;
            var parameters = req.query;
            var manifestPath = 'carga-dm/dm-manifest.manifest';
            /** @type {{type:'js', src:string}[]} */
            var htmlMain=be.mainPage({useragent, user}, !be.config.devel["no-offline"], {skipMenu:true, manifestPath}).toHtmlDoc();
            miniTools.serveText(htmlMain,'html')(req,res);
        });
    }
    addLoggedServices(){
        var be = this;
        super.addLoggedServices();
        be.app.get('/manifest.manifest', async function(req:Request, res:Response, next:NextFunction){
            miniTools.serveFile('src/client/manifest.manifest',{})(req,res);
        });
        this.app.get('/file', async function(req:Request,res:Response){
            let result = await be.inTransaction(req, 
                (client:pg.Client)=>
                client.query("select ruta from adjuntos where id_adjunto = $1",[req.query.id_adjunto])
                .fetchUniqueValue()
            );
            var path = result.value;
            miniTools.serveFile(path,{})(req,res);
        });
        this.app.get('/imagenes', async function(req:Request,res:Response){
            miniTools.serveFile('local-images/'+req.query.pdf,{})(req,res);
        });
        this.app.get('/download/all',async function(req:Request, res:Response, next:()=>void){
            if(req.user==null || req.user.rol!='admin'){
                console.log('no está autorizado a bajarse todo',req.user)
                return next();
            }
            let zip = new yazl.ZipFile();
            zip.outputStream.pipe(res);
            let base = 'local-attachments'
            let files = await fs.readdir(base);
            await Promise.all(files.map(async function(fileName:string){
                var path = base+'/'+fileName;
                var stat = await fs.stat(path);
                if(stat.isFile){
                    zip.addFile(path,fileName);
                }
            }));
            zip.end();
        })
    }
    async postConfig(){
        await super.postConfig();
        var be=this;
        await be.inTransaction(null, async function(client:pg.Client){
            var qPermisos=`
            SELECT jsonb_object_agg(r.rol,jsonb_build_object('superuser',r.superuser,'puede',(
                  SELECT jsonb_object_agg(rp.permiso,(
                        SELECT jsonb_object_agg(rpa.accion,rpa.habilitado)
                          FROM roles_permisos rpa
                          WHERE rpa.rol=rp.rol AND rpa.permiso=rp.permiso
                    ))
                    FROM roles_permisos rp
                    WHERE rp.rol=r.rol #condHabilitado#
              )))
              FROM roles r
            `;
            var results = [
                await client.query(qPermisos.replace('#condHabilitado#','')).fetchUniqueValue(),
                await client.query(qPermisos.replace('#condHabilitado#',` and rp.${pg.quoteIdent('habilitado')}`)).fetchUniqueValue(),
                await client.query(`
                    SELECT jsonb_object_agg(permiso,(
                        SELECT jsonb_object_agg(accion,true)
                          FROM permisos pa
                          WHERE pa.permiso=p.permiso
                      ))
                      FROM permisos p
                `).fetchUniqueValue()
            ];
            be.permisosRol=results[0].value;
            be.permisosRolSoloTrue=results[1].value;
            be.permisosSuperuser=results[2].value;
            console.dir(be.permisosRolSoloTrue,{depth:9});
            console.dir(be.permisosSuperuser,{depth:9});
        });
    }
    configStaticConfig(){
        super.configStaticConfig();
        this.setStaticConfig(defConfig);
    }
    clientIncludes(req, opts) {
        var be = this;
        var menuedResources=req && opts && !opts.skipMenu ? [
            { type:'js' , src: 'client/client.js' },
        ]:[
            {type:'js' , src:'unlogged.js' },
        ];
        if(opts && opts.extraFiles){
            menuedResources = menuedResources.concat(opts.extraFiles);
        }
        return [
            { type: 'js', module: 'react', modPath: 'umd', fileDevelopment:'react.development.js', file:'react.production.min.js' },
            { type: 'js', module: 'react-dom', modPath: 'umd', fileDevelopment:'react-dom.development.js', file:'react-dom.production.min.js' },
            { type: 'js', module: '@material-ui/core', modPath: 'umd', fileDevelopment:'material-ui.development.js', file:'material-ui.production.min.js' },
            { type: 'js', module: 'clsx', file:'clsx.min.js' },
            { type: 'js', module: 'redux', modPath:'../dist', fileDevelopment:'redux.js', file:'redux.min.js' },
            { type: 'js', module: 'react-redux', modPath:'../dist', fileDevelopment:'react-redux.js', file:'react-redux.min.js' },
            { type: 'js', module: 'memoize-one',  file:'memoize-one.js' },
            ...super.clientIncludes(req, opts).filter(m=>m.file!='formularios.css'),
            { type: 'js', module: 'redux-typed-reducer', modPath:'../dist', file:'redux-typed-reducer.js' },
            { type: 'js', src: 'adapt.js' },
            { type: 'js', src: 'tipos.js' },
            { type: 'js', src: 'redux-formulario.js' },
            { type: 'js', src: 'render-general.js' },
            { type: 'js', src: 'render-formulario.js' },
            { type: 'css', file: 'menu.css' },
            { type: 'css', file: 'formulario-react.css' },
            ... menuedResources
        ]
        // .map(m=>({...m, file:m.fileDevelopment||m.file}));
    }
    getContext(req:Request):Context{
        var be = this;
        var fatherContext = super.getContext(req);
        if(fatherContext.user){
            if(be.permisosRol[req.user.rol].superuser){
                return {superuser:true, puede: be.permisosSuperuser, ...fatherContext}
            }else{
                return {puede: be.permisosRol[req.user.rol].puede, ...fatherContext}
            }
        }
        return {puede:{}, ...fatherContext};
    }
    getMenu(){
        let menu = {menu:[
            {menuType:'demo', name:'demo', selectedByDefault:true},
            /*
            {menuType:'menu', name:'procesar', menuContent:[
                {menuType:'table', name:'variables'    },
                {menuType:'table', name:'consistencias'},
                {menuType:'table', name:'inconsistencias'},
                {menuType:'table', name:'tabla_datos'  },
                {menuType:'table', name:'diccionario'  , label:'diccionarios' },
            ]},
            */
            {menuType:'menu', name:'encuestadores', menuContent:[
                {menuType:'sincronizar_dm', name:'sincronizar_dm', label:'sincronizar'},
            ]},
            {menuType:'menu', name:'recepcion', label:'recepción' ,menuContent:[
                //{menuType:'carga_recepcionista', name:'cargar'},
                {menuType:'asignacion_recepcion', name:'asignacion', label:'asignación'},
                {menuType:'table', name:'recepcion', label:'recepción', table:'carga_fechas'},
            ]},            
            {menuType:'menu', name:'configurar', menuContent:[
                {menuType:'menu', name:'muestra', label:'muestra', menuContent:[
                    {menuType:'table', name:'tem', label: 'TEM'} ,
                    {menuType:'table', name:'personal'},
                    {menuType:'table', name:'personal_rol'},
                    ]},
                {menuType:'menu', name:'metadatos', menuContent:[
                    {menuType:'table', name:'operativos'},
                    {menuType:'table', name:'formularios' , table:'casilleros_principales'},
                    {menuType:'table', name:'plano'       , table:'casilleros'},
                    {menuType:'table', name:'tipoc'       , label:'tipos de celdas'},
                    {menuType:'table', name:'tipoc_tipoc' , label:'inclusiones de celdas'},
                ]},
            ]},
            {menuType:'menu', name:'usuarios', menuContent:[
                {menuType:'table', name:'usuarios'},
                {menuType:'table', name:'roles'},
                {menuType:'table', name:'permisos'},
                {menuType:'table', name:'roles_permisos'},
            ]},
            {menuType:'proc', name:'generate_tabledef', proc:'tabledef_generate', label:'generar tablas'  },
        ]}
        return menu;
    }
    prepareGetTables(){
        var be=this;
        super.prepareGetTables();
        this.getTableDefinition={
            ...this.getTableDefinition
            , roles
            , personal
            , personal_rol
            , permisos
            , roles_permisos
            , tipos_estados
            , estados
            , tem
            , tem_estados
            , carga_tem
            , cargas
            , carga_fechas
            , tem_seleccionable
        }
        be.appendToTableDefinition('consistencias',function(tableDef, context){
            tableDef.fields.forEach(function(field){
                if(field.name=='error_compilacion'){
                    if(field.visible){
                        console.error('************ QUITAR ESTO error_compilacion ya es visible');
                    }
                    field.visible=true;
                }
            })
        })
        be.appendToTableDefinition('inconsistencias',function(tableDef, context){
            tableDef.fields.splice(2,0,
                {name:'id_caso', typeName:'text'   , label:'caso'   , editable: false},
               // {name:'p0'     , typeName:'integer', label:'persona', editable: false}
            );
            tableDef.editable=tableDef.editable || context.puede.encuestas.justificar;
            tableDef.fields.forEach(function(field){
                if(field.name=='pk_integrada'){
                    field.visible=false;
                }
                if(field.name=='justificacion'){
                    field.editable=context.forDump || context.puede.encuestas.justificar;
                }
            })
        })
        be.appendToTableDefinition('usuarios', function (tableDef) {
            tableDef.foreignKeys = tableDef.foreignKeys||[];
            tableDef.foreignKeys.push({references:'roles'  , fields:['rol'] , onDelete: 'cascade'});
        });
    }
  }
}