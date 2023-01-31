const { randomUUID } = require("crypto");
const { WebSocketServer: WSS, WebSocket: ws } = require("ws");
const UserError = require("./utils/UserError.js");
const handleSendError = require("./utils/handleSendError.js");
const { validateUUID } = require("./utils/validators");

const {
  handleAuthClient,
  handleClientLeave,
} = require("./controllers/gameAuthController");
const {
  handleSyncPosition,
  handleSyncCam,
} = require("./controllers/gameSyncController.js");
const { handleRoomJoin } = require("./controllers/gameRoomController");

const objects = require("./gameObjects");

const wss = new WSS({ port: 5501 });

wss.on("connection", function connection(ws) {
  ws.on("message", async function message(data) {
    try {
      // console.time("position");
      const message = JSON.parse(data);
      if (message.type === "authClient")
        return await handleAuthClient(message, ws);

      if (!message.uuid) throw new UserError("UUID required to sync");
      if (!validateUUID(message.uuid)) throw new UserError("UUID is not valid");

      if (message.type === "pos") {
        return handleSyncPosition(message, ws);
        // console.timeEnd("position");
      }

      if (message.type === "cam") {
        return handleSyncCam(message, ws);
      }

      if (message.type === "roomjoin") {
        return handleRoomJoin(message, ws);
      }

      // if (message.type === "cam") {
      //   if (!message.uuid) return;
      //   wss.clients.forEach(function each(client) {
      //     if (client !== ws && client.readyState === ws.OPEN) {
      //       client.send(
      //         JSON.stringify({
      //           type: "pCam",
      //           uuid: message.uuid,
      //           data: message.data,
      //         })
      //       );
      //     }
      //   });
      // }
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
