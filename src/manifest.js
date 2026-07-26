const manifest = {
    id: "community.cinemana.local",

    version: "1.2.2",

    name: "Cinemana Local",

    description: "Watch movies and TV shows from Cinemana.",

    resources: [
        "catalog",
        "meta",
        "stream",
        "subtitles"
    ],

    types: [
        "movie",
        "series"
    ],

    catalogs: [
        {
            type: "movie",
            id: "cinemana-movies",
            name: "Cinemana Movies",
            extra: [
                {
                    name: "search"
                }
            ]
        },
        {
            type: "series",
            id: "cinemana-series",
            name: "Cinemana Series",
            extra: [
                {
                    name: "search"
                }
            ]
        }
    ],

    idPrefixes: [
        "cinemana",
        "tt"
    ]
};

module.exports = manifest;