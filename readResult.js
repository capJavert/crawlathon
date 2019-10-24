const fs = require('fs')

const result1 = require('./data/filehippo-1571937952212.json')

const seen = {}

const valid = []

const data = [
    ...Object.values(result1.data)
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
console.log(JSON.stringify(valid, null, 2));
