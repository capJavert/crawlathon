const puppeteer = require('puppeteer')
const devicesProfiles = require('./deviceProfiles')

const defaultOptions = {
    headless: false,
    timeout: 0
}
let sessions = {}

const waitPageEvent = page => async (event) => {
    return new Promise(resolve => {
        page.once(event, resolve)
    })
}

const waitPageLoad = page => async () => {
    return Promise.all([
        waitPageEvent(page)('load'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
    ])
}

const loadSession = browser => async (key, profile) => {
    if (!sessions[key]) {
        sessions[key] = {}
        const session = sessions[key]

        session.context = browser
        session.page = await session.context.newPage()
        session.utils = {
            waitPageEvent: waitPageEvent(session.page),
            waitPageLoad: waitPageLoad(session.page),
            copy: (newKey) => {
                return loadSession(browser)(newKey, profile)
            }
        }

        // TODO optimize request filter to speed up page load times
        session.page.setRequestInterception(true)

        session.page.on('request', request => {
            if (request.resourceType() === 'image' || request.resourceType() === 'font' || request.resourceType() === 'stylesheet') {
                request.abort()
                return
            }

            request.continue()
        })

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
    browser.utils = {
        loadSession: loadSession(browser)
    }

    return browser
}

module.exports = {
    createBrowser,
    loadSession
}
