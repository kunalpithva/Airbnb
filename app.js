// Core Module
const path = require('path');

// External Module
const express = require('express');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const db_path="mongodb+srv://kunaljpithva:kUn%40l1111@kunal.a1w7jxa.mongodb.net/airbnb?retryWrites=true&w=majority";

// Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const paymentRoutes = require('./routes/payment');
const rootDir = require("./utils/pathUtil");
const errorController = require("./controller/error");
const authRouter = require('./routes/authRouter');
const {default : mongoose} = require('mongoose');

const app = express();

app.use('/uploads', express.static('uploads'));


app.set('view engine', 'ejs');

//store session in mongodb
const store = new MongoDbStore({
  uri : db_path,
  collection : 'session'
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'public')));

//session
app.use(session({
    secret : "airbnb website",
    resave : false,
    saveUninitialized : false,
    store : store,
    cookie: {
      maxAge: 30 * 60 * 1000 ,// ⏱️ 30 minutes in milliseconds
      secure: false 
    }
  })
);

//cookie
app.use((req,res,next)=>{
  req.isLoggedIn = req.session.isLoggedIn;
  next();
})

// Routes
app.use("/",authRouter);
app.use("/", storeRouter);
app.use("/host",(req,res,next)=>{
  if(req.isLoggedIn){
    next();
  }else{{
    res.redirect('/login');
  }}
},hostRouter);
// app.js or server.js

// Mount router on /payment
app.use('/payment', paymentRoutes);



// 404
app.use(errorController.pageNotFound);

const PORT = 3000;
mongoose.connect(db_path).then(()=>{
  console.log("MongoDB connection established");
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.log(err);
})