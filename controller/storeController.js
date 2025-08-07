const Home = require("../models/home");
const User = require("../models/user");
const Booking = require('../models/booking');
const Payment = require('../models/payment');


const {ObjectId}=require('mongodb');

exports.getIndex = async (req, res, next) => {
  try {
    const homes = await Home.find();
    const userId = req.session.user ? req.session.user._id.toString() : null;

    const allBookings = await Booking.find({});
    const payments = await Payment.find({});

    const paidHomeIds = new Set(payments.map(p => p.home.toString()));

    const registerHome = homes.map(home => {
      const homeId = home._id.toString();

      const bookingsForHome = allBookings.filter(b => b.home.toString() === homeId);
      const isPaid = paidHomeIds.has(homeId);

      // Determine if home is booked and paid by someone else
      let isBookedByOther = false;
      if (isPaid) {
        const someoneElseBooked = bookingsForHome.find(b => b.user.toString() !== userId);
        if (someoneElseBooked) {
          const bookedAt = someoneElseBooked?.createdAt || someoneElseBooked?.bookedAt;
          const diffMins = bookedAt ? (Date.now() - new Date(bookedAt).getTime()) / (1000 * 60) : null;

          if (diffMins === null || diffMins < 2) {
            isBookedByOther = true;
          }
        }
      }

      return {
        ...home._doc,
        isBookedByOther
      };
    });

    res.render('store/index', {
      registerHome,
      currentPage: 'index',
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    });
  } catch (err) {
    console.error("Error in getIndex:", err);
    res.redirect('/');
  }
};



// exports.getHomes = async (req, res, next) => {
//   try {
//     const homes = await Home.find();
//     const userId = req.session.user ? req.session.user._id : null;

//     let userBookings = [];

//     if (userId) {
//       userBookings = await Booking.find({ user: userId });
//     }

//     const now = Date.now();
//     const bookedHomeIds = new Set(userBookings.map(b => b.home.toString()));

//     // ✅ Mark homes as booked and calculate if they can be booked again
//     const registerHome = homes.map(home => {
//       const isBooked = bookedHomeIds.has(home._id.toString());

//       let isBookableAgain = false;

//       if (isBooked) {
//         const booking = userBookings.find(b => b.home.toString() === home._id.toString());
//         const bookedAt = booking?.createdAt || booking?.bookedAt || null;

//         if (bookedAt) {
//           const diffMins = (now - new Date(bookedAt).getTime()) / (1000 * 60);
//           if (diffMins >= 1) { // only bookable again after 1 minute
//             isBookableAgain = true;
//           }
//         } else {
//           isBookableAgain = true;
//         }
//       }

//       return {
//         ...home._doc,
//         isBooked,
//         isBookableAgain
//       };
//     });

//     // ✅ Get all payments and map by home ID
//     const payments = await Payment.find({});
//     const paymentMap = {};
//     payments.forEach(p => {
//       paymentMap[p.home.toString()] = true;
//     });

//     res.render("store/home-list", {
//       registerHome,
//       pageTitle: "Homes List",
//       currentPage: "Home",
//       isLoggedIn: req.isLoggedIn,
//       user: req.session.user,
//       paymentMap
//     });
//   } catch (err) {
//     console.error("Error loading homes:", err);
//     res.redirect("/");
//   }
// };

exports.getHomes = async (req, res, next) => {
  try {
    const homes = await Home.find();
    const userId = req.session.user ? req.session.user._id.toString() : null;

    // User's own bookings
    let userBookings = [];
    if (userId) {
      userBookings = await Booking.find({ user: userId });
    }

    const now = Date.now();

    // All bookings and payments
    const allBookings = await Booking.find({});
    const payments = await Payment.find({});

    // Map of payments by homeId
    const paidHomeIds = new Set(payments.map(p => p.home.toString()));

    // Map homeId => bookings[]
    const bookingMap = new Map();
    allBookings.forEach(booking => {
      const homeId = booking.home.toString();
      if (!bookingMap.has(homeId)) {
        bookingMap.set(homeId, []);
      }
      bookingMap.get(homeId).push(booking);
    });

    // Blocked homes for current user (booked & paid & within 2 mins, or another user is in bookableAgain window)
    const blockedHomeIds = new Set();

    for (let [homeId, bookings] of bookingMap.entries()) {
      for (let booking of bookings) {
        const bookedAt = booking?.createdAt || booking?.bookedAt;
        const diffMins = bookedAt ? (now - new Date(bookedAt).getTime()) / (1000 * 60) : null;

        const isPaid = paidHomeIds.has(homeId);
        const isByOtherUser = booking.user.toString() !== userId;

        // Block if another user is still within "bookable again" window (1 to 2 mins)
        if (isByOtherUser && diffMins !== null && diffMins >= 1 && diffMins < 2) {
          blockedHomeIds.add(homeId);
        }

        // Also block if payment done by another user & booking is within 2 mins
        if (isByOtherUser && isPaid && diffMins !== null && diffMins < 2) {
          blockedHomeIds.add(homeId);
        }
      }
    }

    // Final list of homes for rendering
    const registerHome = homes
      .filter(home => !blockedHomeIds.has(home._id.toString()))
      .map(home => {
        const homeId = home._id.toString();

        const userBooking = userBookings.find(b => b.home.toString() === homeId);
        const isBooked = !!userBooking;

        let isBookableAgain = false;

        if (isBooked) {
          const bookedAt = userBooking?.createdAt || userBooking?.bookedAt;
          const diffMins = bookedAt ? (now - new Date(bookedAt).getTime()) / (1000 * 60) : null;

          // if (diffMins !== null && diffMins >= 1 && diffMins < 2) {
          //   isBookableAgain = true; // bookable again only between 1 and 2 minutes
          // }

          if (diffMins >= 2) {
            // After 2 minutes, reset both flags
            return {
              ...home._doc,
              isBooked: false,
              isBookableAgain: false
            };
          }
        }

        return {
          ...home._doc,
          isBooked,
          isBookableAgain
        };
      });

    const paymentMap = {};
    payments.forEach(p => {
      paymentMap[p.home.toString()] = true;
    });

    res.render("store/home-list", {
      registerHome,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
      paymentMap
    });
  } catch (err) {
    console.error("Error loading homes:", err);
    res.redirect("/");
  }
};


exports.getBookings = async (req, res, next) => {
  try {
    const userId = req.session.user._id;

    // Only get unpaid bookings
    const bookings = await Booking.find({ user: userId}).populate('home');

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

    const user = await User.findById(userId,'firstName');
    const home = await Home.findById(homeId,'houseName price');
    if (!user || !home) {
      return res.redirect('/login');
    }

    // 🔍 Check if this home is already booked by the user
    const existingBooking = await Booking.findOne({
      user: userId,
      home: homeId,
      isPaid: true,
      firstName: user.firstName,
      houseName: home.houseName
    });

    if (existingBooking) {
      // 🛑 Prevent duplicate booking and redirect to bookings page
      return res.redirect('/booking');
    }

    // ✅ Create booking
    await Booking.create({
      user: userId,
      home: homeId,
      firstName: user.firstName,
      houseName: home.houseName,  // ✅ field must be `houseName` if that's what your schema expects
      price: home.price           // ✅ field must be `price` not `homePrice`
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


exports.getBookedHomes = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const bookings = await Booking.find({ user: userId })
      .populate('home')
      .sort({ bookedAt: -1 }); // Newest bookings first (optional)

    res.render('store/booked', {
      isLoggedIn: true,
      user: req.session.user,
      bookings
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.redirect('/');
  }
};
