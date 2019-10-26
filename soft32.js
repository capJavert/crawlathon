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
    requestLimit: 200,
    pseudoUrls: [
        'http[s?]://soft32.com/[.*]',
        'http[s?]://[.*].soft32.com/[.*]',
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
                const isInDomain = href.indexOf('soft32.com') > -1

                if (!href) {
                    return acc
                }

                const prioritySelectors = ['button', 'button_narrow', 'btn--download', 'btn']

                const priority = className.split(' ').some(className => {
                    return prioritySelectors.indexOf(className) > -1
                })

                if (isInDomain || priority) {
                    acc.push({ url: href, priority })
                }

                return acc
            }, [])
        )

        requests.forEach(req => requestQueue.addRequest(req, { forefront: req.priority }))

        return requests
    }
}).then(({ name, data }) => {
    writeData(name, data, timeStart)
})
