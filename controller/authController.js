const { check,validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req,res,next)=>{
  res.render("auth/login", {
      currentPage :"login",
      isLoggedIn:false,
      errors : [],
      oldInput : {},
      user:{}
    });
}


exports.postLogin = async (req,res,next) => {
  const {email,password} = req.body;
  const user = await  User.findOne({email});
  if(!user){
    return res.status(422).render("auth/login",{
        currentPage :"login",
        isLoggedIn : false,
        errors : ['User Not Found'],
        oldInput:{email},
        user:{}
      });
  }
  const isMatch = await bcrypt.compare(password,user.password);
  if(!isMatch){
    return res.status(422).render("auth/login",{
        currentPage :"login",
        isLoggedIn : false,
        errors : ['Invalid Password'],
        oldInput:{email},
        user:{}
      });
  }
  req.session.isLoggedIn = true;
  req.session.user = user;
  req.session.save(() => {
      res.redirect('/'); // or wherever your homepage is
    });
}


exports.postLogOut = (req,res,next) => {
  req.session.destroy(()=>{
    res.redirect("/login");
  })
}


exports.getSignup = (req,res,next)=>{
  res.render("auth/signup", {
      currentPage :"signup",
      isLoggedIn:false,
      errors : {},
      oldInput:{firstName : "",lastName : "",email : "",userType : ""},
      user:{}
    });
}


exports.postSignup = [
  check("firstName")
    .trim()
    .isLength({min:2})
    .withMessage("First Name Should Be Atleast 2 Characters Long.")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First Name Should Contain Only Alphabets."),

  check("lastName")
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("First Name Should Contain Only Alphabets."),
  
  check("email")
    .isEmail()
    .withMessage("Please Enter Valid E-mail."),

  check("password")
    .isLength({min:8})
    .withMessage("Password Must Be Atleast 8 Characters long.")
    .matches(/[a-zA-Z!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password Is Too Weak.")
    .trim(),

  check("confirmPassword")
    .trim()
    .custom((value,{req})=>{
      if (value !== req.body.password){
        throw new Error("Password Do Not Match.")
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("User Type Is Required.")
    .isIn(['guest','host'])
    .withMessage("Invelid User Type."),

  check("terms")
  .custom((value) => {
    if (value !== "on") {
      throw new Error("Please Accept The Terms & Conditions.");
    }
    return true;
  }),

    
  (req,res,next) => {
    const {firstName,lastName,email,password,userType} = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
      return res.status(422).render("auth/signup",{
        currentPage :"signup",
        isLoggedIn : false,
        errors : errors.array().map(err=>err.msg),
        oldInput:{firstName,lastName,email,password,userType},
        user:{}
      });
    }

    bcrypt.hash(password,12)
    .then(hashedPassword => {
      const user = new User({firstName,lastName,email,password:hashedPassword,userType});
      return user.save();
    })
    .then(()=>{
      res.redirect("/login");
    }).catch(err=>{
      return res.status(422).render("auth/signup",{
        currentPage :"signup",
        isLoggedIn : false,
        errors : [err.message],
        oldInput:{firstName,lastName,email,password,userType} ,
        user:{}
      });   
    })
  }
];
