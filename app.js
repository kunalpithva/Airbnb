// Core Module
const path = require('path');

// External Module
const express = require('express');
const {mongoConnect} = require("./utils/database");

// Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const rootDir = require("./utils/pathUtil");
const errorController = require("./controller/error");

const app = express();

app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'public')));

// Routes
app.use("/", storeRouter);
app.use("/host", hostRouter);

// 404
app.use(errorController.pageNotFound);

const PORT = 3000;
mongoConnect(() => {
  console.log("MongoDB connection established");
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
