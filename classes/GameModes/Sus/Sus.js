const GameMode = require("../GameMode.js");

module.exports = class Sus extends GameMode {
  mode = "sus";

  #inRound = false;
  #currentRoundPlayers = new Map();
  #playerColors = new Map();
  #playerRoles = new Map();
  #deadPlayers = new Set();
  #waitingPlayers = new Map();
  // finish work - replace uuid with user._id to actually let user rejoin
  #rejoinRoundIds = new Set();

  killRange = 200;

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

  assignPlayerDetails() {
    this.#playerColors = new Map();
    this.#currentRoundPlayers.forEach((p) => {
      this.#playerColors.set(p.uuid, p.user.panelColor);
    });
    this.#playerRoles = new Map();
    const impostorIndex = Math.floor(
      Math.random() * this.#currentRoundPlayers.size
    );
    this.#currentRoundPlayers.values().forEach((p, i) => {
      this.#playerRoles.set(p.uuid, impostorIndex === i);
    });
  }

  handlePlayerAttack(attacker) {
    const playerIsImpostor = this.#playerRoles.get(attacker.uuid);
    if (!playerIsImpostor) return;
    const centerAttacker = [
      attacker.position.x + attacker.position.w / 2,
      attacker.position.y + attacker.position.h / 2,
    ];
    let victim = null;
    this.#currentRoundPlayers.values().forEach((p) => {
      if (victim !== null) return;
      if (p.uuid === attacker.uuid) return;
      const centerVictim = [
        p.position.x + p.position.w / 2,
        p.position.y + p.position.h / 2,
      ];
      const dX = centerAttacker[0] - centerVictim[0];
      const dY = centerAttacker[1] - centerVictim[1];
      const distance = dX * dX + dY * dY;
      if (distance < this.killRange * this.killRange) {
        victim = p;
      }
    });
    if (victim !== null) {
      this.killPlayer(attacker, victim);
    }
  }

  killPlayer(attacker, victim) {
    console.log(`${attacker.user.username} killed ${victim.user.username}`);
    this.#deadPlayers.add(victim.uuid);
  }

  broadcastPlayerColors() {
    const colors = {};
    this.#playerColors.entries().forEach(([uuid, col]) => (colors[uuid] = col));
    this.room.broadcast({
      type: "game",
      event: "playerColors",
      colors: colors,
    });
  }

  broadcastPlayerRoles() {
    this.#currentRoundPlayers.forEach((p) => {
      p.sendTo({
        event: "playerRole",
        isImpostor: this.#playerRoles.get(p.uuid),
      });
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

    this.assignPlayerDetails();
    this.broadcastPlayerColors();
    this.broadcastPlayerRoles();
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

    this.announceHost();
  }

  isHost(player) {
    return player.user._id === this.room.creatorId;
  }

  handleEvent(player, event) {
    console.log(player.user.username, event);
    if (event.startRound === true && this.isHost(player)) {
      this.startRound();
    }
    if (event.action === "kill") {
      this.handlePlayerAttack(player);
    }
  }

  tick(currentTime, syncTick) {
    // console.log(currentTime);
  }

  get info() {
    return {};
  }

  get spectatingPlayers() {
    return this.#deadPlayers;
  }
};
