// Core Module
const multer = require('multer');
const path = require('path');
// External Module
const express = require('express');
const hostRouter = express.Router();
 
// Local Module
const homesController = require('../controller/hostController');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Save files here
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g. 17235483929.jpg
  }
});

const upload = multer({ storage: storage });

hostRouter.get("/add-home", homesController.getAddhomes);

hostRouter.post("/add-home", upload.single('photo'), homesController.postAddhomes);

hostRouter.get("/host-home-list", homesController.getHostHome);

hostRouter.get("/edit-home/:homeId", homesController.getEditHome);

hostRouter.post("/edit-home", upload.single('photo'), homesController.postEditHome);

hostRouter.post("/delete-home/:homeId", homesController.postDeleteHome);

module.exports = hostRouter;