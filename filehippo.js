const { crawlUrl } = require('./src/crawlers/dynamicCrawler')
const { writeData, buildRecord } = require('./src/data')
const { checkAllowedRobots } = require('./src/robots/checkAllowedRobots')
const { isRequestValid } = require('./src/checker/checker')
const { parseSiteMap } = require('./src/sitemap/parser')
// crawler implementation for filehippo

const transformRequestFunction = request => {
    // example of how ignore some requests that have been queued
    if (['/es', '/de', '/fr', '/it', '/pl', '/jp', '/zh'].some(prefix => request.url.indexOf(prefix) > -1)) {
        return undefined
    }

    if (isRequestValid(buildRecord(request), true, true) && checkAllowedRobots(request.url) === false) {
        return undefined
    }

    return request
}

const timeStart = Date.now()

const onFinish = ({ name, data }) => {
    writeData(name, data, timeStart)
}

parseSiteMap('https://filehippo.com/', ['/es', '/de', '/fr', '/it', '/pl', '/jp', '/zh'])
    .then((urls) => {
        console.log(urls);
        return crawlUrl({
            name: 'filehippo',
            url: urls,
            requestLimit: 200,
            pseudoUrls: [
                'http[s?]://filehippo.com/[.*]',
                'http[s?]://[.*].filehippo.com/[.*]',
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
                        const isInDomain = href.indexOf('filehippo.com') > -1
    
                        if (!href) {
                            return acc
                        }
    
                        const prioritySelectors = ['program-button--download', 'program-button-download']
    
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
        })
    }).then(({ name, data }) => {
        onFinish({ name, data })
    })
