const Home = require('../models/home'); 

exports.getAddhomes = (req, res, next) => {
  res.render('host/edit-home.ejs',
  { currentPage: '/host/add-home' , 
    isLoggedIn : req.isLoggedIn,
    editing: false,
    user : req.session.user
  });
}
 

exports.getEditHome = (req, res, next) => {
  const editing = req.query.editing === 'true';
  Home.findOne({ _id: req.params.homeId, host: req.session.user._id }) // 👈 only if user is the host
    .then(home => {
      if (!home) {
        console.log("Home not found or unauthorized");
        return res.redirect('/host/host-home-list');
      }

      res.render('host/edit-home', {
        currentPage: '/host/add-home',
        home,
        editing,
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
      });
    })
    .catch(err => {
      console.error("Error loading home:", err);
      res.redirect('/host/host-home-list');
    });
};



exports.getHostHome = (req, res, next) => {
  Home.find({ host: req.session.user._id }) // 👈 only this host's homes
    .then(registerHome => {
      res.render('host/host-home-list', {
        registerHome,
        currentPage: 'host-home-list',
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
      });
    })
    .catch(err => {
      console.error("Error fetching homes:", err);
      res.redirect('/');
    });
};


exports.postAddhomes = (req, res, next) => {
 const {houseName, location, price, photoUrl, rating, description} = req.body;
  const home = new Home({
    houseName,
    location,
    price,
    photoUrl,
    rating,
    host: req.session.user._id,
    description
});
  home.save();
  res.redirect('/host/host-home-list');
}


exports.postEditHome = (req, res, next) => {
  const { _id, houseName, location, price, photoUrl, rating, description} = req.body;

  Home.findOne({ _id, host: req.session.user._id }) // 👈 only allow if host
    .then(home => {
      if (!home) {
        return res.status(403).send('Unauthorized');
      }

      home.houseName = houseName;
      home.location = location;
      home.price = price;
      home.photoUrl = photoUrl;
      home.rating = rating;
      home.description = description;

      return home.save();
    })
    .then(() => {
      res.redirect('/host/host-home-list');
    })
    .catch(err => {
      console.error("Error updating home:", err);
      res.redirect('/host/host-home-list');
    });
};


// exports.postDeleteHome = (req, res, next) => {
//   const homeId = req.params.homeId;
//   Home.findByIdAndDelete(homeId)
//     .then(result => {
//       console.log("Deleted home successfully");
//       res.redirect("/host/host-home-list");
//     })
//     .catch(err => {
//       console.error("Error deleting home:", err);
//       res.redirect("/host/host-home-list");
//     });
// };


exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;

  Home.findOneAndDelete({ _id: homeId, host: req.session.user._id }) // 👈 secure delete
    .then(result => {
      if (!result) {
        return res.status(403).send('Unauthorized to delete this home');
      }

      res.redirect("/host/host-home-list");
    })
    .catch(err => {
      console.error("Error deleting home:", err);
      res.redirect("/host/host-home-list");
    });
};
