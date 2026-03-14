const CACHE_NAME = "calculadora3d-v1"

const urlsToCache = [

"/",
"/index.html",
"/styles.css",
"/script.js",
"/logo.png"

]

self.addEventListener("install", event => {

event.waitUntil(

caches.open(CACHE_NAME)
.then(cache => cache.addAll(urlsToCache))

)

})

self.addEventListener("fetch", event => {

event.respondWith(

caches.match(event.request)
.then(response => {

return response || fetch(event.request)

})

)

})