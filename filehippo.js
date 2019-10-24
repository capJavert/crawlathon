const { crawlUrl } = require('./src/dynamicCrawler')
const { writeData } = require('./src/data')

// crawler implementation for filehippo

const transformRequestFunction = request => {
    // example of how ignore some requests that have been queued
    if (['/es', '/de', '/fr', '/it', '/pl', '/jp', '/zh'].some(prefix => request.url.indexOf(prefix) > -1)) {
        return undefined
    }

    return request
}

const timeStart = Date.now()

crawlUrl({
    url: 'https://filehippo.com/',
<<<<<<< HEAD
    requestLimit: 200,
=======
    requestLimit: 100,
>>>>>>> d0324bc9a9bbda19662a7503309814f15533759d
    pseudoUrls: [
        'http[s?]://filehippo.com/[.*]',
        'http[s?]://[.*].filehippo.com/[.*]',
        '[.*].[exe|zip|tar.gz|tar|rar][.*]'
    ],
    options: { headless: true },
    transformRequestFunction

}).then(data => {
    writeData('filehippo', data, timeStart)
})
