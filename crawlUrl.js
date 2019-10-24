const { createBrowser } = require('./src/browser')

const sitemap = {}
const visited = {}
let pagePool = 0
const pageMax = 6

const crawlLinks = async (url, session, validator = () => true, branch = false) => {
    visited[url] = true
    console.log(url)

    if (branch) {
        pagePool += 1
    }

    const currentSession = !branch ? session : await session.utils.copy(`extractEntries${pagePool}`)
    const { page } = currentSession
    try {
        page.goto(url)
        await currentSession.utils.waitPageLoad()
    } catch (e) {
        console.error('Invalid url:', url)

        return
    }

    const anchors = await page.$$eval('a', links => links.map(link => link.href))
    // TODO check if href is valid url
    sitemap[url] = anchors.filter(href => !visited[href] && validator(href, url))

    let branched = false

    for (const newUrl of sitemap[url]) {
        if (!visited[newUrl]) {
            if (pagePool < pageMax && !branched) {
                branched = true
                crawlLinks(newUrl, currentSession, validator, true)
            } else {
                await crawlLinks(newUrl, currentSession, validator)
            }
        }
    }
}

const isURL = (str) => {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

createBrowser({ headless: true }).then(async browser => {
    const session = await browser.utils.loadSession('extractEntries')

    const validator = (url, currentUrl) => {
        if (url.indexOf(currentUrl) > -1 && url.indexOf('#') > -1) {
            return false
        }

        return (
            isURL(url)
                && url.indexOf('filehippo.com') > -1
        )
    }

    await crawlLinks('https://filehippo.com/', session, validator)

    console.log('done')
})
