const Home = require('../models/home'); 

exports.getAddhomes = (req, res, next) => {
  res.render('host/edit-home.ejs',
  { currentPage: '/host/edit-home' , 
    isLoggedIn : req.isLoggedIn,
    editing: false,
    user : req.session.user
  });
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
      { 
        currentPage: '/host/edit-home' ,
        home: home , 
        editing:editing ,
        isLoggedIn : req.isLoggedIn,
        user : req.session.user
      });
    }
  });
}


exports.getHostHome = (req, res, next) => {
  Home.find().then(registerHome => 
    res.render('host/host-home-list', { 
      registerHome: registerHome ,
      currentPage: 'host-home-list',
      isLoggedIn : req.isLoggedIn,
      user : req.session.user
   })
  );  
};

exports.postAddhomes = (req, res, next) => {
 const {houseName, location, price, photoUrl, rating } = req.body;
  const home = new Home({
    houseName,
    location,
    price,
    photoUrl,
    rating
});
  home.save();
  res.redirect('/host/host-home-list');
}

exports.postEditHome = (req, res, next) => {
  const { _id, houseName, location, price, photoUrl, rating } = req.body;
  Home.findById(_id).then((home)=>{
    home.houseName = houseName;
    home.location = location;
    home.price = price;
    home.photoUrl = photoUrl;
    home.rating = rating;
    home.save().then(result => {
      console.log("Home updated successfully");
    }).catch(err => {
      console.error("Error updating home:", err);
    });
    res.redirect('/host/host-home-list');
  })
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findByIdAndDelete(homeId)
    .then(result => {
      console.log("Deleted home successfully");
      res.redirect("/host/host-home-list");
    })
    .catch(err => {
      console.error("Error deleting home:", err);
      res.redirect("/host/host-home-list");
    });
};
