const Apify = require('apify')
const { pushData } = require('../data')
const { getTextFile } = require('../fetch')
const { jsonUrlParser, csvUrlParser, textUrlParser } = require('../parser')
const chalk = require('chalk')

// static crawler supports json, csv and plaintext
const crawlUrls = async ({ name, urls, requestLimit, concurrency = 10, options = {}, log = false, plainTextFallback = true }) => {
    const store = {}

    const requestList = new Apify.RequestList({
        sources: urls.map(url => ({ url })),
    })
    await requestList.initialize({})

    const crawler = new Apify.BasicCrawler({
        ...options,
        requestList,
        handleRequestFunction: async ({ request }) => {
            if (log) {
                console.log(request.url)
            }

            const result = await getTextFile(request.url)
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

    return { name, data: store }
}

module.exports = {
    crawlUrls
}
