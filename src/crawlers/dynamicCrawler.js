const Apify = require('apify')
const { pushData } = require('../data')
const deviceProfiles = require('../deviceProfiles')
const chalk = require('chalk')

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
const crawlUrl = async ({ name, url, requestLimit, pseudoUrls = [], concurrency = 10, options = {}, transformRequestFunction, listenForRequestsTimeout = 2000, parsePage, selector = 'a' }) => {
    process.env.APIFY_LOCAL_STORAGE_DIR = `data/${name}`

    const store = {}
    const requestQueue = await Apify.openRequestQueue()
    await requestQueue.addRequest({ url: url })
    const parsedPseudoUrls = pseudoUrls.map(pseudoUrl => new Apify.PseudoUrl(pseudoUrl))

    const crawler = new Apify.PuppeteerCrawler({
        launchPuppeteerOptions: {
            headless: true,
            userAgent: deviceProfiles.default.userAgent,
            ...options
        },
        puppeteerPoolOptions: {
            useLiveView: true,
        },
        requestQueue,
        gotoFunction: async ({ page, request }) => {
            if (listenForRequestsTimeout) {
                listenForRequests(page, listenForRequestsTimeout, type => payload =>  {
                    if (type === 'request') {
                        pushData({ url: payload.url() }, false, store)
                    } else {
                        pushData({ url: payload.url() }, payload, store)
                    }
                })
            }

            const result = await page.goto(request.url)

            return result
        },
        handlePageFunction: async ({ request, response, page }) => {
            const title = await page.title()
            console.log(`${request.url}: ${title}`)

            if (typeof parsePage === 'function') {
                await parsePage(request.url, page)
            }

            pushData(request, response, store)

            await Apify.utils.enqueueLinks({
                page,
                selector,
                pseudoUrls: parsedPseudoUrls,
                requestQueue,
                transformRequestFunction
            })
        },
        maxRequestsPerCrawl: requestLimit,
        maxConcurrency: concurrency,
    })

    await crawler.run()

    console.log(chalk.green.bold('Done!'))

    return { name, data: store }
}

module.exports = {
    crawlUrl,
    listenForRequests,
}
