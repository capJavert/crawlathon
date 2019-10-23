const { createBrowser } = require('./src/browser')
const { connect } = require('./src/mongo')

createBrowser().then(async browser => {
    console.log('browser loaded', !!browser)

    const mongoClient = await connect()
    const db = mongoClient.db('crawlathon')
    const collection = db.collection('meta')

    collection.find().toArray((err, items) => {
        console.log(items)
    })

    const session = await browser.loadSession('demo')
    await session.page.goto('https://filehippo.com/')
})
