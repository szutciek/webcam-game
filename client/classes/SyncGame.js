import { wsURL } from "/config.js";
import gameObjects from "/gameObjects.js";
import player from "/player.js";

export default class SyncGame {
  baseUrl = wsURL;
  // add room support
  ws = new WebSocket(this.baseUrl);

  constructor(room) {
    this.room = room;

    this.startSync();
  }

  startSync() {
    this.ws.addEventListener("message", (m) => {
      const message = JSON.parse(m.data);
      if (message.type === "pPos") {
        const [id, x, y, w, h] = message.data;
        gameObjects.updatePlayer(id, { x, y, w, h, fc: "red" });
      }
      if (message.type === "pCam") {
        // console.log(message);
      }
      if (message.type === "obj") {
        gameObjects.allObjects = message.data;
      }
      if (message.type === "auth") {
        player.id = message.data.id;
      }
    });
  }
  stopSync() {
    this.ws.removeEventListener("message");
  }

  send(payload) {
    if (this.ws.readyState === WebSocket.OPEN) this.ws.send(payload);
  }

  syncPosition(x, y) {
    this.send(
      JSON.stringify({
        type: "pos",
        data: [player.id, player.x, player.y, player.w, player.h],
      })
    );
  }
  syncCamera(id, b64) {
    this.send(
      JSON.stringify({
        type: "cam",
        player: id,
        data: b64,
      })
    );
  }
}
