var Sitemapper = require('sitemapper');

var sitemap = new Sitemapper();

const parseSiteMap = (url) => {
    return sitemap.fetch(url);
}

module.exports = {
    parseSiteMap,
}