const bs = require('binary-search')
const fs = require('fs')

//const cmp = (first, second) => first.value < second.value ? -1 : (first.value > second.value ? 1 : 0)
const cmp = (first, second) => first.value.localeCompare(second.value);

/**
 * @param values string[] values to write
 * @param filename string location to write to
 */
exports.sortAndWrite = (values, filename = './checker/sorted_temp_links.txt') => {
    values.sort((first, second) => first.localeCompare(second));
    fs.writeFileSync(filename, values.join('\n'))
}

/**
 * @param expected string[] sorted expected strings
 * @param actual string[] actual string
 */
exports.check = (expected, actual) => {
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

    for (let i = 0; i < expected.length; i++) {
        if (expected[i].hits !== 1) {
            missing.push(expected[i].value)
        
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
        extra: extra
    }
};

/**
 * @param actual string[] strings to compare against
 * @param filter Regex[] array of filter, only matching will be compared against
 */
exports.report = (actual, filter = []) => {
    let expected = fs.readFileSync('./checker/sorted_valid_links.txt').toString().split("\n");

    if (filter.length > 0) {
        expected = expected.filter((item) => filter.some((re) => re.test(item)));
    }

    const result = this.check(expected, actual);

    console.log('Found links: ' + actual.length);
    console.log('Missing links: ' + result.missing.length);
    console.log('Extra links: ' + result.extra.length);

    const totalScore = (actual.length) + (result.missing.length * -1) + (result.extra.length * -5)
    console.log('Total score: ' + totalScore)
}