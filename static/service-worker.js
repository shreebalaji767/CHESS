const CACHE_NAME =
    "chess-master-v1";


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

            caches
                .open(CACHE_NAME)
                .then(
                    cache =>
                        cache.addAll(
                            FILES
                        )
                )

        );

    }
);


self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches
                .match(
                    event.request
                )
                .then(
                    cached => {

                        if (cached)
                            return cached;


                        return fetch(
                            event.request
                        )
                        .then(
                            response => {

                                const copy =
                                    response.clone();


                                caches
                                    .open(
                                        CACHE_NAME
                                    )
                                    .then(
                                        cache =>
                                            cache.put(
                                                event.request,
                                                copy
                                            )
                                    );


                                return response;

                            }
                        )
                        .catch(
                            () =>
                                caches.match("/")
                        );

                    }
                )

        );

    }
);
