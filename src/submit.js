const _ = require('lodash');
const chalk = require('chalk');
const fetch = require('isomorphic-fetch')

const username = 'mamma_tua';
const password = 'NU8x[rvIE+qvuPs';

const submitUris = async (siteName, uris = []) => {
    if (uris.length === 0) {
        console.log(chalk.red('Skip upload because "uri" array is empty...'))
        return;
    }

    const splitUris = _.chunk(uris, 100);

    for(const chunk of splitUris) {
        fetch('http://hackathon.reversinglabs.com/api/test/bulk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
            },
            body: JSON.stringify({
                crawlathon: {
                    query: {
                        site: siteName,
                        links: chunk
                    }
                }
            }),
        }).then(res => {
            console.log(chalk.green(chunk.length, 'links successfully submitted', chunk));
        });
    }
}

module.exports = {
    submitUris,
}