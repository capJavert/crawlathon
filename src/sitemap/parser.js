const _ = require('lodash');
const { getSiteMaps } = require('./../robots/checkAllowedRobots');
var Sitemapper = require('sitemapper');

var sitemap = new Sitemapper();

const parseSiteMap = async (url, filters = []) => {
    const siteMaps = await getSiteMaps(url);
    const urlSet = new Set();

    for (const map of siteMaps) {
        let urls = (await sitemap.fetch(map)).sites;

        if (!_.isEmpty(filters)) {
            urls = urls.filter((url) => filters.some(prefix => url.indexOf(prefix) === -1))
        }

        urls.forEach(url => {
            urlSet.add(url);
        });
    }

    return [...urlSet];
}

module.exports = {
    parseSiteMap,
}