const Apify = require('apify')
const { pushData } = require('../data')
const { getTextFile } = require('../fetch')
const { jsonUrlParser, csvUrlParser, textUrlParser } = require('../parser')

// static crawler supports json, csv and plaintext
const crawlUrls = ({ urls, requestLimit, concurrency = 10, options = {} }) => {
    const store = {}

    return new Promise(resolve => {
        Apify.main(async () => {
            const requestList = new Apify.RequestList({
                sources: urls.map(url => ({ url })),
            })
            await requestList.initialize({})

            const crawler = new Apify.BasicCrawler({
                ...options,
                requestList,
                handleRequestFunction: async ({ request }) => {
                    console.log(request.url)

                    const result = await getTextFile(request.url)
                    let urls = []

                    try {
                        urls = jsonUrlParser(JSON.parse(result))
                    } catch (e) {
                        const csvUrls = await csvUrlParser(result)

                        if (csvUrls.length) {
                            urls = csvUrls
                        } else {
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

            resolve(store)
        })
    })
}

module.exports = {
    crawlUrls
}
