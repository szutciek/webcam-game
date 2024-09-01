const { WebSocketServer: WSS } = require("ws");
const UserError = require("./utils/UserError.js");
const handleSendError = require("./utils/handleSendError.js");
const clients = require("./state/clients");
const {
  handleAuthClient,
  handleClientLeave,
} = require("./controllers/gameClientController");
const {
  handleSyncMovement,
  handleSyncCam,
  handleSyncAud,
  handleGameEvent,
  handleChatMessage,
} = require("./controllers/gameSyncController.js");
const { handleRoomJoin } = require("./controllers/gameRoomController");
const { wsPort } = require("./config.js");

const wss = new WSS({ port: wsPort });

wss.on("connection", function connection(ws) {
  ws.on("message", async function message(data) {
    try {
      const message = JSON.parse(data);
      if (message.type === "authclient") {
        return await handleAuthClient(message, ws);
      }

      if (!ws.uuid) throw new UserError("UUID required to sync");
      message.uuid = ws.uuid;

      const client = clients.find(ws.uuid);
      if (!client) throw new UserError("Unknown UUID");

      if (message.type === "ping") {
        return ws.send(JSON.stringify({ type: "pong", time: message.time }));
      }

      if (message.type === "mov") {
        return handleSyncMovement(message, client, ws);
      }

      if (message.type === "cam") {
        return handleSyncCam(message, client, ws);
      }

      if (message.type === "aud") {
        return handleSyncAud(message, client, ws);
      }

      if (message.type === "gameevt") {
        return handleGameEvent(message, client);
      }

      if (message.type === "chatmsg") {
        return handleChatMessage(message, client);
      }

      if (message.type === "roomjoin") {
        return await handleRoomJoin(message, ws, client);
      }

      if (message.type === "roomleave") {
        return handleRoomLeave(ws, client);
      }
    } catch (err) {
      if (err.name === "JsonWebTokenError")
        err = new UserError("Error while decoding token", 400);
      if (err.name === "TokenExpiredError")
        err = new UserError("Token expired. Log in again", 401);

      handleSendError(err, ws);
    }
  });

  ws.on("close", () => {
    handleClientLeave(ws.uuid, clients.find(ws.uuid));
  });

  ws.on("error", () => {
    handleClientLeave(ws.uuid, clients.find(ws.uuid));
  });
});
