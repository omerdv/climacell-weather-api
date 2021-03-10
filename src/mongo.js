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

module.exports = dbClient;
