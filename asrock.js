const { crawlUrl } = require('./src/crawlers/dynamicCrawler')
const { writeData, buildRecord } = require('./src/data')
const { checkAllowedRobots } = require('./src/robots/checkAllowedRobots')
const { isRequestValid } = require('./src/checker/checker')
const { parseSiteMap } = require('./src/sitemap/parser')
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

const urlRegex = /download/

Promise.resolve([
    "http://www.asrock.com/support/download.asp?cat=BIOS",
    "http://www.asrock.com/support/download.asp?cat=Drivers",
    "http://www.asrock.com/support/download.asp?cat=Utilities"
])
    .then((urls) => {
        return crawlUrl({
            name: 'asrock',
            url: urls,
            requestLimit: 300,
            pseudoUrls: [
                'http[s?]://www.asrock.com/[.*]',
                'http[s?]://[.*].asrock.com/[.*]',
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
                        const isInDomain = href.indexOf('asrock.com') > -1
    
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
        })
    }).then(({ name, data }) => {
        onFinish({ name, data })
    })
