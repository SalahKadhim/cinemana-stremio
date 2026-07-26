const express = require("express");
const axios = require("axios");
const { getRouter } = require("stremio-addon-sdk");

const addonInterface = require("./addon");

const app = express();

app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
    next();
});

app.use(getRouter(addonInterface));

app.get("/subtitle/:url", async (req, res) => {
    try {
        const url = Buffer.from(req.params.url, "base64").toString("utf8");

        const response = await axios.get(url, {
            responseType: "arraybuffer"
        });

        let data = Buffer.from(response.data);

        if (
            data.length >= 3 &&
            !(data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf)
        ) {
            data = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), data]);
        }

        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.send(data);

    } catch (err) {
        console.error(err);
        res.sendStatus(404);
    }
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cinemana addon running on port ${PORT}`);
});