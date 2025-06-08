import { wsURL } from "../config.js";
import Player from "./Player.js";
import GameObjects from "./GameObjects.js";
import GameController from "./GameController.js";

import Soccer from "./GameModes/Soccer/Soccer.js";
import Sus from "./GameModes/Sus/Sus.js";
import Open from "./GameModes/Open/Open.js";
import ShooterV1 from "./GameModes/ShooterV1/ShooterV1.js";
import MenuController from "./MenuController.js";

const gameModes = ["soccer", "open", "shooterV1", "sus"];

export default class ClientController {
  #ws = undefined;

  room = undefined;
  user = undefined;

  gameController = undefined;
  gameObjects = undefined;
  player = undefined;
  serverTimeOrigin = undefined;

  #ignoreGameInput = false;

  constructor(user, UIController) {
    if (!user) throw new Error("User required to run client");
    this.user = user;

    this.UIController = UIController;
    UIController.setClientController(this);

    this.createMenuController();
  }

  changeRoom(room, map) {
    if (!room) room = "default";
    console.log(`Changing room to ${room}`);
    this.room = room;
    this.roomMap = map;
    return true;
  }

  joinRoom() {
    if (this.gameModeController) {
      console.log("Cleaning up UI");
      this.gameModeController.cleanUpUI();
    }
    console.log(`Joining room ${this.room}`);
    if (!this.user.uuid || !this.room) return;
    this.#ws.send(
      JSON.stringify({
        type: "roomjoin",
        room: this.room,
        map: this?.roomMap,
      })
    );
  }

  connectServer() {
    return new Promise((resolve, reject) => {
      this.#ws = new WebSocket(wsURL);
      this.#ws.addEventListener("open", () => {
        resolve();
      });
      this.#ws.addEventListener("error", () => {
        console.log("Connection error");
        reject();
      });
    });
  }

  async connectClient() {
    try {
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

  changeGameMode(gameMode) {
    console.log(`Changing game mode to ${gameMode}`);
    if (!gameModes.includes(gameMode)) {
      this.UIController.showMessage(
        `Game mode "${gameMode}" not supported. Try shift + reload.`,
        "alert",
        "warning"
      );
    }

    if (gameMode === "soccer") {
      this.currentGameMode = "soccer";
      this.gameModeController = new Soccer(this, this.#ws);
    }
    if (gameMode === "shooterV1") {
      this.currentGameMode = "shooterV1";
      this.gameModeController = new ShooterV1(this, this.#ws);
    }
    if (gameMode === "sus") {
      this.currentGameMode = "sus";
      this.gameModeController = new Sus(this, this.#ws);
    }
    if (gameMode === "open") {
      this.currentGameMode = "open";
      this.gameModeController = new Open(this, this.#ws);
    }
  }

  updateRoomInfo(info) {
    if (info.syncStartTime) {
      this.setServerTimeOrigin(info.syncStartTime);
    }
    this.UIController.updateRoomInfo(info);

    if (info.game !== this.currentGameMode) {
      this.changeGameMode(info.game);
    }
  }

  startRender() {
    console.log("Creating Player & Game Controller");
    this.gameObjects = new GameObjects();
    this.gameController = new GameController(this, this.#ws);
    this.gameController.startGame();
  }

  stopRender() {
    console.log("Stopping & Removing Game Controller");
    if (this.gameController) this.gameController.stopGame();
    this.gameController = undefined;
    console.log("Removing Player");
    this.player = undefined;
  }

  setServerTimeOrigin(time) {
    this.serverTimeOrigin = time;
    if (this.gameController !== undefined) {
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
        } else {
          this.player.updatePose(player.pose);
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
      // this.UIController.showMessage(
      //   `Illegal movement, correction: [${
      //     Math.round(message.position.x * 10) / 10
      //   }, ${Math.round(message.position.y * 10) / 10}]`,
      //   "alert",
      //   "warning"
      // );
      return;
    }

    if (message.type === "event") {
      this.UIController.showMessage(
        message.event,
        message.icon,
        message.classification
      );
      return;
    }

    if (message.type === "chatmsg") {
      this.UIController.showMessage(
        `${this.user.uuid === message.uuid ? "You" : message.username}: ${
          message.message
        }`,
        "chat",
        "normal"
      );
      return;
    }

    if (message.type === "mobj") {
      this.gameObjects.updateObjects(message.data);
      return;
    }

    if (message.type === "game") {
      this.gameModeController.handleMessage(message);
      return;
    }

    if (message.type === "error") {
      if ([400, 401, 402, 403, 404].includes(message.code)) {
        const search = new URLSearchParams(document.location.search);
        const room = search.get("room");
        const map = search.get("map");
        window.location = `/signin?message=${message.message}${
          room ? `&room=${room}` : ""
        }${map ? `&map=${map}` : ""}`;
      } else {
        this.UIController.showMessage(message.message, "alert", "warning");
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
      this.UIController.showMessage(
        `Successfully joined room ${this.room}`,
        "info",
        "normal"
      );
      this.stopRender();
      this.player = new Player(
        [
          message?.data?.position[0],
          message?.data?.position[1],
          message?.data?.position[2],
          message?.data?.position[3],
        ],
        this.user.username,
        this.user.uuid
      );
      this.startRender();
      return;
    }

    if (message.type === "userdata") {
      this.updateUser(message.data);
      return;
    }

    if (message.type === "roominfo") {
      this.updateRoomInfo(message);
      if (this.gameModeController !== undefined) {
        this.gameModeController.handleMessage(message);
      }
      return;
    }

    if (message.type === "latwarn") {
      console.warn(`High latency: ${message.latency}`);
      this.UIController.showMessage(
        `High latency: ${Math.round(message.latency * 10) / 10}ms`,
        "info",
        "warning"
      );
      return;
    }

    if (message.type === "pong") {
      const ping = (performance.now() - message.time) / 2;
      this.UIController.showPing(ping);
      return;
    }
  }

  showMessage(message) {
    this.UIController.showMessage(message);
  }

  handleGameClick(e) {
    this.gameController.handleClick(e);
    this.gameModeController.handleClick(e);
  }

  handleGameMouseMove(e) {
    if (this.gameController === undefined) return;
    this.gameController.handleMouseMove(e);
    if (this.gameModeController === undefined) return;
    this.gameModeController.handleMouseMove(e);
  }

  createMenuController() {
    this.menuController = new MenuController(this);
  }

  drawItem(item) {
    this.gameController.drawItem(item);
  }

  set ignoreGameInput(value) {
    this.#ignoreGameInput = value;
    if (value === true) {
      this.player.deactivateMovement();
    }
    if (value === false) {
      this.player.activateMovement();
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

  get gC() {
    return this.gameController;
  }
}
