const parseCsv = require('csv-parse')

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/

const jsonUrlParser = payload => {
    let data = null

    try {
        if (typeof value === 'string') {
            data = JSON.parse(payload)
        } else {
            data = payload
        }
    } catch (e) {
        data = payload
    }

    let urls = []

    Object.values(data).forEach(value => {
        if (typeof value === 'object') {
            urls = [
                ...urls,
                ...jsonUrlParser(value)
            ]

            return
        }

        if (urlRegex.test(value)) {
            urls.push(value)
        }
    })

    return urls
}

const csvUrlParser = (payload, delimiter = ',') => {
    const output = []

    return new Promise(resolve => {
        parseCsv(payload, {
            delimiter,
            trim: true,
            skip_empty_lines: true,
            skip_lines_with_error: true
        }).on('readable', function(){
            let record = this.read()

            while (record) {
                output.push(record)
                record = this.read()
            }
        }).on('end', () => {
            resolve(output.reduce((urls, record) => (
                [
                    ...urls,
                    ...record.filter(value => urlRegex.test(value))
                ]
            ), []))
        }).on('error', e => {
            console.error(e)
        })
    })
}

module.exports = {
    jsonUrlParser,
    csvUrlParser
}
