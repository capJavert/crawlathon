const { writeFileSync } = require('fs')
const path = require('path')
const { connect, insertData } = require('./mongo')
var md5 = require('md5')

let mongoClient = null
let db = null
const collections = {}
let useMongo = false
let mongoVerbose = false

const initMongo = async () => {
    mongoClient = await connect()
    db = mongoClient.db('crawlathon')
    collections.meta = db.collection('meta')
    collections.data = db.collection('data')
    collections.headers = db.collection('headers')
}

const buildRecord = (request, response) => ({
    url: request.url,
    timestamp: Date.now(),
    hasResponse: !!response,
    ...(response ? {
        isOk: response.ok(),
        status: response.status(),
        headers: response.headers(),
    } : undefined)
})

// collect data in memory
const pushData = (request, response, store) => {
    const record = buildRecord(request, response)

    if (store[request.url]) {
        store[request.url] = {
            ...store[request.url],
            ...record
        }
    } else {
        store[request.url] = record
    }

    if (useMongo && mongoClient) {
        const id = md5(request.url)
        const mongoData = {
            ...store[request.url]
        }

        if (mongoData.hasResponse) {
            mongoData.headers.responseId = id
            insertData(collections.headers, { responseId: id }, mongoData.headers, mongoVerbose)
            mongoData.headers = id
        }

        insertData(collections.data, { url: mongoData }, mongoData, mongoVerbose)
    }
}

// write current in memory data to disk with timestamp
const writeData = (name, data, timeStart) => {
    const writeTime = Date.now()

    const content = {
        meta: {
            name,
            timeStart,
            timeEnd: writeTime,
            elapsedTime: writeTime - timeStart,
        },
        data: Object.values(data)
    }

    writeFileSync(path.join(process.cwd(), 'data', `${name}-${writeTime}.json`), JSON.stringify(content))
}

const toggleMongo = value => {
    useMongo = value
}

const toggleMongoVerbose = value => {
    mongoVerbose = value
}

module.exports = {
    pushData,
    writeData,
    buildRecord,
    initMongo,
    toggleMongo,
    toggleMongoVerbose
}
