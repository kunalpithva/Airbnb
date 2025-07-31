const Home = require("../models/home");
const User = require("../models/user");
const Booking = require('../models/booking');


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

exports.getBookings = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const bookings = await Booking.find({ user: userId }).populate('home');

    res.render("store/booking", {
      pageTitle: "My Bookings",
      currentPage: "bookings",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
      bookings
    });
  } catch (err) {
    console.error("Error fetching bookings", err);
    res.redirect("/homes");
  }
};


exports.postBookings = async (req, res, next) => {
  try {
    const homeId = req.body.homeId;
    const userId = req.session.user._id;

    if (!userId || !homeId) {
      return res.redirect('/login');
    }

    // Prevent duplicate bookings (optional)
    const existingBooking = await Booking.findOne({ user: userId, home: homeId });
    if (!existingBooking) {
      await Booking.create({ user: userId, home: homeId });
    }

    res.redirect('/bookings');
  } catch (err) {
    console.error('Booking failed:', err);
    res.redirect('/homes');
  }
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


exports.postRemoveFromFavourite = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.session.user._id, {
      $pull: { favourites: req.params.homeId }
    });
    res.redirect('/favourites');
  } catch (err) {
    console.error(err);
    res.redirect('/favourites');
  }
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

