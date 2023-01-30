const express = require("express");
const app = express();

require("./websocket");

app.use(express.static("client/"));

app.get("/", (_, res) => res.sendFile(__dirname + "/client/index.html"));

app.listen(5500, () => console.log("Listening on port 5500"));
