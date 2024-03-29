const mongoose = require("mongoose");
const express = require("express");
const app = express();

const errorSender = require("./utils/errorSender.js");
const { database, expressPort } = require("./config.js");

mongoose.set("strictQuery", false);
mongoose
  .connect(`mongodb://127.0.0.1:27017/${database}`)
  .then(() => {
    console.log(`Connected to ${database} database`);
  })
  .catch((err) => {
    console.log(err);
  });

const apiRouter = require("./routes/apiRouter.js");

require("./websocket");

app.use(express.static("client/"));

app.get("/", (_, res) => res.send(index));
app.get("/signin", (_, res) =>
  res.sendFile(__dirname + "/client/pages/signin.html")
);
app.get("/signup", (_, res) =>
  res.sendFile(__dirname + "/client/pages/signup.html")
);

app.use(express.json());
app.use("/api", apiRouter);

app.use(errorSender);

app.listen(expressPort, () => console.log(`Listening on port ${expressPort}`));
