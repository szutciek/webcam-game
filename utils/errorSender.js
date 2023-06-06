const errorSender = (err, _, res, __) => {
  if (err.userError === true) {
    sendUserError(err, res);
  } else {
    sendServerError(err, res);
  }
};

const sendUserError = (err, res) => {
  res.status(err.code || 400).json({
    status: "error",
    message: err.message,
    additional: err.additional,
  });
};

const sendServerError = (err, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};

module.exports = errorSender;
