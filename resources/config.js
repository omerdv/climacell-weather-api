let Config = class {
    constructor() {
      this.mongoKey = "oMApqeCZj5ow1EYW";
      this.mongoURI = `mongodb+srv://admin_od:${this.mongoKey}@cluster0.y3nm4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    }

    getKey() {
        return this.mongoKey;
    }

    getURI() {
        return this.mongoURI;
    }

};

var conf = new Config();

module.exports = conf;