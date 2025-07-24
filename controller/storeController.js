const Favourite = require("../models/favourite");
const Home = require("../models/home");

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
  Favourite.getFavourites(favourites => {
    Home.fetchAll().then(registeredHomes => {
      const favouriteHomes = registeredHomes.filter(home => favourites.includes(home.id));
      res.render("store/favourite-list", {
        favorites: favouriteHomes, // <-- change this line
        pageTitle: "My Favourites",
        currentPage: "favourites",
      })
    });
  })
};

exports.postAddToFavourite = (req, res, next) => {
  Favourite.addToFavourite(req.body.id, error => {
    if (error) {
      console.log("Error while marking favourite: ", error);
    }
    res.redirect("/favourites");
  })
}

exports.postRemoveFromFavourite = (req, res, next) => {
  const homeId = req.params.homeId;
  Favourite.deleteById(homeId, error => {
    if (error) {
      console.log('Error while removing from Favourite', error);
    }
    res.redirect("/favourites");
  })
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

