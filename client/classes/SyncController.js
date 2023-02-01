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
}
