const mongoose = require("mongoose");
const express = require("express");
const app = express();

const errorSender = require("./utils/errorSender.js");
const {
  expressPort,
  dbAddress,
  dbName,
  dbAuthOn,
  dbUser,
  dbPwd,
  dbAuthDB,
  inProduction,
} = require("./config.js");

const dbConn = dbAuthOn
  ? `mongodb://${dbUser}:${dbPwd}@${dbAddress}/${dbName}?authSource=${dbAuthDB}`
  : `mongodb://${dbAddress}/${dbName}`;

mongoose.set("strictQuery", false);
mongoose
  .connect(dbConn)
  .then(() => {
    console.log(`Connected to ${dbName} database`);
  })
  .catch((err) => {
    console.log(err);
  });

const apiRouter = require("./routes/apiRouter.js");

require("./websocket");

if (inProduction === true) {
  app.get("/", (_, res) => res.sendFile(__dirname + "/dist/index.html"));
  app.get("/webpack.bundle.js", (_, res) =>
    res.sendFile(__dirname + "/dist/webpack.bundle.js")
  );
} else {
  app.get("/", (_, res) => res.sendFile(__dirname + "/client/index.html"));
}
app.get("/signin", (_, res) =>
  res.sendFile(__dirname + "/client/pages/signin.html")
);
app.get("/signup", (_, res) =>
  res.sendFile(__dirname + "/client/pages/signup.html")
);
app.get("/recover", (_, res) =>
  res.sendFile(__dirname + "/client/pages/recover.html")
);
app.get("/reset", (_, res) =>
  res.sendFile(__dirname + "/client/pages/reset.html")
);
app.get("/verify", (_, res) =>
  res.sendFile(__dirname + "/client/pages/verify.html")
);

app.use("/api", apiRouter);

app.use(express.static("client/"));

app.use(errorSender);

app.listen(expressPort, () => console.log(`Listening on port ${expressPort}`));
