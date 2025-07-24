// Core Modules
const fs = require("fs");
const path = require("path");
const rootDir = require("../utils/pathUtil");
const Favourite = require("./favourite");
const { getDb } = require("../utils/database");
const { ObjectId } = require("mongodb");

const homeDataPath = path.join(rootDir, "data", "homes.json");
const favouriteDataPath = path.join(rootDir, "data", "favourite.json");


module.exports = class Home {
  constructor(_id, houseName, location, price, photoUrl, rating) {
    this._id = _id && _id !== "" ? new ObjectId(String(_id)) : undefined; // ← important!
    this.houseName = houseName;
    this.location = location;
    this.price = price;
    this.photoUrl = photoUrl;
    this.rating = rating;
  }

  save() {
    const db = getDb();
    const homeData = {
      houseName: this.houseName,
      location: this.location,
      price: this.price,
      photoUrl: this.photoUrl,
      rating: this.rating
    };
    if (this._id) {
      // Update existing home
      return db.collection("homes")
        .updateOne({ _id: new ObjectId(String(this._id)) }, { $set: homeData });
    } else {
      // Insert new home
    return db.collection("homes")
      .insertOne(this)
      .then(result => {
        console.log("Home saved successfully", result);
      });
    }
  }

  static fetchAll() {
    const db = getDb();
    return db.collection("homes").find().toArray();
  }

  static findById(homeId) {
    const db = getDb();
    return db.collection("homes").find({ _id: new ObjectId(String(homeId)) }).next();
  }

  static update(homeId, updatedHome) {
    const db = getDb();
    return db.collection("homes").updateOne({ _id: new ObjectId(String(homeId)) }, { $set: updatedHome });
  }

  static deleteById(homeId) {
    const db = getDb();
    if (!ObjectId.isValid(homeId)) {
      return Promise.reject(new Error("Invalid ObjectId"));
    }
    return db.collection("homes").deleteOne({ _id: new ObjectId(String(homeId)) });
  }

};
  