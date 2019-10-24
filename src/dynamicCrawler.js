const Apify = require('apify')
const { pushData } = require('./data')

// listen for requests/responses after page payload
// this catches for example download initiators with countdown
const listenForRequests = async (page, timeout, handler) => {
    const reqHandler = handler('request')
    const resHandler = handler('response')

    page.on('request', reqHandler)
    page.on('response', resHandler)

    await page.waitFor(timeout)

    page.removeListener('request', reqHandler)
    page.removeListener('response', resHandler)
}

// crawl website and take url as entrypoint
const crawlUrl =  ({ url, requestLimit, pseudoUrls = [], concurrency = 10, options = {}, transformRequestFunction, listenForRequestsTimeout = 2000 }) => {
    return new Promise(resolve => {
        Apify.main(async () => {
            const store = {}
            const requestQueue = await Apify.openRequestQueue()
            await requestQueue.addRequest({ url: url })
            const parsedPseudoUrls = pseudoUrls.map(pseudoUrl => new Apify.PseudoUrl(pseudoUrl))

            const crawler = new Apify.PuppeteerCrawler({
                launchPuppeteerOptions: {
                    headless: true,
                    userAgent: '2019RLCrawlAThon',
                    ...options
                },
                puppeteerPoolOptions: {
                    useLiveView: true,
                },
                requestQueue,
                gotoFunction: async ({ page, request }) => {
                    listenForRequests(page, listenForRequestsTimeout, type => payload =>  {
                        if (type === 'request') {
                            pushData({ url: payload.url() }, false, store)
                        } else {
                            pushData({ url: payload.url() }, payload, store)
                        }
                    })

                    const result = await page.goto(request.url)

                    return result
                },
                handlePageFunction: async ({ request, response, page }) => {
                    const title = await page.title()
                    console.log(`${request.url}: ${title}`)

                    pushData(request, response, store)

                    await Apify.utils.enqueueLinks({
                        page,
                        selector: 'a',
                        pseudoUrls: parsedPseudoUrls,
                        requestQueue,
                        transformRequestFunction
                    })
                },
                maxRequestsPerCrawl: requestLimit,
                maxConcurrency: concurrency,
            })

            await crawler.run()

            resolve(store)
        })
    })
}

module.exports = {
    crawlUrl,
    listenForRequests,
}
