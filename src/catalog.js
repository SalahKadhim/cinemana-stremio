const api = require("./api");

function normalize(text) {
    return (text || "").toLowerCase().trim();
}

function score(item, query) {
    const title = normalize(item.title);
    query = normalize(query);

    if (title === query) return 1000;
    if (title.startsWith(query)) return 900;
    if (title.includes(query)) return 800;

    return 0;
}

async function catalogHandler(args) {

    console.log("CATALOG REQUEST:", args);

    const query = args.extra?.search;

    if (!query)
        return { metas: [] };

    let results = await api.search(query);

    console.log("RAW RESULTS:", results.length);
    console.log(results.slice(0,5));

    results = results.filter(item => {

        console.log(item.title, item.kind);

        if (args.type === "movie")
            return item.kind === 1;

        if (args.type === "series")
            return item.kind === 2;

        return true;

    });

    console.log("FILTERED:", results.length);

    results.sort((a, b) => score(b, query) - score(a, query));

    return {
        metas: results.map(item => ({
            id: `cinemana:${item.id}`,
            type: item.kind === 2 ? "series" : "movie",
            name: item.title,
            poster: item.poster,
            releaseInfo: item.year
        }))
    };

}

module.exports = catalogHandler;