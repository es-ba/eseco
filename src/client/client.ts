import {html} from "js-to-html";
import * as myOwn from "myOwn";
import {LOCAL_STORAGE_STATE_NAME, dmTraerDatosFormulario} from "../unlogged/redux-formulario";
import { CasoState } from "../unlogged/tipos";


async function traerHdr(){
    await dmTraerDatosFormulario();
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
            await traerHdr();
        }
    }else{
        mainLayout.appendChild(html.p('Sincronizar dispositivo').create());
        var loadButton = html.button({class:'load-dm-button'},'cargar').create();
        mainLayout.appendChild(loadButton);
        loadButton.onclick = async function(){
            //traer nueva
            await traerHdr();
        }
    }
};

myOwn.wScreens.mostrarFormulario=function(){
    window.desplegarFormularioActual();
}