const mongo = require('mongodb').MongoClient
const url = 'mongodb://46.101.205.195:27017'

mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, client) => {
    if (err) {
        console.error(err)
        return
    }

    console.log('success', !!client)
})
