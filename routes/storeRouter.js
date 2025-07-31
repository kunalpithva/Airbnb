// External Module
const express = require("express");
const storeRouter = express.Router();

// Local Module
const storeController = require("../controller/storeController");

storeRouter.get("/", storeController.getIndex);
storeRouter.get("/home-list", storeController.getHomes);
storeRouter.get("/booking", storeController.getBookings);
storeRouter.post("/booking",storeController.postBookings);
storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
storeRouter.post("/favourites", storeController.postAddToFavourite);
storeRouter.get("/favourites", storeController.getFavouriteList);
storeRouter.post("/favourites/delete/:homeId", storeController.postRemoveFromFavourite);



module.exports = storeRouter;
