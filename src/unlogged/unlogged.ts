"use strict";
import {LOCAL_STORAGE_STATE_NAME} from "../unlogged/dm-react";
import {html}  from 'js-to-html';
import * as AjaxBestPromise from "ajax-best-promise";

window.addEventListener('load', async function(){
    var layout = document.getElementById('total-layout')!;
    if(!layout){
        console.log('no encuentro el DIV.total-layout')
        await myOwn.ready;
        layout = document.getElementById('total-layout')!;
    }
    await myOwn.ready;
    layout.innerHTML='<div id=main_layout></div><span id="mini-console"></span>';
    var url = new URL(window.location.href);
    if(location.pathname.endsWith('/dm')){
        if(myOwn.existsLocalVar(LOCAL_STORAGE_STATE_NAME)){
            const {periodo, panel, tarea} = myOwn.getLocalVar(LOCAL_STORAGE_STATE_NAME)!;
            history.replaceState(null, '', `${location.origin+location.pathname}/../hdr?periodo=${periodo}&panel=${panel}&tarea=${tarea}`);
            location.reload();
        }else{
            layout.appendChild(html.div([
                html.p('Dispositivo sin carga'), 
                html.p('Sitio seguro para sacar el ícono'), 
                html.img({src:'img/logo-dm.png'}),
                html.p([html.a({href:'./menu#i=dm2,sincronizar_dm2'},'ir a sincronizar')])
            ]).create());        
        }
    }else{
        const periodo = url.searchParams.get("periodo");
        const panel = url.searchParams.get("panel");
        const tarea = url.searchParams.get("tarea");
        //@ts-ignore existe 
        dmHojaDeRuta({addrParamsHdr:{periodo, panel, tarea}});
    }
})

var wasDownloading=false;
var appCache = window.applicationCache;
appCache.addEventListener('downloading', async function() {
    wasDownloading=true;
    var layout = await awaitForCacheLayout;
    layout.insertBefore(
        html.p({id:'cache-status', class:'warning'},[
            'descargando aplicación, por favor no desconecte el dispositivo',
            html.img({src:'img/loading16.gif'}).create()
        ]).create(), 
        layout.firstChild
    );
}, false);
appCache.addEventListener('error', async function(e:Event) {
    // @ts-ignore es ErrorEvent porque el evento es 'error'
    var errorEvent:ErrorEvent = e;
    if(wasDownloading){
        console.log('error al descargar cache', errorEvent.message)
        var layout = await awaitForCacheLayout;
        var cacheStatusElement = document.getElementById('cache-status');
        if(!cacheStatusElement){
            cacheStatusElement = html.p({id:'cache-status'}).create();
            layout.insertBefore(cacheStatusElement, layout.firstChild);
        }
        cacheStatusElement.classList.remove('warning')
        cacheStatusElement.classList.add('danger')
        cacheStatusElement.textContent='error al descargar la aplicación. ' + errorEvent.message;
    }
}, false);

async function cacheReady(){
    wasDownloading=false;
    var {periodo, panel, tarea} = myOwn.getLocalVar(LOCAL_STORAGE_STATE_NAME)||{};
    var result:string = await AjaxBestPromise.get({
        url:`carga-dm/${periodo?`${periodo}p${panel}t${tarea}_manifest.manifest`:'dm-manifest.manifest'}`,
        data:{}
    });
    myOwn.setLocalVar('ipc2.0-app-cache-version',result.split('\n')[1]);
    setTimeout(function(){
        var cacheStatusElement = document.getElementById('cache-status')!;
        if(!cacheStatusElement){
            var mainLayout = document.getElementById('main_layout')!;
            cacheStatusElement = html.p({id:'cache-status'}).create();
            mainLayout.insertBefore(cacheStatusElement, mainLayout.firstChild);
        }
        setTimeout(function(){
            cacheStatusElement.classList.add('all-ok')
            cacheStatusElement.textContent='aplicación actualizada, puede desconectar el dispositivo';
            setTimeout(function(){
                cacheStatusElement.style.display='none';
            }, 5000);
            setTimeout(function(){
                location.reload();
            },2000)
        }, 5000);
    },500)
}
appCache.addEventListener('updateready', function () {
    console.log("actualiza cache");
    if (appCache.status == appCache.UPDATEREADY) {
        console.log("swap cache");
        appCache.swapCache()
    }
    cacheReady()
}, false);
appCache.addEventListener('cached', function() {
    console.log("cachea primera vez");
    cacheReady()
}, false );

var awaitForCacheLayout = async function prepareLayoutForCache(){
    await new Promise(function(resolve, _reject){
        window.addEventListener('load',resolve);
    });
    var layout=(document.getElementById('cache-layout')||document.createElement('div'));
    if(!layout.id){
        layout.id='cache-layout';
        layout.appendChild(html.div({id:'app-versions'}).create());
        layout.appendChild(html.div({id:'app-status'}).create());
        document.body.appendChild(layout.appendChild(html.div({id:'cache-log'}).create()));
        document.body.insertBefore(layout,document.body.firstChild)
    }
    return layout;
}();

//@ts-ignore no se usa quizás haya que quitarlo. Aparentemente se copió de hoja-de-ruta.js
async function displayWhenReady(message:string, type:string, message2:string, _enOtroRenglon:string){
    // var layout = await awaitForCacheLayout;
    var logLayout = document.getElementById('cache-log')!;
    var texto = logLayout.firstElementChild;
    texto=document.createElement('div');
    logLayout.appendChild(texto);
    texto.className='log_manifest';
    texto.textContent=message;
    if(type!='progress'){
        var texto2=document.createElement('span');
        texto2.className='mensaje_alerta';
        texto2.textContent=' '+message2;
        texto.appendChild(texto2);
    }
}
