/*
 * This is a self-destroying service worker as described by
 * https://medium.com/@nekrtemplar/self-destroying-serviceworker-73d62921d717
 *
 * A previous version of this site used Gatsby, and included a service worker to
 * make the site work offline. That worker needs to be unregistered, or it will
 * continue to serve the old version of the site.
 */

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  self.registration.unregister()
    .then(function() {
      return self.clients.matchAll();
    })
    .then(function(clients) {
      clients.forEach(client => client.navigate(client.url))
    });
});
