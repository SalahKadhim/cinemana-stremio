const POSTER_BASE = "https://cnth2.shabakaty.cc/vascin-poster-images/";
const STAFF_BASE = "https://cnth2.shabakaty.cc/vascin-staff-poster/";

function toNumber(value) {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
}

function buildPoster(image) {
    if (!image) return null;

    if (image.startsWith("http"))
        return image;

    return POSTER_BASE + image;
}

function buildStaffImage(image) {
    if (!image) return null;

    if (image.startsWith("http"))
        return image;

    return STAFF_BASE + image;
}

function parseCategories(categories = []) {
    return categories
        .map(c => c.en_title || c.ar_title)
        .filter(Boolean);
}

function parseActors(actors = []) {
    return actors.map(actor => ({
        id: actor.nb || null,
        name: actor.name || "",
        role: actor.role || "",
        image: buildStaffImage(
            actor.staff_img_thumb ||
            actor.staff_img_medium_thumb ||
            actor.staff_img
        )
    }));
}

function parseTranslations(translations = []) {
    return translations.map(sub => ({
        language: sub.name || "Unknown",
        extension: sub.extention || "",
        file: sub.file || ""
    }));
}

function parseItem(item = {}) {

    return {

        id: String(item.nb ?? ""),

        kind: toNumber(item.kind) ?? 1,

        title: item.en_title || item.ar_title || "Unknown",

        arabicTitle: item.ar_title || null,

        description:
            item.en_content ||
            item.ar_content ||
            "",

        year: toNumber(item.year),

        rating: item.stars
            ? parseFloat(item.stars)
            : null,

        poster: buildPoster(
            item.imgObjUrl ||
            item.img
        ),

        image:
            item.imgObjUrl ||
            item.img ||
            null,

        season: toNumber(item.season),

        episode: toNumber(item.episodeNummer),

        categories: parseCategories(item.categories),

        actors: parseActors(item.actorsInfo),

        translations: parseTranslations(item.translations),

        raw: item

    };

}

function parseList(list = []) {
    return list.map(parseItem);
}

module.exports = {
    parseItem,
    parseList
};