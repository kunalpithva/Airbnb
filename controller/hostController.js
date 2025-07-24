const Home = require('../models/home'); 

exports.getAddhomes = (req, res, next) => {
  res.render('host/edit-home.ejs',
  { currentPage: '/host/edit-home' , editing: false });
}
 
exports.getEditHome = (req, res, next) => {
  const editing = req.query.editing === 'true';
  Home.findById(req.params.homeId).then(home => {
    if (!home) {
      console.log("Home not found");
      return res.redirect('/host/host-home-list');
    }
    else{
      console.log("Home found : ", home);
      res.render('host/edit-home', 
      { currentPage: '/host/edit-home' , home: home , editing:editing });
    }
  });
}


exports.getHostHome = (req, res, next) => {
  Home.fetchAll().then(registerHome => 
    res.render('host/host-home-list', { registerHome: registerHome , currentPage: 'host-home-list' })
  );  
};

exports.postAddhomes = (req, res, next) => {
 const { _id, houseName, location, price, photoUrl, rating } = req.body;
  const home = new Home(
    _id,
    houseName,
    location,
    price,
    photoUrl,
    rating
  );
  home.save();
  res.redirect('/host/host-home-list');
}

exports.postEditHome = (req, res, next) => {
  const { _id, houseName, location, price, photoUrl, rating } = req.body;
  const home = new Home(_id, houseName, location, price, photoUrl, rating);
  home._id = _id;
  home.save().then(result => {
    console.log("Home updated successfully");
  }).catch(err => {
    console.error("Error updating home:", err);
  });
  res.redirect('/host/host-home-list');
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.deleteById(homeId)
    .then(result => {
      console.log("Deleted home successfully");
      res.redirect("/host/host-home-list");
    })
    .catch(err => {
      console.error("Error deleting home:", err);
      res.redirect("/host/host-home-list");
    });
};
