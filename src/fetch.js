const fetch = require('isomorphic-fetch')
const deviceProfiles = require('./deviceProfiles')

const defaultHeaders = {
    'user-agent': deviceProfiles.default.userAgent
}

const getFile = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                ...defaultHeaders
            }
        })

        return response
    } catch (e) {
        console.error(e)
    }

    return null
}

const getTextFile = async (url, options = {}) => {
    const response = await getFile(url, options)

    try {
        if (response) {
            return response.text()
        }
    } catch (e) {
        console.error(e)
    }

    return null
}

const getJSONFile = async (url, options = {}) => {
    const response = await getFile(url, options)

    try {
        if (response) {
            return response.json()
        }
    } catch (e) {
        console.error(e)
    }

    return null
}

module.exports = {
    getFile,
    getTextFile,
    getJSONFile
}
