const express = require('express');
const app = express();
// import {reformatDocument, computeMetrics} from './utils';
const {reformatDocument, computeMetrics} = require('./utils');
// const forcastModel = require('./mongo.js');
// const routes = require('./routes');
// forcast_collection = null;
const mongodb = require("mongodb").MongoClient;
const csvtojson = require("csvtojson");
mongo_key = 'oMApqeCZj5ow1EYW'; // save mongo key + uri to config file
mongoURI = `mongodb+srv://admin_od:${mongo_key}@cluster0.y3nm4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


// upload csv file to db
function uploadCSV(filePath) {
    return new Promise((resolve, reject) => {
        csvtojson({noheader: false, headers: ['lat','lon', 'forecastTime', 'Temperature', 'Precipitation']})
        .fromFile(filePath)
        .then((csvData) => {
            console.log(csvData[0]);
            mongodb.connect(mongoURI,{ useNewUrlParser: true, useUnifiedTopology: true },
            (err, client) => {
                if (err) {
                    console.error(err);
                    reject(false);
                };
                client
                .db("forcastDB")
                .collection("forcasts")
                .insertMany(csvData, (err, res) => {
                    if (err) {
                        console.error(err);
                        reject(false);
                    };
                    console.log(`Inserted: ${res.insertedCount} rows`);
                    client.close();
                    resolve(true);
                });
            });
        });
    });
}

//init DB (if it doesn't exist), upload csv files, start server
async function init(app) {
    await mongodb.connect(mongoURI, { useNewUrlParser: true })
    .then(client => {
      const db = client.db('forcastDB');
      if(!db.listCollections({ name: "forcasts" }).hasNext()){ //if DB doesn't exist, create it
        console.log("Uploading csv files to DB\n");
        var upload1 = uploadCSV("./resources/file1.csv");
        var upload2 = uploadCSV("./resources/file2.csv");
        var upload3 = uploadCSV("./resources/file3.csv");

        // wait for all promises to resolve (all files uploaded to DB)
        Promise.all([upload1, upload2, upload3]).then(values => {
            if(values[0] && values[1] && values[2]){
                console.log("done loading csvs to db\n");
            }
            else{
                console.log("Error in uploding csv files\n");
                process.exit(1);
            }
        });  
      }
    })
    runServer(app);
}

init(app);


// const app = express();
// // Connection.open();
// app.use(express.json()); //this line activates the bodyparser middleware
// app.use(express.urlencoded({ extended: false }));

function runServer(app){
    // setup express
    app.use(express.json()); //this line activates the bodyparser middleware
    app.use(express.urlencoded({ extended: false }));
    // app.use(routes);
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Listening on port ${port}...`));
}


// setup endpoints
app.get('/weather/data', async (req, res) => {
    mongodb.connect(mongoURI, { useNewUrlParser: true })
    .then(client => {
      const db = client.db('forcastDB');
      const collection = db.collection('forcasts');
      collection.find({ lat: req.query.lat, lon: req.query.lon })
      .toArray()
      .then(response => {
          let filteredArr = response.map(x => reformatDocument(x,false))
          res.status(200).json(filteredArr);
       })
      .catch(error => console.error(error));
    });
});


app.get('/weather/summarize', async (req, res) => {
    mongodb.connect(mongoURI, { useNewUrlParser: true })
    .then(client => {
      const db = client.db('forcastDB');
      const collection = db.collection('forcasts');
      collection.find({ lat: req.query.lat, lon: req.query.lon })
      .toArray()
      .then(response => {
          let metrics = computeMetrics(response);
          res.status(200).json(metrics);
       })
      .catch(error => console.error(error));
    });
});


// // app.use(routes);
// const port = process.env.PORT || 5000;
// app.listen(port, () => console.log(`Listening on port ${port}...`));