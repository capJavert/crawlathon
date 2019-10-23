const puppeteer = require('puppeteer')
const devicesProfiles = require('./deviceProfiles')

const defaultOptions = {
    headless: false,
    timeout: 0
}
let sessions = {}

const loadSession = browser => async (key, profile) => {
    if (!sessions[key]) {
        sessions[key] = {}
        const session = sessions[key]

        session.context = await browser.createIncognitoBrowserContext()
        session.page = await session.context.newPage()

        // TODO later filter requests to speed up page load times
        // await session.page.setRequestInterception(true)

        // session.page.on('request', request => {
        //     if (request.resourceType() === 'image' || request.resourceType() === 'font') {
        //         request.abort()
        //     } else if(request.resourceType() === 'stylesheet' &&
        //         request.url().indexOf('twitter_core.bundle.css') === -1) {
        //         request.abort()
        //     } else {
        //         request.continue()
        //     }
        // })

        session.page.emulate(profile || devicesProfiles.default)
    }

    return sessions[key]
}

/*
 Create and return browser instance
 */
const createBrowser = async (options = {}) => {
    const browser = await puppeteer.launch({
        ...defaultOptions,
        ...options
    })
    browser.loadSession = loadSession(browser)

    return browser
}

module.exports = {
    createBrowser,
    loadSession
}
