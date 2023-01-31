// build on top of error
module.exports = class UserError extends Error {
  constructor(message, code = 400) {
    // make everything the same
    super(message);
    // add a custom code for troubleshooting
    this.code = code;
  }
};
