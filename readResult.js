const result1 = require('./data/filehippo-1571928237015.json')
const result2 = require('./data/filehippo-1571929203188.json')
const result3 = require('./data/filehippo-1571929809194.json')
const result4 = require('./data/filehippo-1571932768482.json')

const seen = {}

const valid = []

const data = [
    ...Object.values(result1.data),
    ...result2.data,
    ...result3.data,
    ...result4.data
]

// really stupid results evaluator filter exe, zip, tar files..
Object.values(data).map(item => {
    if (seen[item.url]) {
        // console.warn('duplicate', item.url)
        return
    }

    if (item.url.indexOf('exe') > -1 || item.url.indexOf('zip') > -1 || item.url.indexOf('tar') > -1 || item.url.indexOf('rar') > -1 || item.headers && item.headers['content-type'] === 'application/x-msdownload') {
        valid.push(item.url)
    }

    seen[item.url] = true
})

// console.log('meta', result.meta)
console.log('data', valid.length, '/', data.length)
