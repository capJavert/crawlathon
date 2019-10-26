const _ = require('lodash');
const checker = require('./src/checker/checker');
const { submitUris } = require('./src/submit');

const results = checker.reportAll();

for (const siteName of _.keys(results)) {
    submitUris(siteName, results[siteName]);
}