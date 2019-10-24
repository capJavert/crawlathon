const { writeFileSync } = require('fs')
const path = require('path')

// collect data in memory
const pushData = (request, response, store) => {
    const record = {
        url: request.url,
        timestamp: Date.now(),
        hasResponse: !!response,
        ...(response ? {
            isOk: response.ok(),
            status: response.status(),
            headers: response.headers(),
        } : undefined)
    }

    if (store[request.url]) {
        store[request.url] = {
            ...store[request.url],
            ...record
        }
    } else {
        store[request.url] = record
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


module.exports = {
    pushData,
    writeData
}
