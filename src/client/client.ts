import {html, HtmlTag} from "js-to-html";
import * as myOwn from "myOwn";
import {LOCAL_STORAGE_STATE_NAME, dmTraerDatosFormulario, traerEstructura} from "../unlogged/redux-formulario";
import { CasoState, EtiquetaOpts, IdVariable, IdCaso } from "../unlogged/tipos";
import { crearEtiqueta } from "../unlogged/generador-qr";
import * as TypedControls from "typed-controls";
import * as likeAr from "like-ar";

const OPERATIVO = 'ESECO';

async function traerHdr(opts:{modoDemo:boolean, vivienda?:IdCaso}){
    await dmTraerDatosFormulario(opts);
    history.replaceState(null, '', `${location.origin+location.pathname}/../campo`);
    location.reload();   
}


function htmlNumero(num:number){
    return html.span({class:'numero'},''+(num??''))
}

async function sincronizarDatos(state:CasoState|null){
    var datos = await my.ajax.dm_sincronizar({datos:state?.datos||null});
    var estructura = await traerEstructura({operativo:OPERATIVO})
    if(state==null){
        state={};
    }
    state.datos=datos;
    state.estructura=estructura;
    state.modo = {
        demo: false
    }
    state.opciones = {
        bienvenido: false,
        forPk: null,
        modoDespliegue: "relevamiento",
        modoDirecto: false,
    }
    state.feedbackRowValidator={};
    my.setLocalVar(LOCAL_STORAGE_STATE_NAME, state);
    return datos;
}

async function abrirDirecto(enc:IdCaso){
    if(!my.getSessionVar(LOCAL_STORAGE_STATE_NAME)){
        var datos = await my.ajax.dm_enc_cargar({enc:enc});
        var state={};
        state.datos=datos;
        state.feedbackRowValidator={};
        my.setSessionVar(LOCAL_STORAGE_STATE_NAME, state);
    }
}

myOwn.wScreens.sincronizar_dm=function(){
    var mainLayout = document.getElementById('main_layout')!;
    // TODO: Generalizar
    var dv1='dv1' as IdVariable;
    var c5ok='c5ok' as IdVariable;

    if(myOwn.existsLocalVar(LOCAL_STORAGE_STATE_NAME)){
        var state: CasoState = my.getLocalVar(LOCAL_STORAGE_STATE_NAME);
        mainLayout.appendChild(html.div({class:'aviso'},[
            html.h4('información a transmitir'),
            html.p([htmlNumero(likeAr(state.datos.cargas).array().length),' areas: ',likeAr(state.datos.cargas).keys().join(', ')]),
            html.p([htmlNumero(likeAr(state.datos.hdr).array().length),' viviendas']),
            html.p([htmlNumero(likeAr(state.datos.hdr).filter(dv=>dv.respuestas?.[dv1]==1 && dv.respuestas?.[c5ok]==1).array().length),' viviendas con muestras']),
        ]).create());
        var downloadButton = html.button({class:'download-dm-button-cont'},'proceder ⇒').create();
        mainLayout.appendChild(downloadButton);
        var divAvisoSincro:HTMLDivElement=html.div().create();
        mainLayout.appendChild(divAvisoSincro);
        downloadButton.onclick = async function(){
            downloadButton.disabled=true;
            downloadButton.className='download-dm-button';
            divAvisoSincro.innerHTML='';
            try{
                var datos = await sincronizarDatos(state);
                divAvisoSincro.append(html.div({id:'aviso-sincro'}, [
                    html.p(["Número de sincronización: ", html.b(""+datos.num_sincro)]),
                    html.h4('datos recibidos'),
                    html.p([htmlNumero(likeAr(datos.cargas).array().length),' areas: ',likeAr(state.datos.cargas).keys().join(', ')]),
                    html.p([htmlNumero(likeAr(datos.hdr).array().length),' viviendas']),
                    html.p([htmlNumero(likeAr(datos.hdr).filter(dv=>dv.respuestas?.[dv1]==1 && dv.respuestas?.[c5ok]==1).array().length),' viviendas con muestras']),
                    html.a({href:'./campo'},[html.b('IR A LA HOJA DE RUTA')])
                ]).create());
                //traer nueva
                // await traerHdr({modoDemo:false});
            }catch(err){
                alertPromise(err.message)
            }finally{
                downloadButton.disabled=false;
            }
        }
    }else{
        mainLayout.appendChild(html.div({class:'aviso'},[
            html.h4('Sistema vacío'),
            html.p('No hay información de formularios'),
            html.p('No hay información de viviendas')
        ]).create());
        var loadButton = html.button({class:'load-dm-button'},'proceder').create();
        mainLayout.appendChild(loadButton);
        loadButton.onclick = async function(){
            //traer nueva
            await sincronizarDatos(null);
            await traerHdr({modoDemo:false});
        }
    }
};


