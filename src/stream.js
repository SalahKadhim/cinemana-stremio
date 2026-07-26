const api = require("./api");

const QUALITY_ORDER = {
    "2160p": 2160,
    "1440p": 1440,
    "1080p": 1080,
    "720p": 720,
    "480p": 480,
    "360p": 360,
    "240p": 240
};

function getQuality(video) {

    const resolution = (video.resolution || "").toLowerCase();

    const match = resolution.match(/\d{3,4}p/);

    if (!match)
        return 0;

    return QUALITY_ORDER[match[0]] || parseInt(match[0]) || 0;

}

async function streamHandler(args) {

    let id = args.id;

    // Existing Cinemana catalog
    if (id.startsWith("cinemana:")) {

        id = id.replace("cinemana:", "");

    }
    // Official Stremio catalogs (IMDb IDs)
    else if (/^tt\d+$/.test(id)) {

        console.log(`Resolving IMDb ID: ${id}`);

        let item = await api.findByImdb(id, args.type);

        // Cinemeta uses "series", Stremio sends "series", but this is a
        // fallback in case one endpoint doesn't exist.
        if (!item && args.type === "series") {
            item = await api.findByImdb(id, "tv");
        }

        if (!item) {

            console.log(`No Cinemana match found for ${id}`);

            return {
                streams: []
            };

        }

        console.log(
            `IMDb ${id} -> Cinemana ${item.id} (${item.title})`
        );

        id = item.id;

    }

    const videos = await api.streams(id);

    if (!videos || videos.length === 0) {
        return {
            streams: []
        };
    }

    // Remove duplicate URLs
    const uniqueUrls = new Set();

    const uniqueVideos = videos.filter(video => {

        if (!video.videoUrl)
            return false;

        if (uniqueUrls.has(video.videoUrl))
            return false;

        uniqueUrls.add(video.videoUrl);

        return true;

    });

    // Keep one stream per resolution
    const bestPerResolution = new Map();

    for (const video of uniqueVideos) {

        const key = (video.resolution || "Auto").toUpperCase();

        if (!bestPerResolution.has(key)) {
            bestPerResolution.set(key, video);
        }

    }

    const sortedVideos = [...bestPerResolution.values()]
        .sort((a, b) => getQuality(b) - getQuality(a));

    const streams = sortedVideos.map(video => ({

        name: "🇮🇶 Cinemana",

        title:
            `🎬 Cinemana\n` +
            `${video.resolution || "Auto"}`,

        url: video.videoUrl,

        behaviorHints: {
            notWebReady: false,
            bingeGroup: "cinemana"
        }

    }));

    return {
        streams
    };

}

module.exports = streamHandler;