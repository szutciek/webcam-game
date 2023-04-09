const rooms = require("../state/rooms");
const UserError = require("../utils/UserError");
const { loadMap, findAvalibleMaps } = require("./gameMapController");

const GameMode = require("../classes/GameModes/GameMode.js");
const Soccer = require("../classes/GameModes/Soccer.js");
const Open = require("../classes/GameModes/Open.js");

exports.handleRoomJoin = async (message, ws, client) => {
  try {
    let room = rooms.find(message.room);

    if (!room) {
      const avalibleMaps = await findAvalibleMaps();

      let mapName;
      if (
        avalibleMaps.includes(`${message.map}.json`) &&
        message.room !== "default"
      ) {
        mapName = message.map;
      } else {
        mapName = "default";
      }

      room = rooms.addRoom(
        message.room || "default",
        mapName,
        client.user._id,
        20
      );

      const map = await loadMap(room.map);
      if (!map) throw new UserError("Map couldn't be loaded", 404);
      const data = JSON.parse(map);

      room.setSpawnPoints(data.spawnPoints);

      if (data.config.gameMode == undefined)
        throw new UserError("Map game mode not specified", 400);
      if (GameMode.avalibleGameModes.includes(data.config.gameMode)) {
        if (data.config.gameMode === "soccer") {
          room.changeGameMode(new Soccer(client.user._id, room));
        } else {
          room.changeGameMode(new Open(client.user._id, room));
        }
      }

      data.objects.forEach((obj) => {
        room.addObject(obj.coords, obj.texture, {
          colliding: obj.colliding,
          dynamic: obj.dynamic,
          shape: obj.shape,
        });
      });
    }

    if (!room.checkSpaceAvalible()) {
      throw new UserError(`Room ${message.room} is currently full`);
    }

    const startPos = room.determineStartPos();
    startPos.w = 100;
    startPos.h = 200;

    room.joinRoom(message.uuid, startPos, client.user.username);
    client.changeRoom(message.room);

    ws.send(
      JSON.stringify({
        type: "roomjoinOk",
        room: message.room,
        data: {
          position: [startPos.x, startPos.y, startPos.w, startPos.h],
        },
      })
    );
  } catch (err) {
    throw err;
  }
};

exports.handleRoomLeave = (message, ws, client) => {
  try {
    // leaves in room and client
    client.leaveRoom(message.room);

    ws?.send(
      JSON.stringify({
        type: "roomleaveOk",
        room: message.room,
      })
    );
  } catch (err) {
    throw err;
  }
};
