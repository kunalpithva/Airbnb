// Core Module
const path = require('path');

// External Module
const express = require('express');
const hostRouter = express.Router();
 
// Local Module
const homesController = require('../controller/hostController');

hostRouter.get("/add-home", homesController.getAddhomes);

hostRouter.post("/add-home", homesController.postAddhomes);

hostRouter.get("/host-home-list", homesController.getHostHome);

hostRouter.get("/edit-home/:homeId", homesController.getEditHome);

hostRouter.post("/edit-home", homesController.postEditHome);

hostRouter.post("/delete-home/:homeId", homesController.postDeleteHome);

module.exports = hostRouter;