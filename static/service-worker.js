const CACHE_NAME = "chess-academy-v1";

const FILES = [
    "/",
    "/static/css/style.css",
    "/static/js/chess.js",
    "/static/js/academy.js",
    "/static/js/app.js",
    "/static/manifest.json"
];


self.addEventListener(
    "install",
    event => {

        event.waitUntil(
            caches.open(
                CACHE_NAME
            ).then(
                cache =>
                    cache.addAll(
                        FILES
                    )
            )
        );

        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(
            caches.keys().then(
                keys =>
                    Promise.all(
                        keys
                            .filter(
                                key =>
                                    key !==
                                    CACHE_NAME
                            )
                            .map(
                                key =>
                                    caches.delete(
                                        key
                                    )
                            )
                    )
            )
        );

        self.clients.claim();

    }
);


self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches.match(
                event.request
            ).then(
                cached => {

                    if (cached) {
                        return cached;
                    }

                    return fetch(
                        event.request
                    );

                }
            )

        );

    }
);
