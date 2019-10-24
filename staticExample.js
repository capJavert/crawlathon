const { writeData } = require('./src/data')
const { crawlUrls } = require('./src/crawlers/staticCrawler')

const timeStart = Date.now()

crawlUrls({
    urls: [
        'http://www.kyoceradocumentsolutions.co.th/support_and_download/downloadcenter/csv/file.csv',
        'https://github.com/capJavert',
        'https://api.kickass.website/social',
        'https://api.kickass.website/me',
        'https://api.kickass.website/'
    ]
}).then(data => {
    writeData('static', data, timeStart)
})
