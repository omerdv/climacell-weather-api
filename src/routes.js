const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
var forcast_collection = null;
mongo_key = 'oMApqeCZj5ow1EYW'; // save mongo key + uri to config file
const mongoURI = `mongodb+srv://admin_od:${mongo_key}@cluster0.y3nm4.mongodb.net/ForcastDB?retryWrites=true&w=majority`;
// Initialize connection once
MongoClient.connect(mongoURI,{ useUnifiedTopology: true }, function(err, database) {
  if(err) throw err;
  forcast_collection = database.forcasts;
});


// middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })

// setup endpoints
router.route('/weather/data').get( async (req, res) => {
    console.log(req.body);
    const { lat, lon } = req.body;
    await forcast_collection.find({ lat: lat, lon: lon }, function (err, docs) {
        if (err){
            res.send(null);
        }
        else{
            res.send(docs);
        }
    });
    
});

router.route('/weather/summarize').get(async (req, res) => {
    const { lat, lon } = req.body;
    await forcast_collection.find({ lat: lat, lon: lon }, function (err, docs) {
        if (err){
            res.status(200).send(null);
        }
        else{  // calculate needed info and send response json
            let totalTemp = 0;
            let totalPrecip = 0;
            let count = 0;
            let maxTemp = -Infinity;
            let minTemp = Infinity;
            let maxPrecip = -Infinity;
            let minPrecip = Infinity;
            for(let forcast of docs){
                totalTemp += forcast.Temperature;
                totalPrecip += forcast.Precipitation;
                count++;
                maxTemp = max(maxTemp,forcast.Temperature);
                minTemp = min(minTemp,forcast.Temperature);
                maxPrecip = max(maxPrecip,forcast.Precipitation);
                minPrecip = min(minPrecip,forcast.Precipitation);
            }
            let maxRes = { "Temperature" : maxTemp , "Precipitation" : maxPrecip };
            let minRes = { "Temperature" : minTemp , "Precipitation" : minPrecip };
            let avgRes = { "Temperature" : (totalTemp/count) , "Precipitation" : (totalPrecip/count) }; 
            res.status(200).send({ max : maxRes , min : minRes , avg : avgRes });
        }
    });
});

module.exports = router