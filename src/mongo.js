const mongo = require('mongodb').MongoClient

const url = 'mongodb://root:tvojastara@46.101.177.242:27017'
let mongoClient = null
const defaultOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

/*
 Connect to mongo
 */
const connect = async (options = {}) => {
    if (mongoClient) {
        await mongoClient.close()
    }

    return new Promise((resolve, reject) => {
        mongo.connect(url, {
            ...defaultOptions,
            ...options
        }, (err, client) => {
            if (err) {
                reject(err)
                return
            }

            mongoClient = client

            resolve(client)
        })
    })
}

/*
 Get current client instance, null if connect was not called
 */
const getClient = () => {
    return mongoClient
}

module.exports = {
    connect,
    getClient
}
