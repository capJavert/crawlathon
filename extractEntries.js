const { createBrowser } = require('./src/browser')

let entries = []

createBrowser({ headless: false }).then(async browser => {
    const session = await browser.utils.loadSession('extractEntries')
    const { page } = session
    const eventListeners = []

    await page.exposeFunction('logElementListener', type => {
        eventListeners.push(type)
    })

    await page.evaluateOnNewDocument(() => {
        var addEventListener = window.HTMLElement.prototype.addEventListener

        window.HTMLElement.prototype.addEventListener = function (type) {
            this.setAttribute('crawl-event', type)
            window.logElementListener(type)

            return addEventListener.apply(this, arguments)
        }
    })

    page.goto('https://filehippo.com/')
    await session.utils.waitPageLoad()

    const anchors = await page.$$eval('a', links => links.map(link => link.href))
    entries = [
        ...entries,
        anchors
    ]

    // POC
    // look for non a elements containing link texts
    // await page.$$eval('*', elements => elements.filter(
    //     el =>
    //         el.tagName.toLowerCase() !== 'a'
    //         && el.innerText
    //         && el.innerText.indexOf('http://') > -1
    // ).map(el => el.innerText))

    const waitDebounce = resolve => wait => {
        const prevLength = eventListeners.length

        setTimeout(() => {
            if (prevLength === eventListeners.length) {
                resolve()
                return
            }

            waitDebounce(resolve)(wait)
        }, wait)
    }

    await new Promise(resolve => waitDebounce(resolve)(1000))

    // other clickable elements caught through addEventListener logging
    const clickableElements = await page.$$eval('*[crawl-event=click]', elements => elements.map(el => el.tagName.toLowerCase()))
    console.log(clickableElements)
})
