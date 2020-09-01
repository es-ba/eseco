var CACHE_NAME = 'static-cache';
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
    .catch(async function(err){
      hayError=true;
      console.log("error al cargar service worker", err)
      //informar error
    })
    .finally(async function(){
      if(!hayError){
        console.log("instalacion correcta");
        //informar correcto
      }
    })
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
  if(sourceIsCached){
    event.respondWith(
      caches.match(event.request)
      .then(function(response) {
        return response;
      })
    );
  }else{
    return false;
  }
});