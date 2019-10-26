const { connect } = require('./src/mongo')

// const response = process.argv[2];
// if (!response) {
//     throw "Please provide path to file as a first argument";
// }

const importFile = async (response) => {
      const mongoClient = await connect()
      const db = mongoClient.db('crawlathon')
      const metaCollection = db.collection('meta')
      const dataCollection = db.collection('data')
      const headersCollection = db.collection('headers')
      const name = response.meta.name

      if (response.meta.hasResponse) {
        insertData(metaCollection, { name }, response.meta)
      }

      for(var i = 0; i < response.data.length; i++)
      {
        if (response.data[i].hasResponse) {
          response.data[i].headers.responseId = i
          insertData(headersCollection, { responseId: i }, response.data[i].headers)
          response.data[i].headers = i
        }

        insertData(dataCollection, { url: response.data[i] }, response.data[i])
      }
}

function insertData (collection, query, data) {
      collection.updateOne(query, { $set: data}, { upsert: true }, () => {
          collection.find().toArray((err, items) => {
              console.log('items', items)
              console.error(err)
          })
      })
}

importFile(require(response)).then(console.log).catch(console.error);;


// mongo insert dummy
// const run = async () => {
//     const mongoClient = await connect()
//     const db = mongoClient.db('crawlathon')
//     const collection = db.collection('info')
//     const collection = db.collection('data')
//     const collection = db.collection('headers')
//
//     const name = 'filehippo'
//     const data = {
//         createdAt: new Date("2015-12-12T07:34:14.202Z"),
//         modifiedAt: new Date("2015-12-13T08:36:13.202Z"),
//         accessedAt: new Date("2015-12-14T08:36:13.202Z"),
//         totalRequestCount: 500,
//         handledRequestCount: 480,
//         pendingRequestCount: 20,
//     }
//
//     collection.updateOne({ name }, { $set: data}, { upsert: true }, () => {
//         collection.find().toArray((err, items) => {
//             console.log(items)
//         })
//     })
// }

// run()
