const { getDb } = require("../utils/database");
const {ObjectId}= require('mongodb');

module.exports = class Favourite {

  constructor(homeId) {
    this.homeId = homeId;
  }

  save() {
    const db = getDb();
    return db.collection('favourites').insertOne(this);
  }

  static getFavourites() {
    const db = getDb();
    return db.collection("favourites").find().toArray();
  }

  static deleteById(delhomeId) {
     const db = getDb();
     return db.collection("favourites").deleteOne({ homeId: delhomeId });
  }
};
