const { createBrowser } = require('./src/browser')
const { listenForRequests } = require('./src/crawlers/dynamicCrawler')
const { writeData } = require('./src/data')
const { crawlUrls } = require('./src/crawlers/staticCrawler')
const { checkAllowedRobots } = require('./src/robots/checkAllowedRobots')

createBrowser({ headless: true }).then(async browser => {
    const session = await browser.utils.loadSession('demo')
    const { page } = session

    const urls = []

    listenForRequests(page, 5000, type => request => {
        if (type === 'response') {
            return
        }

        urls.push(request.url())
    }).then(() => {
        const timeStart = Date.now()

        crawlUrls({ name: 'kyocera', urls: urls.filter(url => checkAllowedRobots(url)), log: true }).then(({ name, data }) => {
            writeData(name, data, timeStart)
        })
    })

    await page.goto('http://www.kyoceradocumentsolutions.co.th/support_and_download/downloadcenter/')
})
