const _ = require('lodash');
const chalk = require('chalk');
const fetch = require('isomorphic-fetch')

const username = 'mamma_tua';
const password = 'NU8x[rvIE+qvuPs';

const args = process.argv.slice(2)

const submitUris = async (siteName, uris = []) => {
    if (uris.length === 0) {
        console.log(chalk.red('Skip upload because "uri" array is empty...'))
        return;
    }

    const splitUris = _.chunk(uris, 100);

    console.log()
    console.log(siteName)

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
            if (res.ok) {
                console.log(chalk.green(chunk.length, 'links successfully submitted'));
                if (args.indexOf('--verbose') > -1) {
                    console.log(chunk);
                }
            } else {
                console.error('Error', res.status)
                if (args.indexOf('--verbose') > -1) {
                    console.error(res)
                }
            }
        }).catch(err => {
            console.error(siteName)
            console.error(err)
        });
    }
}

module.exports = {
    submitUris,
}