myOwn.wScreens.proc.result.qrs_traer = async (result:{etiquetas:EtiquetaOpts[]}, divResult:HTMLDivElement)=>{
    var planchas=html.div({class:"planchas"}).create();
    // var etiquetas:HtmlTag<HTMLDivElement>[]=[];
    var etiquetas:HTMLDivElement[]=[];
    divResult.appendChild(planchas);
    var planchaAnterior='';
    var cerrarPlancha=function(){
        planchas.appendChild(html.div({class:'pre-plancha'}, [
            html.div("PLANCHA "+planchaAnterior+" - Dirección General de Estadística y Censos - ESECO 201")
        ]).create());
        planchas.appendChild(html.div({class:'plancha'},etiquetas).create());
        etiquetas=[];
    }
    for(let etiqueta of result.etiquetas){
        let etiquetaDiv = await crearEtiqueta(etiqueta, 128);
        if(planchaAnterior!=etiqueta.plancha){
            if(planchaAnterior){
                cerrarPlancha();
            }
            planchaAnterior=etiqueta.plancha;
        }
        etiquetas.push(etiquetaDiv);
    }
    cerrarPlancha();
}

function mostrarDatosPersona(hayDatos:boolean, datos:any, divResult:HTMLDivElement){
    //TODO: EVALUAR SI CONVIENE TRAERLO DE LA BASE
    var tiposDocumento = ['DNI argentino', 'Documento extranjero', 'No tiene documento', 'Otro'];
    var paisDocumento = ['Uruguay', 'Paraguay', 'Brasil', 'Bolivia', 'Chile', 'Perú', 'Venezuela', 'Otro'];
    divResult.appendChild(
        hayDatos?
            html.div({class:'datos-persona-cargada'},[
                html.h2("Datos persona"),
                html.div({class:'ficha-persona'},[
                    html.div([html.label('Apellido: '), datos.apellido]),
                    html.div([html.label('Nombres: '), datos.nombres]),
                    datos.tipoDocumento?
                        html.div([
                            html.label('Tipo documento: '), 
                            tiposDocumento[datos.tipoDocumento-1],
                            datos.tipoDocumento==4 && datos.tipoDocumentoEspecificado?' ('+ datos.tipoDocumentoEspecificado+')':'',
                        ])
                    :
                        '',
                    datos.tipoDocumento==2 && datos.paisDocumento?
                        html.div([
                            html.label('Pais: '), 
                            paisDocumento[datos.paisDocumento-1],
                            datos.paisDocumento==8 && datos.paisDocumentoEspecificado?' ('+datos.paisDocumentoEspecificado+')':'',
                        ])
                    :
                        '',
                    datos.tipoDocumento!=3 && datos.tipoDocumento?html.div([html.label('Nº Documento: '), datos.documento]):'',
                    datos.celular?html.div([html.label('Cel.: '), datos.celular]):'',
                    datos.email?html.div([html.label('Email: '), datos.email]):'',
                    datos.telefonoAlternativo?html.div([html.label('Tel. alternativo: '), datos.telefonoAlternativo]):'',
                    datos.observaciones?html.div([html.label('Observaciones: '), datos.observaciones]):'',
                ])
            ]).create()
        :
            html.p("No se encontró una encuesta para la etiqueta cargada").create()
    )
}

