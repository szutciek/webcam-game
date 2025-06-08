const GameMode = require("../GameMode.js");

module.exports = class Sus extends GameMode {
  mode = "sus";

  #inRound = false;
  #currentRoundPlayers = new Map();
  #playerColors = new Map();
  #waitingPlayers = new Map();
  // finish work - replace uuid with user._id to actually let user rejoin
  #rejoinRoundIds = new Set();

  constructor(host, room) {
    super(host, room);
  }

  playerJoin(player) {
    if (this.#inRound === false) {
      this.#currentRoundPlayers.set(player.uuid, player);
    } else {
      this.#waitingPlayers.set(player.uuid, player);
    }

    setTimeout(() => {
      this.announceHost();
    }, 1000);
  }

  playerLeave(player) {
    if (this.#currentRoundPlayers.has(player.uuid)) {
      this.#currentRoundPlayers.delete(player.uuid);
      if (this.#inRound === true) {
        this.#rejoinRoundIds.add(player.user._id);
      }
    }
    if (this.#waitingPlayers.has(player.uuid)) {
      this.#waitingPlayers.delete(player.uuid);
    }
  }

  assignPlayerColors() {
    this.#playerColors = new Map();
    this.#currentRoundPlayers.forEach((p) => {
      this.#playerColors.set(p.uuid, p.user.panelColor);
    });
  }

  broadcastPlayerColors() {
    const data = {};
    this.#playerColors
      .entries()
      .forEach(([uuid, color]) => (data[uuid] = color));
    this.room.broadcast({
      type: "game",
      event: "playerColors",
      colors: data,
    });
  }

  announceHost() {
    const host = this.#currentRoundPlayers.values().find((p) => this.isHost(p));
    if (!host) return;
    host.sendTo({
      event: "announceHost",
      isHost: true,
      inRound: this.#inRound,
      nWaiting: this.#currentRoundPlayers.size,
    });
  }

  startRound() {
    this.#inRound = true;

    this.room.broadcast({
      type: "game",
      event: "roundStart",
      message: `The round is starting with ${
        this.#currentRoundPlayers.size
      } players!`,
    });

    this.#currentRoundPlayers.values().forEach((p, i) => {
      p.teleport(-50, -300);
    });

    this.assignPlayerColors();
    this.broadcastPlayerColors();
  }

  endRound() {
    this.#inRound = false;
    this.#waitingPlayers.values().forEach((p) => {
      this.#waitingPlayers.delete(p.uuid);
      this.#currentRoundPlayers.set(p.uuid, p);
    });

    this.room.broadcast({
      type: "game",
      event: "roundEnd",
      message: `The round has ended!`,
    });

    setTimeout(() => {
      this.announceHost();
    }, 1000);
  }

  isHost(player) {
    return player.user._id === this.room.creatorId;
  }

  handleEvent(player, data) {
    console.log(player.user.username, data);
    if (data.startRound === true && this.isHost(player)) {
      this.startRound();
    }
  }

  tick(currentTime, syncTick) {
    // console.log(currentTime);
  }

  get info() {
    return {};
  }
};
