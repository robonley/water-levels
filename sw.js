// Minimal service worker: cache the app shell so it opens offline.
// Live data (api.ptdevices.com) is always fetched from the network, never cached.
var CACHE = "water-v1";
var SHELL = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var url = e.request.url;
  if (url.indexOf("api.ptdevices.com") !== -1) return; // live data: go to network
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(res){
        if (res && res.status === 200 && e.request.method === "GET") {
          var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      }).catch(function(){ return caches.match("index.html"); });
    })
  );
});
