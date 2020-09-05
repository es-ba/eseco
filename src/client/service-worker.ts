"use strict";
const CACHE_NAME = '#20-09-04';
var urlsToCache = [
    "campo",
    "lib/react.production.min.js",
    "lib/react-dom.production.min.js",
    "lib/material-ui.production.min.js",
    "lib/clsx.min.js",
    "lib/redux.min.js",
    "lib/react-redux.min.js",
    "lib/require-bro.js",
    "lib/like-ar.js",
    "lib/best-globals.js",
    "lib/json4all.js",
    "lib/js-to-html.js",
    "lib/redux-typed-reducer.js",
    "lib/memoize-one.js",
    "adapt.js",
    "tipos.js",
    "digitov.js",
    "redux-formulario.js",
    "render-general.js",
    "render-formulario.js",
    "client_modules/row-validator.js",
    "unlogged.js",
    "lib/js-yaml.js",
    "lib/xlsx.core.min.js",
    "lib/lazy-some.js",
    "lib/sql-tools.js",
    "dialog-promise/dialog-promise.js",
    "moment/min/moment.js",
    "pikaday/pikaday.js",
    "lib/polyfills-bro.js",
    "lib/big.js",
    "lib/type-store.js",
    "lib/typed-controls.js",
    "lib/ajax-best-promise.js",
    "my-ajax.js",
    "my-start.js",
    "lib/my-localdb.js",
    "lib/my-websqldb.js",
    "lib/my-localdb.js.map",
    "lib/my-websqldb.js.map",
    "lib/my-inform-net-status.js",
    "lib/my-skin.js",
    "lib/cliente-en-castellano.js",
    "client/client.js",
    "client/menu.js",
    "dialog-promise/dialog-promise.css",
    "pikaday/pikaday.css",
    "css/offline-mode.css",
    "css/formulario-react.css",
    "img/main-loading.gif",
];
var hayError=false;
self.addEventListener('install', async function(event){
  //si hay cambios no espero para cambiarlo
  self.skipWaiting();
  console.log("instalando")
  var wasDownloading=true;
  //informar descargando
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache){
      return cache.addAll(urlsToCache);
    })
    //.catch(async function(err){
    //  hayError=true;
    //  console.log("error al cargar service worker", err)
    //  //informar error
    //})
    //.finally(async function(){
    //  if(!hayError){
    //    console.log("instalacion correcta");
    //    //informar correcto
    //  }
    //})
  );
});

self.addEventListener('fetch', function(event) {
  var sourceParts = event.request.url.split('/');
  var source:string = sourceParts[sourceParts.length-1];
  var sourceIsCached = urlsToCache.find((url:string)=>{
    let urlParts = url.split('/')
    let myUrl = urlParts[urlParts.length-1]
    return myUrl==source
  });
  console.log("source",source)
  if(source=='@version'){
    var miBlob = new Blob();
    var opciones = { "status" : 200 , "statusText" : CACHE_NAME, ok:true };
    var miRespuesta = new Response(miBlob,opciones);
    event.respondWith(miRespuesta);
  }
  if(sourceIsCached && !event.request.url.includes('login')){
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(event.request)
        .then(function(response) {
          return response;
        })
      })
    );
  }else{
    console.log("busca fuera de la cache")
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (!response.ok) {
          console.log("no tiene respuesta")
          throw Error('response status ' + response.status);
        }
        return response;
      }).catch(function(_err) {
        return new Response("<p>Se produjo un error al intentar cargar la p&aacute;gina, es posible que no haya conexi&oacute;n a internet</p><a href=/eseco/campo>Volver a Hoja de Ruta</button>", {
          headers: {'Content-Type': 'text/html'}
        });
      })
    );
  }
});
self.addEventListener('activate', function(event) {
  console.log("borrando caches viejas")
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName != CACHE_NAME
        }).map(function(cacheName) {
          console.log("borrando cache ", cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});