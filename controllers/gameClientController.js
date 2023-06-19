const jwt = require("jsonwebtoken");
const { validateId } = require("../utils/validators");
const UserError = require("../utils/UserError.js");
const clients = require("../state/clients");
const rooms = require("../state/rooms");
const Client = require("../classes/Client");
const Authentication = require("../classes/Authentication.js");
const { choose } = require("../utils/functions.js");

exports.handleAuthClient = async (data, ws) => {
  try {
    if (!data.token) throw new UserError("Error while decoding token", 400);

    const { _id } = Authentication.decodeToken(data.token);
    if (!_id) throw new UserError("Error while decoding token", 400);

    const user = await Authentication.findUserId(_id);
    if (!user) throw new UserError("Error while finding user", 404);

    if (clients.alreadyOnline(user._id))
      throw new UserError("User is already online", 403);

    const uuid = crypto.randomUUID();

    const client = new Client(uuid, user, ws);
    clients.addClient(client);
    ws.uuid = uuid;

    ws.send(
      JSON.stringify({
        type: "authclientOk",
        data: {
          uuid,
          ...choose(user, ["username", "email", "profile", "panelColor"]),
        },
      })
    );
  } catch (err) {
    throw err;
  }
};

exports.handleClientLeave = (uuid, client) => {
  client?.leaveRoom();
  clients.removeClient(uuid);
};
