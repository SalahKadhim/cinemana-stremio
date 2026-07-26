const api = require("./api");

module.exports = async function subtitleHandler(args) {

    const id = args.id.replace("cinemana:", "");

    const item = await api.details(id);

    if (!item || !item.translations) {
        return {
            subtitles: []
        };
    }

    const seen = new Set();

    const subtitles = item.translations
        .filter(sub => sub.file)
        .filter(sub => {

            const key = `${sub.language}:${sub.extension}`;

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);

            return true;

        })
        .map(sub => {

            const encoded = Buffer
                .from(sub.file)
                .toString("base64");

            return {

                id: `${sub.language}-${sub.extension}`,

                lang: sub.language,

                url: `http://localhost:7000/subtitle/${encoded}`

            };

        });

    return {
        subtitles
    };

};