const Apify = require('apify')
const { pushData } = require('../data')
const { getTextFile } = require('../fetch')
const { jsonUrlParser, csvUrlParser, textUrlParser } = require('../parser')
const chalk = require('chalk')

process.on('SIGINT', () => {
    if (typeof global.onTerminate === 'function') {
        global.onTerminate()
    }

    process.exit()
})

// static crawler supports json, csv and plaintext
const crawlUrls = async ({ name, urls, requestLimit, concurrency = 10, options = {}, log = false, plainTextFallback = true, fetchOptions = {}, onTerminate }) => {
    const store = {}

    const requestList = new Apify.RequestList({
        sources: urls.map(url => (
            new Apify.Request({
                url,
                ...fetchOptions
            })
        )),
    })
    await requestList.initialize({})

    global.onTerminate = () => onTerminate({ name, data: store })

    const crawler = new Apify.BasicCrawler({
        ...options,
        requestList,
        handleRequestFunction: async ({ request }) => {
            if (log) {
                console.log(request.url)
            }

            const result = await getTextFile(request.url, fetchOptions)
            let urls = []

            try {
                urls = jsonUrlParser(JSON.parse(result))
            } catch (e) {
                const csvUrls = await csvUrlParser(result)

                if (csvUrls.length) {
                    urls = csvUrls
                } else if (plainTextFallback) {
                    urls = textUrlParser(result)
                }
            }

            if (urls && urls.length) {
                urls.forEach(url => pushData({ url }, false, store))
            }
        },
        maxRequestsPerCrawl: requestLimit,
        maxConcurrency: concurrency,
    })

    await crawler.run()

    console.log(chalk.green.bold('Done!'))

    global.onTerminate = undefined

    return { name, data: store }
}

module.exports = {
    crawlUrls
}
