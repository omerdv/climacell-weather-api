// helper function, reformats json outputs
function reformatDocument(json) {
    let newDoc = {};
    newDoc["forecastTime"] = json["forecastTime"]+"Z";
    newDoc["Temperature"] = parseFloat(json["Temperature"]);
    newDoc["Precipitation"] = parseFloat(json["Precipitation"]);
    return newDoc;
}

// helper function, computes metrics (max,min,avg values)
function computeMetrics(forcasts){
    let totalTemp = 0;
    let totalPrecip = 0;
    let count = 0;
    let maxTemp = -Infinity;
    let minTemp = Infinity;
    let maxPrecip = -Infinity;
    let minPrecip = Infinity;
    for(let forcast of forcasts){
        let currentTemp = parseFloat(forcast["Temperature"]);
        let currentPrecip = parseFloat(forcast["Precipitation"]);
        totalTemp += currentTemp
        totalPrecip += currentPrecip
        count++;
        maxTemp = Math.max(maxTemp,currentTemp);
        minTemp = Math.min(minTemp,currentTemp);
        maxPrecip = Math.max(maxPrecip,currentPrecip);
        minPrecip = Math.min(minPrecip,currentPrecip);
    }
    let maxRes = { "Temperature" : maxTemp , "Precipitation" : maxPrecip };
    let minRes = { "Temperature" : minTemp , "Precipitation" : minPrecip };
    let avgRes = { "Temperature" : parseFloat((totalTemp/count).toFixed(2)) , "Precipitation" : parseFloat((totalPrecip/count).toFixed(2)) }; 
    return { max : maxRes , min : minRes , avg : avgRes };
}

module.exports = {reformatDocument, computeMetrics};