const bs = require("binary-search")

const cmp = (first, second) => first.value < second.value ? -1 : (first.value > second.value ? 1 : 0)

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