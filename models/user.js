const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['guest','host'], // adjust roles as needed
    required: true
  },
  favourites:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Home'
  }]
});

module.exports = mongoose.model('User',userSchema);