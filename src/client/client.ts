import {html} from "js-to-html";
import * as myOwn from "myOwn";
import {LOCAL_STORAGE_STATE_NAME, dmTraerDatosFormulario} from "../unlogged/redux-formulario";
import { CasoState } from "../unlogged/tipos";


async function traerHdr(opts:{modoDemo:boolean}){
    await dmTraerDatosFormulario(opts);
    history.replaceState(null, '', `${location.origin+location.pathname}/../campo`);
    location.reload();   
}

myOwn.wScreens.sincronizar_dm=function(){
    var mainLayout = document.getElementById('main_layout')!;
    if(myOwn.existsLocalVar(LOCAL_STORAGE_STATE_NAME)){
        mainLayout.appendChild(html.p('El dispositivo tiene información cargada').create());
        var downloadButton = html.button({class:'download-dm-button'},'descargar').create();
        mainLayout.appendChild(downloadButton);
        downloadButton.onclick = async function(){
            //TODO descargar hdr
            
            //traer nueva
            await traerHdr({modoDemo:false});
        }
    }else{
        mainLayout.appendChild(html.p('Sincronizar dispositivo').create());
        var loadButton = html.button({class:'load-dm-button'},'cargar').create();
        mainLayout.appendChild(loadButton);
        loadButton.onclick = async function(){
            //traer nueva
            await traerHdr({modoDemo:false});
        }
    }
};

myOwn.wScreens.demo=function(){
    window.desplegarFormularioActual({modoDemo:true});
}

function arrayFlat<T>(arrays:T[][]):T[]{
    return [].concat.apply([], arrays);
}

myOwn.clientSides.mios={
    update: true,
    prepare: function(depot, fieldName){
        depot.row[fieldName]=true;
        depot.rowControls[fieldName].setTypedValue(true);
        depot.rowControls[fieldName].addEventListener('update', function(){
            depot.row[fieldName]=depot.rowControls[fieldName].getTypedValue();
            depot.detailControls.cargas.divDetail=null;
        });
    }
}