var wScreenProcResultResultadoLaboratorio = function(atributo:string, mensajeNo){
    return async (result:{estado:'ok'|'tenia', hayDatos:boolean, datos:any}, divResult:HTMLDivElement)=>{
        divResult.removeAttribute("style");
        divResult.setAttribute(atributo,result.estado);
        divResult.appendChild(
            html.h2({class:result.estado}, result.estado=="ok"?'ok':mensajeNo).create()
        )
        mostrarDatosPersona(result.hayDatos, result.datos, divResult);
    }
}
myOwn.clientSides.avisar={
    prepare: (depot, fieldName)=>{
        var avisarButton = html.button({class:'avisar-button'},'aviso').create();
        depot.rowControls[fieldName].appendChild(avisarButton);
        avisarButton.onclick = async function(){
            try{
                avisarButton.disabled=true;
                await my.ajax.etiqueta_avisar({operativo: depot.row['operativo'], etiqueta:depot.row['etiqueta']});        
                var grid=depot.manager;
                grid.retrieveRowAndRefresh(depot)
            }catch(err){
                alertPromise(err.message)
            }finally{
                avisarButton.disabled=false;
            }
        }
    },
    update: false,
};

export function replaceSpecialWords(text:string, nombre:string, apellido:string, resultado:string):string{
    function capitalizeFirstLetter(text:string) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    var simplificatedChars={
        "#nombre":capitalizeFirstLetter(nombre),
        "#apellido":capitalizeFirstLetter(apellido),
        "#resultado":resultado,
    };
    var re = new RegExp(Object.keys(simplificatedChars).join("|"),"gi");

    return text.replace(re, function(matched){
        return simplificatedChars[matched.toLowerCase()];
    });
}

myOwn.clientSides.avisar_email={
    prepare: (depot, fieldName)=>{
        var {email, resultado, nombre, apellido, mail_aviso_texto, mail_aviso_asunto, tipo_informe} = depot.row;
        if(resultado && email && resultado.toLowerCase()=='negativo' && tipo_informe!='5'){
            // OJO QUE EL TEXTO CAMBIA MUCHO SI FUERA A POSITIVOS.
            var body = replaceSpecialWords(mail_aviso_texto || '', nombre || '', apellido || '', resultado || '');
            var subject = replaceSpecialWords(mail_aviso_asunto || '', nombre || '', apellido || '', resultado || '');
            var avisarEmailButton = html.a({
                class:'email-button',
                href:`mailto:${email}?Subject=${subject}&body=${body}`
            },'enviar mail').create();
            depot.rowControls[fieldName].appendChild(avisarEmailButton);
        }else if(tipo_informe==5){
            depot.rowControls[fieldName].appendChild(html.span("geriatrico").create());
        }else if(resultado && resultado.toLowerCase()!='negativo'){
            depot.rowControls[fieldName].appendChild(html.span("avisa salud").create());
        }
    },
    update: false,
};

myOwn.wScreens.proc.result.resultado_cargar = wScreenProcResultResultadoLaboratorio('resultado-rectificar', "No se cargó el resultado ya que fue cargado anteriormente. Vaya a rectificar si desea modificalo.");

myOwn.wScreens.proc.result.resultado_rectificar = wScreenProcResultResultadoLaboratorio('resultado-rectificar', "No se cargó la rectificación revise el número de rectificación.");

myOwn.wScreens.proc.result.laboratorio_ingresar = wScreenProcResultResultadoLaboratorio('resultado-cargar', "Recepción de la muestra ya había sido registrada");

