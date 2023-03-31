const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validators = require("../utils/validators");

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Name is required"],
    unique: true,
    trim: true,
    maxlength: [15, "Name is too long"],
    validate: [
      validators.validateCharacters,
      "Name includes invalid characters",
    ],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    unique: true,
    trim: true,
    validate: [validators.validateEmail, "Please enter a valid email"],
  },
  profile: {
    type: String,
    required: [true, "Profile is required"],
    validate: [
      validators.validateManyCharacters,
      "Profile includes invalid characters",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be longer than 8 characters"],
    select: false,
  },
});

userSchema.methods.setPassword = function (password) {
  this.password = bcrypt.hashSync(password, 9);
};

userSchema.methods.checkPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
