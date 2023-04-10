// build on top of error
module.exports = class UserError extends Error {
  constructor(message, code = 400, additional) {
    // make everything the same
    super(message);

    // add a custom code for troubleshooting
    this.code = code;

    // add info for middleware
    this.userError = true;

    // add custom info for ui
    this.additional = additional;
  }
};
