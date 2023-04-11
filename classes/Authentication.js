const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config.js");
const UserError = require("../utils/UserError.js");
const { validateId } = require("../utils/validators.js");
const User = require("../models/User.js");

module.exports = class Authentication {
  constructor() {}

  static encodeToken(_id) {
    return jwt.sign(
      {
        exp: Math.floor(new Date().getTime() / 1000) + 1 * 24 * 60 * 60,
        _id,
      },
      jwtSecret
    );
  }

  static decodeToken(token) {
    const payload = jwt.verify(token, jwtSecret);
    if (!validateId(payload._id)) throw new UserError("Token invalid", 401);
    return payload;
  }

  static async findUserId(_id) {
    const user = await User.findOne({ _id });
    return user;
  }

  static handleCreateAccount(email, password) {}
};
