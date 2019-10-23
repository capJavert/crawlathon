const { getTextFile } = require('./src/fetch')

const run = async () => {
    const file = await getTextFile('https://filehippo.com/robots.txt')
    console.log(file.split('\r\n'))
}

run()
