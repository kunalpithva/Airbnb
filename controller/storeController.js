const Home = require("../models/home");
const User = require("../models/user");

const {ObjectId}=require('mongodb');

exports.getIndex = (req, res, next) => {
  Home.find().then(registerHome => {
    res.render('store/index', {
      registerHome, 
      currentPage: 'index',
      isLoggedIn : req.isLoggedIn,
      user : req.session.user
    });
  });
};


exports.getHomes = (req, res, next) => {
  Home.find().then(registerHome => {
    res.render("store/home-list", {
      registerHome: registerHome,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn : req.isLoggedIn,
      user : req.session.user
    });
  });
};

exports.getBookings = (req, res, next) => {
  res.render("store/booking", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn : req.isLoggedIn,
    user : req.session.user
  })
};

exports.getFavouriteList = async(req,res,next)=>{
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
    res.render("store/favourite-list",{
      favorites: user.favourites,
      currentPage: "favourites",
      isLoggedIn : req.isLoggedIn,
      user : req.session.user
    });
}

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
  if(!user.favourites.includes(homeId)){
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};


exports.postRemoveFromFavourite = (req, res, next) => {
  const homeId = req.params.homeId;

  Favourite.deleteOne({ homeId: homeId })
    .then(result => {
      console.log("Home removed from favourites");
      res.redirect("/favourites");
    })
    .catch(error => {
      console.log("Error while removing from Favourite", error);
      res.redirect("/favourites");
    });
};


exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then(home => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn : req.isLoggedIn,
        user : req.session.user
      });
    }
  })
};

