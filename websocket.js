const { randomUUID } = require("crypto");
const { WebSocketServer: WSS, WebSocket: ws } = require("ws");
const UserError = require("./utils/UserError.js");
const handleSendError = require("./utils/handleSendError.js");
const { validateUUID } = require("./utils/validators");
const clients = require("./state/clients");
const {
  handleAuthClient,
  handleClientLeave,
} = require("./controllers/gameClientController");
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
      const message = JSON.parse(data);
      if (message.type === "authclient") {
        return await handleAuthClient(message, ws);
      }

      if (!message.uuid) throw new UserError("UUID required to sync");
      if (!ws.uuid) throw new UserError("UUID required to sync");
      if (ws.uuid !== message.uuid) throw new UserError("UUID is not the same");
      if (!validateUUID(message.uuid)) throw new UserError("UUID is not valid");
      if (!clients.find(message.uuid)) throw new UserError("Unknown UUID");

      if (message.type === "cam") {
        return handleSyncCam(message, ws, uuid);
      }

      const client = clients.find(message.uuid);

      if (message.type === "inf") {
        return handleSyncPosition(message, client, ws);
      }

      if (message.type === "roomjoin") {
        return handleRoomJoin(message, ws, client);
      }

      if (message.type === "roomleave") {
        return handleRoomLeave(message, ws, client);
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

      console.log(err);

      handleSendError(err, ws);
    }
  });

  ws.on("close", () => {
    handleClientLeave(ws.uuid, clients.find(ws.uuid));
  });
});