var grid2:any;
myOwn.wScreens.asignacion_recepcion={
    parameters:[
        {name:'area'          ,grilla:1, typeName:'integer'                  },
        //{name:'area2'          ,grilla:1, typeName:'integer'                  },
        {name:'carga_rol'     ,grilla:2, typeName:'text'    , label:'rol'    , references:'roles'   },
        {name:'carga_persona' ,grilla:2, typeName:'integer' , label:'persona', references:'personal'},
        {name:'carga'         ,grilla:2, typeName:'date'    , label:'fecha'  },
    ],
    proceedLabel:'buscar',
    mainAction:async function(params:any,divResult:HTMLElement){
        //TODO definir cjto seleccionable a asignar
        var my=myOwn;
        if(!params.area  ){
            divResult.textContent='falta ingresar area.';
        }else if(!params.carga_persona || !params.carga || !params.carga_rol){
            divResult.textContent='falta ingresar rol, persona y fecha.';
        }else{
            var {area, carga_rol, ...params2} = params;
            var params1 = {area};
            var gridDiv = html.div().create();
            var gridResult = html.div().create();
            var hdrDiv = html.div({class:['solo-para-imprimir','hdr-eseco']}).create();
            var buttonImprimir=my.createForkeableButton({w:'hdr',up:{imprimir:true, persona:params.carga_persona, fecha:params.carga}},{label:'imprimir'});
            divResult.appendChild(buttonImprimir);
            var capturePrint=async function(e){
                if(e.ctrlKey && e.keyCode == 80){
                    e.preventDefault();
                    window.location = buttonImprimir.href;
                }
            };
            window.onkeydown=capturePrint
            window.onkeyup=capturePrint
            window.onkeypress=capturePrint
            divResult.appendChild(gridDiv);
            divResult.appendChild(html.br().create());
            divResult.appendChild(gridResult);
            divResult.appendChild(hdrDiv);
            var fixedFields:{fieldName: string, value: any}[] = [];
            //TODO como filtrar por un rango de area
            likeAr(params1).forEach(function(value:any, attrName:string){
                if(value!=null){
                    fixedFields.push({fieldName: attrName, value: value});
                }
            });
            var grid=my.tableGrid('tem_seleccionable',gridDiv,{tableDef:{
                //hiddenColumns:[],
            }, fixedFields:fixedFields});
            grid.screenParams=params;
            var fixedFieldsResult:{fieldName: string, value: any}[] = [];
            likeAr(params2).forEach(function(value:any, attrName:string){
                fixedFieldsResult.push({fieldName: attrName, value: value});
            });
            grid2=my.tableGrid('tem',gridResult,{tableDef:{
                title:'asignación',
                name:'Asignación',
                //hiddenColumns:[],
            }, fixedFields:fixedFieldsResult});
            await grid.waitForReady();
            await grid2.waitForReady();
            function desplegarHDR(){
                hdrDiv.innerHTML="";
                var campos=['enc','area','reserva','nomcalle','nrocatastral','piso','edificion','departamento','habitacion','barrio'];
                var tabla = html.table(
                    [html.tr(
                        campos.map(function(name){
                            return html.th(name);
                        })
                    )].concat(
                        arrayFlat(grid2.depots.filter(function(depot:myOwn.Depot){
                            return depot.row.cnombre != 'PRUEBA' //HACKAZO para que no imprima encuestas de prueba
                        }).map(function(depot:myOwn.Depot){
                            return [
                                html.tr(
                                    campos.map(function(campo){
                                        var value = depot.row[campo];
                                        return html.td((value||'').toString());
                                    })
                                ),
                                depot.row.obs?html.tr([html.td({class:'hdr-observaciones'}),html.td({class:'hdr-observaciones', colspan:99}, depot.row.obs)]):null,
                                depot.row.telefonos?html.tr([html.td({class:'hdr-telefonos'}),html.td({class:'hdr-telefonos', colspan:99}, depot.row.telefonos)]):null,
                                depot.row.seleccionado?html.tr([html.td({class:'hdr-seleccionado'}),html.td({class:'hdr-seleccionado', colspan:99}, depot.row.seleccionado)]):null
                            ]
                        }))
                    )
                ).create();
                hdrDiv.appendChild(tabla);
            }
            desplegarHDR();
            grid.dom.main.addEventListener('savedRowOk',async function(){
                await bestGlobals.sleep(500);
                await grid2.refresh();
                desplegarHDR();
            });
        }
    }
}


myOwn.clientSides.seleccionarCaso={
    prepare: function(depot, fieldName){
        var grid = depot.manager;
        var params = grid.screenParams;
        let rowCtrl = depot.rowControls;
        async function updateFunc(depot, fieldName){
            const {operativo, enc} = depot.row;
            if(rowCtrl.seleccionar.getTypedValue()){
                await my.ajax.asignar_caso({operativo, enc, nuevo_rol:params.carga_rol});
                rowCtrl.carga_persona.setTypedValue(params.carga_persona, true);
                rowCtrl.carga_rol.setTypedValue(params.carga_rol, true);
                rowCtrl.carga.setTypedValue(params.carga, true);
            } else {
                //blanquear campos
                if (rowCtrl.estados__tipo_estado && rowCtrl.estados__tipo_estado.getTypedValue() == 'asignado'){
                    await my.ajax.des_asignar_estado({operativo, enc});
                }
                rowCtrl.carga_persona.setTypedValue(null, true);
                rowCtrl.carga_rol.setTypedValue(null, true);
                rowCtrl.carga.setTypedValue(null, true);
            }
            await grid.retrieveRowAndRefresh(depot);
        }
        rowCtrl.seleccionar.addEventListener('update', function(){updateFunc(depot, fieldName)});
    },
    update: function(depot, fieldName){
        var grid = depot.manager;
        var value = grid.screenParams.carga_rol == depot.row.carga_rol &&
            grid.screenParams.carga_persona == depot.row.carga_persona &&
            bestGlobals.sameValue(grid.screenParams.carga, depot.row.carga);
        value=value?value:null;
        depot.rowControls[fieldName].setTypedValue(value);
    }
}
