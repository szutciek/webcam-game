import { wsURL } from "/config.js";
import Player from "/classes/Player.js";
import GameObjects from "/classes/GameObjects.js";
import GameController from "/classes/GameController.js";
import UIController from "/classes/UIController.js";

export default class ClientController {
  #ws = undefined;

  room = undefined;
  user = undefined;

  gameController = undefined;
  gameObjects = undefined;
  player = undefined;
  serverTimeOrigin = undefined;

  constructor(user) {
    if (!user) throw new Error("User required to run client");
    this.user = user;
  }

  changeRoom(room, map) {
    if (!room) room = "default";
    console.log(`Changing room to ${room}`);
    this.room = room;
    // only for new rooms
    this.roomMap = map;
    // tell server about change
    return true;
  }

  joinRoom() {
    if (!this.user.uuid || !this.room) return;
    this.#ws.send(
      JSON.stringify({
        type: "roomjoin",
        uuid: this.user.uuid,
        room: this.room,
        map: this?.roomMap,
      })
    );
  }

  connectServer() {
    return new Promise((resolve, reject) => {
      this.#ws = new WebSocket(wsURL);
      this.#ws.addEventListener("open", () => {
        // remove event listeners
        resolve();
      });
      this.#ws.addEventListener("error", () => {
        // remove event listeners
        reject();
      });
    });
  }

  async startGame() {
    try {
      if (!this.room) return;
      console.log("Connecting to server...");
      await this.connectServer();
      console.log(`Successfully connected to ${wsURL}`);
      console.log(`Sending ${this.user.username}'s token to authenticate`);
      this.#ws.send(
        JSON.stringify({
          type: "authclient",
          token: this.user.token,
        })
      );
      this.startListen();
      await this.waitForUUID();
      console.log(`Joining room ${this.room}`);
      this.joinRoom();
    } catch (err) {
      console.log(err);
    }
  }

  updateUser(data) {
    Object.entries(data).forEach((e) => {
      this.user[e[0]] = e[1];
    });
    window.localStorage.setItem("user", JSON.stringify(this.user));
    // update stuff
  }

  startListen() {
    this.#ws.addEventListener("message", (message) => {
      this.handleMessage(message);
    });
    console.log("Listening to messages from the server...");
  }
  stopListen() {
    this.#ws.removeEventListener("message", (message) => {
      this.handleMessage(message);
    });
    console.log("No longer listening to server...");
  }

  updateRoomInfo(info) {
    if (info.syncStartTime) {
      this.setServerTimeOrigin(info.syncStartTime);
    }
    UIController.updateRoomInfo(info);
  }

  startRender() {
    this.gameObjects = new GameObjects();
    this.gameController = new GameController(
      this.player,
      this.#ws,
      this.user.uuid,
      this.gameObjects,
      this.serverTimeOrigin
    );
    this.gameController.startGame();
  }

  stopRender() {
    this.gameController = undefined;
    this.player = undefined;
  }

  setServerTimeOrigin(time) {
    if (!this.gameController) {
      this.serverTimeOrigin = time;
    } else {
      this.gameController.setServerTimeOrigin(time);
    }
  }

  sendChat(message) {
    this.sendJSON({
      type: "chatmsg",
      message,
    });
  }

  sendJSON(payload) {
    this.#ws.send(JSON.stringify(payload));
  }

  handleMessage(mes) {
    const message = JSON.parse(mes.data);
    if (message.type === "pinfo") {
      message.data.forEach((player) => {
        if (player.id !== this.user.uuid) {
          this.gameObjects.updatePlayer(player.id, player);
        }
      });
      return;
    }

    if (message.type === "movovd") {
      if (typeof message.position !== "object") return;
      this.player.serverOverride(message.position);
      console.warn(
        `Illegal movement, correction: [${message.position.x}, ${message.position.y}]`
      );
      UIController.showMessage(
        `Illegal movement, correction: [${
          Math.round(message.position.x * 10) / 10
        }, ${Math.round(message.position.y * 10) / 10}]`,
        "alert",
        "warning"
      );
    }
    if (message.type === "event") {
      UIController.showMessage(
        message.event,
        message.icon,
        message.classification
      );
    }
    if (message.type === "chatmsg") {
      UIController.showMessage(
        `${this.user.uuid === message.uuid ? "You" : message.username}: ${
          message.message
        }`,
        "chat",
        "normal"
      );
    }
    if (message.type === "mobj") {
      this.gameObjects.setObjects(message.data);
    }
    if (message.type === "error") {
      if ([401, 403].includes(message.code)) {
        window.location = `/signin?message=${message.message}`;
      }
      return;
    }
    if (message.type === "authclientOk") {
      this.user.uuid = message.data.uuid;
      this.updateUser(message.data);
      console.log(`User assigned UUID ${this.user.uuid}`);

      return;
    }
    if (message.type === "roomjoinOk") {
      console.log(`Successfully joined room ${this.room}`);
      UIController.showMessage(
        `Successfully joined room ${this.room}`,
        "info",
        "normal"
      );
      this.player = new Player([
        message?.data?.position[0],
        message?.data?.position[1],
        message?.data?.position[2],
        message?.data?.position[3],
      ]);
      this.startRender();
      return;
    }
    if (message.type === "userdata") {
      this.updateUser(message.data);
      return;
    }
    if (message.type === "roominfo") {
      this.updateRoomInfo(message);
    }
    if (message.type === "latwarn") {
      console.warn(`High latency: ${message.latency}`);
      UIController.showMessage(
        `High latency: ${Math.round(message.latency * 10) / 10}ms`,
        "info",
        "warning"
      );
    }

    if (message.type === "pong") {
      const ping = (performance.now() - message.time) / 2;
      UIController.showPing(ping);
    }
  }

  async waitForUUID() {
    return new Promise((resolve, reject) => {
      const checker = setInterval(() => {
        if (this.user.uuid) {
          clearInterval(checker);
          resolve();
        }
        // reject if some time passes
      }, 50);
    });
  }
}
