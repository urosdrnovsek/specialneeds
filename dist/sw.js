'use strict';
// Offline support. The app shell (every file index.html references, with its ?v= stamp) is cached on
// install, so the app opens and plays without a connection. Word pictures are cached the first time
// they are shown. VERSION and ASSETS are rewritten by `npm run stamp`, so every release updates the cache.
const VERSION = '31dde4f86d';
const ASSETS = ["style.css?v=dde4ea930a","friendly.css?v=a83b7cf158","pathways.css?v=abb9b3123c","calm.css?v=910dcc78cd","focus.css?v=be9ba107e2","playroom.css?v=72c32fb24f","skill-library.css?v=688c302bea","touch-play.css?v=8c8d4a70ab","quick-play.css?v=8d7b412744","world.css?v=9a41fd3c4b","vocabulary.css?v=c3f2b8b49b","course-flow.css?v=7f0c6d2e47","reading.css?v=66b0a51370","reading-more.css?v=9b5159a0e2","reading-adventures.css?v=61414a52f1","purposeful-play.css?v=4e353303e2","reading-word-games.css?v=4fa1029c9e","studio.css?v=ffc97051cc","studio-design.css?v=e3bd67da68","studio-missions.css?v=bc772b7705","design-system.css?v=d58ab18d7f","play-plus.css?v=af4324a39b","app-storage.js?v=a96162130e","prefs.js?v=feb39eaaad","router.js?v=3ba0196f89","app.js?v=634f456c7f","interactive.js?v=c03a6417cc","learning-data.js?v=4877a769e3","learning-art.js?v=69055f19ce","adult-data.js?v=09163872ed","adult-art.js?v=6c24eea991","adult-games.js?v=565723ac81","learning.js?v=871156567d","friendly-art.js?v=0dc9adc4b7","picture-library.js?v=48a1af9179","friendly-ui.js?v=f3d02b4b86","vocabulary-variety.js?v=2db9b82547","pathways-data.js?v=76d4c46a85","pathways.js?v=2170161466","calm-data.js?v=ed86421153","calm.js?v=ab0a6a4559","focus-data.js?v=284f098547","focus.js?v=33333683a7","playroom-data.js?v=186e7ff795","playroom-art.js?v=504d562736","playroom.js?v=cd00aa64be","world-art.js?v=b4642658db","skill-library-data.js?v=cf0701393b","vocabulary-course.js?v=2e7b6c7f65","world-course.js?v=664ccf6d0b","touch-play.js?v=c037631b54","world-play.js?v=c3df0c51cb","vocabulary-data.js?v=75e969247b","vocabulary-library.js?v=f750d33e08","reading-data.js?v=1396e3fafa","reading-more-data.js?v=fc4dfd7422","reading-word-data.js?v=749ffb75d7","reading-word-quests-data.js?v=af2579acfe","reading-paths-data.js?v=1996625514","reading-art.js?v=99e707cce7","reading.js?v=d9ba2060e4","reading-adventures.js?v=884d65e3c2","reading-more.js?v=1b3512fa6c","reading-word-games.js?v=0eb67298ca","reading-word-quests.js?v=66f2559e3d","purposeful-play.js?v=98ca21e71f","skill-library.js?v=0c82a92937","play-adventures.js?v=ec1d0c854c","course-drag.js?v=4e3263b104","quick-play.js?v=df1347b9f5","course-flow.js?v=9a4945ee61","design-covers.js?v=0ac9eb71a7","studio-pilots.js?v=569802b418","studio-research.js?v=dd3126ebf7","studio-core.js?v=98e758a6a1","studio-research-view.js?v=043e4a867c","studio-design.js?v=65102123b0","studio-missions-core.js?v=7953966fdd","studio-extra-missions.js?v=23a068e7fd","studio-missions.js?v=2dac629273","studio-device-core.js?v=bff4365671","studio-device.js?v=9a6c6dda1b","studio-content.js?v=bd174394b4","studio-review.js?v=eca7b86433","studio.js?v=74a3f20dea","design-shell.js?v=6e3047c268","play-plus.js?v=1ef8dc0a1e","site-plus.js?v=9190f72b58","manifest.webmanifest","icon.svg"];
const SHELL = 'spotmatch-shell-' + VERSION;
const PICTURES = 'spotmatch-pictures-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then(cache => cache.addAll(['./', ...ASSETS]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys.filter(k => k.startsWith('spotmatch-shell-') && k !== SHELL).map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Pages: network first so updates arrive, cached copy when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(SHELL).then(cache => cache.put('./', copy));
          return response;
        })
        .catch(() => caches.match('./'))
    );
    return;
  }
  // Word pictures: cache on first use.
  if (url.pathname.includes('/vocabulary/pictures/')) {
    event.respondWith(
      caches.open(PICTURES).then(cache =>
        cache.match(request).then(
          hit =>
            hit ||
            fetch(request).then(response => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            })
        )
      )
    );
    return;
  }
  // Versioned shell files never change under the same URL: cache first.
  event.respondWith(caches.match(request).then(hit => hit || fetch(request)));
});
