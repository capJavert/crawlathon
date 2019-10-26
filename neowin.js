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

const onFinish = ({ name, data }) => {
    writeData(name, data, timeStart)
}

crawlUrl({
    name: 'neowin',
    url: 'https://www.neowin.net/news/cat/software',
    requestLimit: 400,
    pseudoUrls: [
        'http[s?]://www.neowin.net/[.*]',
        'http[s?]://[.*].neowin.net/[.*]',
    ],
    options: { headless: true },
    transformRequestFunction,
    listenForRequestsTimeout: false,
    selector: 'a',
    parsePage: async (request, page, requestQueue) => {
        const requests = await page.$$eval(
            'a',
            els => els.reduce((acc, el) => {
                const { href, className } = el
                const isInDomain = href.indexOf('neowin.net') > -1

                if (!href) {
                    return acc
                }

                const regex = /\.(?:zip|rar|exe|tar|iso|img|dmg|gz|7z|pdf|apk)(\?.*|$)/;

                const priority = regex.test(href);

                if (isInDomain || priority) {
                    acc.push({ url: href, priority })
                }

                return acc
            }, [])
        )

        requests.forEach(req => requestQueue.addRequest(req, { forefront: req.priority }))
        return requests
    },
    onTerminate: onFinish
}).then(({ name, data }) => {
    onFinish({ name, data })
})