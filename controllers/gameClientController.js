const jwt = require("jsonwebtoken");
const { validateId } = require("../utils/validators");
const UserError = require("../utils/UserError.js");
const clients = require("../state/clients");
const rooms = require("../state/rooms");
const Client = require("../classes/Client");
const Authentication = require("../classes/Authentication.js");
const {
  isKanapkaSSOToken,
  verifyToken,
} = require("../utils/KanapkaSSO.common.js");
const { choose } = require("../utils/functions.js");

exports.handleAuthClient = async (data, ws) => {
  try {
    if (!data.token) throw new UserError("Error while decoding token", 400);

    const isSSO = isKanapkaSSOToken(data.token);

    if (isSSO) {
      await handleAuthClientSSO(data, ws);
    } else {
      await handleAuthClientClassic(data, ws);
    }
  } catch (err) {
    throw err;
  }
};

exports.handleClientLeave = (uuid, client) => {
  client?.leaveRoom();
  clients.removeClient(uuid);
};

const handleAuthClientClassic = async (data, ws) => {
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
};

const handleAuthClientSSO = async (data, ws) => {
  const payload = verifyToken(data.token);

  if (payload.client_id !== "wcgame") {
    throw new UserError("Token not issued for this client", 400);
  }

  const uuid = crypto.randomUUID();

  const fakeUser = {
    _id: payload.user.uuid,
    username: payload.user.username,
    email: payload.user?.email ? payload.user.email : "not_provided",
    profile: payload.user.profile,
    panelColor: "#ec7837",
  };

  const client = new Client(uuid, fakeUser, ws);
  clients.addClient(client);
  ws.uuid = uuid;

  ws.send(
    JSON.stringify({
      type: "authclientOk",
      data: {
        uuid,
        ...choose(fakeUser, ["username", "email", "profile", "panelColor"]),
      },
    })
  );
};
