const axios = require("axios");
const { parseItem, parseList } = require("./parser");
const cache = require("./cache");

const BASE_URL = "https://cinemana.shabakaty.cc/api/android";
const CINEMETA_URL = "https://v3-cinemeta.strem.io";

const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        Accept: "application/json",
        "User-Agent": "Cinemana-Stremio/1.0"
    }
});

const pendingRequests = new Map();

const TTL = {
    SEARCH: 300,
    DETAILS: 1800,
    EPISODES: 1800,
    STREAMS: 600,
    IMDB: 1800
};

async function request(url) {

    const cacheKey = `http:${url}`;

    const cached = cache.get(cacheKey);

    if (cached)
        return cached;

    if (pendingRequests.has(cacheKey))
        return pendingRequests.get(cacheKey);

    const promise = (async () => {

        try {

            const { data } = await client.get(url);

            cache.set(cacheKey, data, TTL.STREAMS);

            return data;

        } catch (err) {

            if (err.response) {

                throw new Error(
                    `Cinemana API Error (${err.response.status}) on ${url}`
                );

            }

            throw err;

        } finally {

            pendingRequests.delete(cacheKey);

        }

    })();

    pendingRequests.set(cacheKey, promise);

    return promise;
}

async function search(query, page = 1) {

    const cacheKey = `search:${query}:${page}`;

    const cached = cache.get(cacheKey);

    if (cached)
        return cached;

    const currentYear = new Date().getFullYear();

    const yearRange = `1900,${currentYear}`;

    const encoded = encodeURIComponent(query);

    const pageIndex = Math.max(0, page - 1);

    const moviesUrl =
        `/AdvancedSearch?level=0` +
        `&videoTitle=${encoded}` +
        `&staffTitle=${encoded}` +
        `&year=${yearRange}` +
        `&page=${pageIndex}` +
        `&type=movies` +
        `&itemsPerPage=30`;

    const seriesUrl =
        `/AdvancedSearch?level=0` +
        `&videoTitle=${encoded}` +
        `&staffTitle=${encoded}` +
        `&year=${yearRange}` +
        `&page=${pageIndex}` +
        `&type=series` +
        `&itemsPerPage=30`;

    const [moviesRaw, seriesRaw] = await Promise.all([
        request(moviesUrl),
        request(seriesUrl)
    ]);

    const movies = parseList(moviesRaw || []);
    const series = parseList(seriesRaw || []);

    const results = [];

    const max = Math.max(movies.length, series.length);

    for (let i = 0; i < max; i++) {

        if (i < movies.length)
            results.push(movies[i]);

        if (i < series.length)
            results.push(series[i]);

    }

    cache.set(cacheKey, results, TTL.SEARCH);

    return results;

}

async function details(id) {

    const cacheKey = `details:${id}`;

    const cached = cache.get(cacheKey);

    if (cached)
        return cached;

    const raw = await request(`/allVideoInfo/id/${id}`);

    const item = parseItem(raw);

    cache.set(cacheKey, item, TTL.DETAILS);

    return item;

}

async function episodes(seriesId) {

    const cacheKey = `episodes:${seriesId}`;

    const cached = cache.get(cacheKey);

    if (cached)
        return cached;

    const eps = parseList(
        await request(`/videoSeason/id/${seriesId}`)
    );

    cache.set(cacheKey, eps, TTL.EPISODES);

    return eps;

}

async function streams(id) {

    const cacheKey = `streams:${id}`;

    const cached = cache.get(cacheKey);

    if (cached)
        return cached;

    const streamData = await request(
        `/transcoddedFiles/id/${id}`
    );

    cache.set(cacheKey, streamData, TTL.STREAMS);

    return streamData;

}

/* ===============================
   IMDb helpers
================================ */

async function getCinemetaMeta(imdbId, type = "movie") {

    const cacheKey = `cinemeta:${type}:${imdbId}`;

    const cached = cache.get(cacheKey);

    if (cached)
        return cached;

    const url =
        `${CINEMETA_URL}/meta/${type}/${imdbId}.json`;

    const { data } = await axios.get(url);

    cache.set(cacheKey, data.meta, TTL.IMDB);

    return data.meta;

}

async function findByImdb(imdbId, type = "movie") {

    const meta = await getCinemetaMeta(imdbId, type);

    if (!meta)
        return null;

    const results = await search(meta.name);

    for (const item of results) {

        const url = item.raw?.imdbUrlRef || "";

        const match = url.match(/tt\d+/);

        if (match && match[0] === imdbId)
            return item;

    }

    return null;

}

module.exports = {
    search,
    details,
    streams,
    episodes,
    getCinemetaMeta,
    findByImdb
};