const Favourite = require("../models/favourite");
const Home = require("../models/home");

const {ObjectId}=require('mongodb');

exports.getIndex = (req, res, next) => {
  Home.fetchAll().then(registerHome => {
    res.render('store/index', {
      registerHome, // ✅ ensure this is passed
      currentPage: 'index'
    });
  });
};


exports.getHomes = (req, res, next) => {
  Home.fetchAll().then(registerHome => {
    res.render("store/home-list", {
      registerHome: registerHome,
      pageTitle: "Homes List",
      currentPage: "Home",
    });
  });
};

exports.getBookings = (req, res, next) => {
  res.render("store/booking", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
  })
};

exports.getFavouriteList = (req, res, next) => {
  Favourite.getFavourites()
    .then(favourites => {
      const favoriteIds = favourites.map(fav => new ObjectId(String(fav.homeId)));

      Home.fetchAll()
        .then(registeredHomes => {
          const favouriteHomes = registeredHomes.filter(home =>
            favoriteIds.some(favId => favId.equals(home._id))
          );

          console.log("Favourites fetched:", favoriteIds);

          res.render("store/favourite-list", {
            favorites: favouriteHomes,
            pageTitle: "My Favourites",
            currentPage: "favourites",
          });
        });
    })
    .catch(err => {
      console.log("Error loading favorites:", err);
    });
};


exports.postAddToFavourite = (req, res, next) => {
  const homeId = req.body.homeId;

  Favourite.getFavourites()
    .then(favourites => {
      const alreadyFavourite = favourites.some(fav => fav.homeId.toString() === homeId);
      if (alreadyFavourite) {
        console.log("Home already in favourites");
        return res.redirect("/favourites");
      }

      const fav = new Favourite(homeId);
      return fav.save().then(() => {
        console.log("Home added to favourites");
        res.redirect("/favourites");
      });
    })
    .catch(error => {
      console.log("Error checking/adding to favourites:", error);
      res.redirect("/favourites");
    });
};

exports.postRemoveFromFavourite = (req, res, next) => {
  const homeId = req.params.homeId;
  Favourite.deleteById(homeId).then(result => {
    console.log("Home removed to favourites");
  }).catch(error => {
    console.log('Error while adding to Favourite', error);
  });
  res.redirect("/favourites");
} 

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
      });
    }
  })
};

