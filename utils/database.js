const { MongoClient } = require('mongodb');

const url = "mongodb+srv://kunaljpithva:kUn%40l1111@kunal.a1w7jxa.mongodb.net/airbnb?retryWrites=true&w=majority";

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(url)
    .then(client => {
      console.log("Connected to MongoDB");
      callback();
      _db = client.db('airbnb');
    })
    .catch(err => {
      console.error("Failed to connect to MongoDB", err);
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw new Error("No database found!");
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;