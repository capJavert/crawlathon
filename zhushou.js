const { crawlUrl } = require('./src/crawlers/dynamicCrawler')
const { writeData, buildRecord } = require('./src/data')
const { checkAllowedRobots } = require('./src/robots/checkAllowedRobots')
const { isRequestValid } = require('./src/checker/checker')
// crawler implementation for filehippo

const transformRequestFunction = request => {
    if (isRequestValid(buildRecord(request), true, true) && checkAllowedRobots(request.url) === false) {
       return undefined
    }

    return request
}

const timeStart = Date.now()

const onFinish = ({ name, data }) => {
    writeData(name, data, timeStart)
}

crawlUrl({
    name: 'zhushou',
    url: 'http://zhushou.2345.com/',
    requestLimit: 200,
    pseudoUrls: [
        'http[s?]://zhushou.com/[.*]',
    ],
    options: { headless: true },
    transformRequestFunction,
    listenForRequestsTimeout: false,
    parsePage: async (request, page, requestQueue) => {
        const requests = await page.$$eval(
            'a',
            els => els.reduce((acc, el) => {
                const { href, className } = el
                const isInDomain = href.indexOf('zhushou.2345.com') > -1

                if (!href) {
                    return acc
                }

                const prioritySelectors = ['Mbtn', 'btn_down_to_pc']

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
    },
    onTerminate: onFinish
}).then(({ name, data }) => {
    onFinish({ name, data })
})
