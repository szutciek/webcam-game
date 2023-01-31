const UserError = require("../utils/UserError.js");

exports.handleSyncPosition = (data, ws) => {
  if (data.data.length !== 5)
    throw new UserError("Position data format invalid");

  broadcast({
    type: "pPos",
    data: message.data,
  });
};

const broadcast = (message) => {
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === ws.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};
