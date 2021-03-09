const mongoose = require('mongoose');

// define forecast Schema for mongoose
const forcastSchema = new mongoose.Schema({
    lat: {
        type: String // on querying make sure json output is not a string!
    },
    lon: {
        type: String // on querying make sure json output is not a string!
    },
    forecastTime: {
      type: String
    },
    Temperature: {
      type: String
    },
    Precipitation: {
        type: String
    }

});

const forecastModel = mongoose.model('Forcast', forcastSchema);
  
module.exports = forecastModel;
