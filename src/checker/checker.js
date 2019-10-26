const _ = require('lodash');
const bs = require('binary-search');
const fs = require('fs');

//const cmp = (first, second) => first.value < second.value ? -1 : (first.value > second.value ? 1 : 0)
const cmp = (first, second) => first.value.localeCompare(second.value);

/**
 * @param values string[] values to write
 * @param filename string location to write to
 */
const sortAndWrite = (values, filename = './test_data/sorted_valid_links.txt') => {
    values.sort((first, second) => first.localeCompare(second));
    fs.writeFileSync(filename, values.join('\n'))
}

/**
 * @param expected string[] sorted expected strings
 * @param actual string[] actual string
 */
const check = (expected, actual) => {
    for (let i = 0; i < expected.length; i++) {
        expected[i] = { value: expected[i], hits: 0 }
    }

    for (let i = 0; i < actual.length; i++) {
        actual[i] = { value: actual[i], hits: 0 }
    }

    for (let i = 0; i < actual.length; i++) {
        const foundIndex = bs(expected, actual[i], cmp)
        if (foundIndex >= 0) {
            expected[foundIndex].hits++;
        } else {
            actual[i].hits--;
        }
    }

    const missing = [];
    const extra = [];
    const found = [];

    for (let i = 0; i < expected.length; i++) {
        if (expected[i].hits === 1) {
            found.push(expected[i].value);
        }

        if (expected[i].hits !== 1) {
            missing.push(expected[i].value);

            if (expected[i].hits > 1) {
                console.error(expected[i].value + " found multiple times: " + expected[i].hits);
            }
        }
    }

    for (let i = 0; i < actual.length; i++) {
        if (actual[i].hits === -1) {
            extra.push(actual[i].value);
        }
    }

    return {
        missing: missing,
        extra: extra,
        found: found,
    }
};

/**
 * @param req request object from crwaler
 * @returns boolean is link valid
 */
const isRequestValid = (req, includeJs = true, defaultReturn = false) => {
    const blackLister = [
        // filter out by url content
        (req) => {
            if (!includeJs) {
                const jsRegex = /\.js(\?|$)/;

                if (jsRegex.test(req.url)) {
                    return true
                }
            }

            const regex = /\.(?:google|png|jpg|epg|gif|mp4|vid|css)(\?.*|$)/;

            if (regex.test(req.url)) {
                return true;
            }
        },
        // filter out by content type
        (req) => {
            //const regex = /application\/(x-)?javascript.*|application\/x-msdos-program.*|text\/javascript.*|application\/x-msdownload.*/;
            const regex = /image.*|font.*|text\/css.*/;

            try {
                const contentType = _.get(req, 'headers.content-type');
                 return regex.test(contentType);
            } catch (e) {
                console.log("Error while filtering: " + JSON.stringify(req));
                return false;
            }
        }
    ]

    const whiteLister = [
        // filter by content type
        (req) => {
            //const regex = /application\/(x-)?javascript.*|application\/x-msdos-program.*|text\/javascript.*|application\/x-msdownload.*/;
            const regex = /application\/x-msdownload.|application\/x-msdos-program.*|application\/octet\-stream.*/;

            try {
                const contentType = _.get(req, 'headers.content-type');
                return regex.test(contentType);
            } catch (e) {
                console.log("Error while filtering: " + JSON.stringify(req));
                return false;
            }
        },
        // filter by extension
        (req) => {
            const regex = /\.(?:zip|rar|exe|tar|iso|img|dmg|gz|7z|pdf|apk)(\?.*|$)/;
            return regex.test(req.url);
        }
    ]

    const specialGuy = [
        (req) => {
            //const regex = /application\/(x-)?javascript.*|application\/x-msdos-program.*|text\/javascript.*|application\/x-msdownload.*/;
            const regex = /text\/html/;

            if (!req.hasResponse) {
                return true;
            }

            try {
                const contentType = _.get(req, 'headers.content-type');
                return req.isOk && regex.test(contentType);
            } catch (e) {
                console.log("Error while filtering: " + JSON.stringify(req));
                return false;
            }
        },
    ]

    if (blackLister.some(validator => validator(req))) return false;

    if (whiteLister.some(validator => validator(req))) return true;

    if (specialGuy.some(validator => validator(req))) return false;

    return defaultReturn;
}

/**
 * Generates a simple report
 *
 * @param actual string[] strings to compare against
 * @param filter Regex[] array of filter, only matching will be compared against
 */
const report = (actual, filter = [], results) => {
    let expected = fs.readFileSync('./test_data/sorted_valid_links.txt').toString().split("\n");

    if (filter.length > 0) {
        expected = expected.filter((item) => filter.some((re) => re.test(item)));
    }

    const result = check(expected, actual);

    console.log('Found links: ' + actual.length);
    console.log('Missing links: ' + result.missing.length);
    console.log('Extra links: ' + result.extra.length);
    // console.log(result.extra);

    const totalScore = actual.length + (result.extra.length * -1)
    console.log('Total score: ' + totalScore)
}

/**
 * Generates a simple report from crawled data json results in 'data' directory and the target results
 */
const reportAll = () => {
    const results = {};
    var filesToRead = [];

    fs.readdirSync('./data').forEach((dir) => {
        const path = `./data/${dir}`;
        if (fs.lstatSync(path).isFile()) {
            return;
        }

        const newFiles = fs.readdirSync(path).filter((file) => /.*\.json/.test(file)).map((file) => `${path}/${file}`);
        filesToRead = [
            ...filesToRead,
            ...newFiles,
        ]
    });

    filesToRead.forEach((file) => {
        const data = require('./../../' + file).data;

        for(const req of data) {
            if (isRequestValid(req, false, true)) {
                results[req.url] = req
            }
        }

    });

    report(_.keys(results), [], results);
}

module.exports = {
    check,
    report,
    reportAll,
    isRequestValid
}
