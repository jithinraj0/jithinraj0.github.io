'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/asset/png/ecreditslogo.png": "da7fb7350749c4596d045ebe08c44e28",
"assets/asset/png/figma.png": "a69ddf3866df54bc62101de585a181ea",
"assets/asset/png/flutter.png": "bc20ac3c833cdfbb9230c8a0dc483d46",
"assets/asset/png/getonplaystore.png": "db9b21a1c41f3dcd9731e1e7acfdbb57",
"assets/asset/png/google-play-badge.png": "db9b21a1c41f3dcd9731e1e7acfdbb57",
"assets/asset/png/Group%252021newdp(1).png": "e406776998cf9d7b7d5aca0907ef2671",
"assets/asset/png/icons8-mouse-48.png": "c2a80e9ce074ccecc019ac36fa5d374b",
"assets/asset/png/image1.png": "834abe26883e0301aca0f32d74bdf257",
"assets/asset/png/java.png": "0414fcd53fdb6903fb57134fdd8a9af2",
"assets/asset/png/logo.png": "51209bc8ba5beafc93dbc497e9249f08",
"assets/asset/png/mouse.png": "fe4ee4ca33c10e89971d6af126278816",
"assets/asset/png/mysql.png": "011426dfbd8493e9905247d5b6991722",
"assets/asset/png/nativeandroid.png": "e22997feaac464c25d13e2d50e0eb394",
"assets/asset/png/newdp.png": "c7c9e5205b4b02c0babfa27d3096a277",
"assets/asset/png/newpic.png": "fdf9e22ef941df74a1f60bc9b09c87a2",
"assets/asset/png/playstore.png": "8b279331e2c964c5e5593f94f8e393a6",
"assets/asset/png/profilepic.png": "d9a3309d641378086416a132f1228630",
"assets/asset/png/shefinlogo.png": "6cc69f827d2b6367cf767b2abec522d4",
"assets/asset/png/shefinmockup.png": "56081bd05146495b8b8d293c3d098f46",
"assets/asset/png/wordpress.png": "7abe95c5b9c4ee5ed2bb6201053f0ea1",
"assets/asset/svg/21newdp.svg": "34118480c178c71e9bd9a7777adc1954",
"assets/asset/svg/icons8-github.svg": "c97e18f114a06fc0e4e9f545123b35d2",
"assets/asset/svg/icons8-instagram.svg": "d8a6305c68af5644a148787fe59d5ddb",
"assets/asset/svg/icons8-linkedin.svg": "35de4736a3445fb0283f842bc0d8e6b8",
"assets/AssetManifest.json": "d295b92a625f021b6c00d44e8a37740c",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "3010bd1f30897762065483d9bd1866a0",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "83aad8161036d7914312d57e5e7e354f",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "8f6cb690a98e024cf134911230579b5b",
"/": "8f6cb690a98e024cf134911230579b5b",
"main.dart.js": "22167fae078ba95bcd60eb89cc329098",
"manifest.json": "bc6777f3c2ffe03e2a91be8c8f4ac7db",
"version.json": "92a047e12e6cc776051d519221dfb5a1"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
