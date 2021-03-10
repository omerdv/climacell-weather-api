const mongodb = require("mongodb").MongoClient;
const config = require('../resources/config');

let dbClient;

mongodb.connect(config.getURI(),{ useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
      if (err) {
          console.error(err);
      };
      dbClient = client;
  });

await mongodb
  .connect(config.getURI(), { useNewUrlParser: true, poolSize: 10 })
  .then(client => {
    let db = client.db('forcastDB');
    let collection = db.collection('forcasts');
  })
  .catch(error => console.error(error));

module.exports = dbClient;
