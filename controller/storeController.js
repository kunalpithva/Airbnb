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
      user : req.session.user,
    });
  });
};

exports.getBookings = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const bookings = await Booking.find({ user: userId }).populate('home');

    res.render("store/booking", {
      pageTitle: "My Bookings",
      currentPage: "booking",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
      bookings
    });
  } catch (err) {
    console.error("Error fetching bookings", err);
    res.redirect("/homes");
  }
};


exports.postBookings = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const homeId = req.body.homeId;
    if (!userId || !homeId) {
      return res.redirect('/login');
    }
    const user = await User.findById(userId);
    const home = await Home.findById(homeId);
    if (!user) {
      return res.redirect('/login');
    }
    // Create booking with firstName copied from user
    await Booking.create({
      user: userId,
      home: homeId,
      firstName: user.firstName,
      homeName: home.houseName,
      homePrice: home.price  
    });
    res.redirect('/booking');
  } catch (error) {
    console.error('Booking failed:', error);
    res.redirect('/homes');
  }
};

exports.postCancelBooking = async (req, res, next) => {
  try {
    const homeId = req.body.homeId;
    const userId = req.session.user._id;
    if (!userId || !homeId) {
      return res.redirect('/login');
    }
    await Booking.deleteOne({ user: userId, home: homeId });
    res.redirect('/booking');
  } catch (err) {
    console.error('Failed to cancel booking:', err);
    res.redirect('/booking');
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

// exports.postAddToFavourite = async (req, res, next) => {
//   const homeId = req.body.homeId;
//   const userId = req.session.user._id;
//   const user = await User.findById(userId).populate('favourites');
//   if(!user.favourites.includes(homeId)){
//     user.favourites.push(homeId);
//     await user.save();
//   }
//   res.redirect("/favourites");
// };


exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');

  const isAlreadyFavourite = user.favourites.some(fav => fav._id.toString() === homeId);

  if (!isAlreadyFavourite) {
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


exports.getHomeDetails = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;

    const home = await Home.findById(homeId).populate('host', 'firstName');

    if (!home) {
      console.log("Home not found");
      return res.redirect("/homes");
    }

    res.render("store/home-detail", {
      home: home,
      pageTitle: "Home Detail",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
      userType: req.session.user ? req.session.user.userType : null,
    });
  } catch (err) {
    console.error("Error fetching home details:", err);
    res.redirect("/homes");
  }
};

