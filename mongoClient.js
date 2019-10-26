const { connect } = require('./src/mongo')

// mongo insert dummy
const run = async () => {
    const mongoClient = await connect()
    const db = mongoClient.db('crawlathon')
    const collection = db.collection('info')

    const name = 'filehippo'
    const data = {
        createdAt: new Date("2015-12-12T07:34:14.202Z"),
        modifiedAt: new Date("2015-12-13T08:36:13.202Z"),
        accessedAt: new Date("2015-12-14T08:36:13.202Z"),
        totalRequestCount: 500,
        handledRequestCount: 480,
        pendingRequestCount: 20,
    }

    collection.updateOne({ name }, { $set: data}, { upsert: true }, () => {
        collection.find().toArray((err, items) => {
            console.log(items)
        })
    })
}

run()
