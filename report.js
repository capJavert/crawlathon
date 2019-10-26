const _ = require('lodash');
const checker = require('./src/checker/checker');
const { submitUris } = require('./src/submit');

const results = checker.reportAll();

const args = process.argv.slice(2)

if (args.indexOf('--submit') > -1) {
    for (const siteName of _.keys(results)) {
        submitUris(siteName, results[siteName]);
    }
}
