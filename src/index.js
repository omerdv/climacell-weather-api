const express = require('express');
const app = express();
const {reformatDocument, computeMetrics} = require('./utils');
const config = require('../resources/config');
const mongodb = require("mongodb").MongoClient;
const csvtojson = require("csvtojson");
app.set('views','./views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// upload csv file to db
function uploadCSV(filePath) {
    return new Promise((resolve, reject) => {
        csvtojson({noheader: false, headers: ['lat','lon', 'forecastTime', 'Temperature', 'Precipitation']})
        .fromFile(filePath)
        .then((csvData) => {
            app.locals.collection
            .insertMany(csvData, (err, res) => {
                if (err) {
                    console.error(err);
                    reject(false);
                };
                console.log(`Inserted: ${res.insertedCount} rows`);
                resolve(true);
            });
        });
    });
}

//initiate server
function runServer(){
    // upon termination of server, close db connection
    process.on('SIGTERM', () => {
        app.locals.client.close();
        process.exit();
    });
    // setup express
    app.use(express.json()); //activate the bodyparser middleware
    app.use(express.urlencoded({ extended: false }));
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Listening on port ${port}...`));
}

//init DB (if it doesn't exist), upload csv files, start server
async function init() {
    // create shared db and collection connections
    await mongodb.connect(config.getURI(), { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        app.locals.client = client;
        app.locals.db = client.db('forcastDB');
        app.locals.collection = app.locals.db.collection('forcasts');
    })
    .catch(error => console.error(error));

    const collection = app.locals.collection;
    const numberOfDocs = await collection.find({}).count();
    if(numberOfDocs == 0){ //if DB doesn't exist, create it
        console.log("Uploading csv files to DB\n");
        var upload1 = uploadCSV("./resources/file1.csv");
        var upload2 = uploadCSV("./resources/file2.csv");
        var upload3 = uploadCSV("./resources/file3.csv");

        // wait for all promises to resolve (all files uploaded to DB)
        Promise.all([upload1, upload2, upload3]).then(values => {
            if(values[0] && values[1] && values[2]){
                console.log("done loading csvs to db\n");
                runServer();
            }
            else{
                console.log("Error in uploding csv files\n");
                process.exit(1);
            }
        });
    }
    else{ //DB already set up
        runServer();
    }
}

// setup endpoints
app.get('/weather/data', async (req, res) => {
    const collection = app.locals.collection; //use shared connection
    collection.find({ lat: req.query.lat, lon: req.query.lon })
    .toArray()
    .then(response => {
        let filteredArr = response.map(x => reformatDocument(x));
        if(filterArr.length > 0) {
            res.status(200).json(filteredArr);
        }
        else{
            res.status(204).send("No forcasts available for the requested location.");
        }
    })
    .catch(error => console.error(error));
});

app.get('/weather/summarize', async (req, res) => {
    const collection = app.locals.collection; //use shared connection
    collection.find({ lat: req.query.lat, lon: req.query.lon })
    .toArray()
    .then(response => {
        let metrics = computeMetrics(response);
        if(metrics['max']['Temperature'] != null){
            res.status(200).json(metrics);
        }
        else{
            res.status(204).send("No forcasts available for the requested location.");
        }
    })
    .catch(error => console.error(error));
});

app.get('*', function(req, res) {
    res.status(200).render("landing.html");
});

init(); //init DB (if needed) + server