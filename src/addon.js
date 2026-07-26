const { addonBuilder } = require("stremio-addon-sdk");

const manifest = require("./manifest");

const catalogHandler = require("./catalog");
const metaHandler = require("./meta");
const streamHandler = require("./stream");
const subtitleHandler = require("./subtitle");

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(catalogHandler);
builder.defineMetaHandler(metaHandler);
builder.defineStreamHandler(streamHandler);
builder.defineSubtitlesHandler(subtitleHandler);

module.exports = builder.getInterface();