myOwn.wScreens.resultados_ver = async ()=>{
    var mainLayout = document.getElementById('main_layout')!;
    mainLayout.appendChild(html.h1('ingrese fecha de busqueda').create());
    var fechaElement=html.td({style:'min-width:100px; border:solid 1px black', "typed-controls-direct-input":"true"}).create();
    var searchButton = html.button({class:'ver-resultados-button'},'buscar').create();
    var allButton = html.button({class:'ver-todos-resultados-button'},'todos').create();
    mainLayout.appendChild(html.label(['fecha:',fechaElement]).create());
    mainLayout.appendChild(searchButton);
    mainLayout.appendChild(allButton);
    TypedControls.adaptElement(fechaElement,{typeName:'date'});
    var resultDiv=html.div({id:"grilla-resultados-div"}).create();
    mainLayout.appendChild(resultDiv);
    searchButton.onclick=async ()=>{
        resultDiv.innerHTML='';
        var fecha;
        try{
            fecha = fechaElement.getPlainValue();
        }catch(err){
            fechaElement.setTypedValue(null)
        }
        var fixedFields = [];
        if(fecha){
            fixedFields.push({fieldName: 'fecha', value: fecha})
            
        }
        my.tableGrid('etiquetas_resultado',resultDiv,{tableDef:{}, fixedFields})
    }
    allButton.onclick=async ()=>{
        resultDiv.innerHTML='';
        fechaElement.setTypedValue(null)
        my.tableGrid('etiquetas_resultado',resultDiv,{tableDef:{}})
    }
}

myOwn.wScreens.abrirDirecto=async function(addrParams){
    try{
        await abrirDirecto(addrParams.enc);
        desplegarFormularioActual({modoDemo:false, vivienda:addrParams.enc, useSessionStorage:true});
    }catch(err){
        alertPromise(err.message)
    }
};

var crearBotonVer = (depot, fieldName, label:'abrir'|'ver'){
    //var openButton = my.createForkeableButton({w:'abrirDirecto',enc:depot.row.enc},{label})
    var openButton = html.button({class:'open-dm-button'},label).create();
    depot.rowControls[fieldName].innerHTML='';
    depot.rowControls[fieldName].appendChild(openButton);
    openButton.onclick = async function(){
        var urlAndWindowName = 'menu#w=abrirDirecto&enc='+depot.row.enc;
        window.open(urlAndWindowName,urlAndWindowName);
    }
}

myOwn.clientSides.abrir={
    prepare: (depot, fieldName)=>{},
    update: (depot, fieldName)=>{
        var label = depot.row.cargado_dm?'ver':'abrir';
        crearBotonVer(depot,fieldName,label);
    }
};

myOwn.clientSides.abrirRecepcion={
    prepare: (depot, fieldName)=>{},
    update: (depot, fieldName)=>{
        var label = depot.row.cargado?'ver':'abrir';
        crearBotonVer(depot,fieldName,label);
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
        {name:'semana'        ,grilla:1, typeName:'integer'                  , references:'semanas' },
        {name:'lote'          ,grilla:1, typeName:'integer'                  , references:'lotes'   },
        {name:'carga_rol'     ,grilla:2, typeName:'text'    , label:'rol'    , references:'roles'   , defaultValue:'relevador'},
        {name:'carga_persona' ,grilla:2, typeName:'text'    , label:'persona', references:'personal'},
        {name:'carga'         ,grilla:2, typeName:'date'    , label:'fecha'  },
    ],
    proceedLabel:'buscar',
    mainAction:async function(params:any,divResult:HTMLElement){
        //TODO definir cjto seleccionable a asignar
        var my=myOwn;
        if(!params.semana && !params.lote){
            divResult.textContent='falta ingresar semana y/o lote.';
        }else if(!params.carga_persona || !params.carga || !params.carga_rol){
            divResult.textContent='falta ingresar rol, persona y fecha.';
        }else{
            var {semana, lote, carga_rol, ...params2} = params;
            var params1 = {semana, lote};
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
                            return depot.row.nomcalle != 'PRUEBA' //HACKAZO para que no imprima encuestas de prueba
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
