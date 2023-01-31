const { randomUUID } = require("crypto");
const { WebSocketServer: WSS, WebSocket: ws } = require("ws");
const UserError = require("./utils/UserError.js");
const handleSendError = require("./utils/handleSendError.js");

const {
  handleAuthClient,
  handleClientLeave,
} = require("./controllers/gameAuthController");
const { handleSyncPosition } = require("./controllers/gameSyncController.js");

const objects = require("./gameObjects");

const wss = new WSS({ port: 5501 });

wss.on("connection", function connection(ws) {
  ws.on("message", async function message(data) {
    try {
      const message = JSON.parse(data);
      if (message.type === "authClient") await handleAuthClient(message, ws);

      if (message.type === "pos") handleSyncPosition(message, ws);

      if (message.type === "cam") {
        if (!message.uuid) return;
        wss.clients.forEach(function each(client) {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(
              JSON.stringify({
                type: "pCam",
                uuid: message.uuid,
                data: message.data,
              })
            );
          }
        });
      }
    } catch (err) {
      if (err.name === "JsonWebTokenError")
        err = new UserError("Error while decoding token", 400);

      handleSendError(err, ws);
    }
  });

  ws.on("close", () => {
    handleClientLeave(ws.uuid);
  });
});
