console.log("meta.js loaded");
const api = require("./api");

async function metaHandler(args) {

    console.log("META REQUEST:", args);

    const id = args.id.replace("cinemana:", "");

    const item = await api.details(id);

    console.log("ITEM:", item);

    if (!item)
        return { meta: null };

    const meta = {

        id: `cinemana:${item.id}`,

        type: item.kind === 2 ? "series" : "movie",

        name: item.title,

        poster: item.poster,

        background: item.poster,

        description: item.description,

        releaseInfo: item.year

    };

    console.log("TYPE:", item.kind);

    if (item.kind === 2) {

        console.log("Loading episodes...");

        const episodes = await api.episodes(item.id);

        console.log("Episode count:", episodes.length);

        console.log(episodes.slice(0, 3));

        meta.videos = episodes.map(ep => ({
            id: `cinemana:${ep.id}`,
            season: ep.season || 1,
            episode: ep.episode || 1,
            title: ep.title || `Episode ${ep.episode}`
        }));

    }

    return { meta };

}

module.exports = metaHandler;