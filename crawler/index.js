const mongo = require('mongodb').MongoClient
const url = 'mongodb://root:tvojastara@46.101.177.242:27017'

mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, client) => {
    if (err) {
        console.error(err)
        return
    }

    const db = client.db('crawlathon')
    const collection = db.collection('meta')

    collection.find().toArray((err, items) => {
        console.log(items)
    })
})
