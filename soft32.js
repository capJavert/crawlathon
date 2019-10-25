const { crawlUrl } = require('./src/crawlers/dynamicCrawler')
const { writeData, buildRecord } = require('./src/data')
const { checkAllowedRobots } = require('./src/robots/checkAllowedRobots')
const { isRequestValid } = require('./src/checker/checker')
// crawler implementation for filehippo

const transformRequestFunction = request => {
    if (isRequestValid(buildRecord(request)) && checkAllowedRobots(request.url) === false) {
       return undefined
    }

    return request
}

const timeStart = Date.now()

crawlUrl({
    name: 'soft32',
    url: 'https://www.soft32.com/',
    requestLimit: 10,
    pseudoUrls: [
        'http[s?]://soft32.com/[.*]',
        'http[s?]://[.*].soft32.com/[.*]',
    ],
    options: { headless: true },
    transformRequestFunction,
    listenForRequestsTimeout: false,
    selector: '.clickable + a.soft, .button, a.button_narrow, a.btn--download, a.btn'
}).then(({ name, data }) => {
    writeData(name, data, timeStart)
})
