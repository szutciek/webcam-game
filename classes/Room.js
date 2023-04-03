const UserError = require("../utils/UserError");
const clients = require("../state/clients");
const Player = require("./Player.js");
const { maxPlayersRoom, maxRenderDistance } = require("../config");
const Chunk = require("./Chunk");

module.exports = class Room {
  #clock = undefined;
  #includeCam = 0;
  #running = false;

  #players = new Map();

  // 1600px x 1600px
  chunks = new Map();

  lastTimeStamp = 0.015;
  syncStartTime = undefined;

  constructor(
    code,
    creatorId,
    maxPlayers = maxPlayersRoom,
    renderDistance = maxRenderDistance
  ) {
    this.code = code;
    this.creatorId = creatorId;
    this.maxPlayers = maxPlayers;
    this.renderDistance = renderDistance;

    this.createStartChunks(2);
  }

  stopGameClock() {
    this.#running = false;
    clearInterval(this.#clock);
  }

  startGameClock() {
    this.syncStartTime = performance.timeOrigin;
    this.#running = true;
    this.#clock = setInterval(() => {
      if (this.#players.size === 0) this.stopGameClock();
      this.gameTick();
    }, 1000 / 60);
    console.log(`Starting game in room ${this.code}.`);
    this.#players.forEach((p) => this.sendRoomInfo(p.uuid));
  }

  gameTick() {
    const secondsPassed = (performance.now() - this.lastTimeStamp) / 1000;
    const currentTime = Math.round(performance.now() * 1000) / 1000;

    if (this.#players.size === 0) {
      console.log(`Room ${this.code} is empty. Pausing game.`);
      this.stopGameClock();
    }

    // do all kinds of calculations
    this.#players.forEach((player) => {
      const correction = player.correctMovement(secondsPassed, currentTime);
      if (correction !== undefined)
        clients.find(player.uuid).sendTo({
          type: "movovd",
          position: correction,
        });
    });

    // collect all data
    let list = [];
    if (this.#includeCam % 3 === 0) {
      list = this.getAllPlayersQuickData(true);

      this.#includeCam = 0;
    } else {
      list = this.getAllPlayersQuickData(false);
    }
    this.#includeCam++;

    // broadcast the data to clients
    this.broadcast({
      type: "pinfo",
      data: list,
    });

    this.lastTimeStamp = performance.now();
  }

  getAllPlayersQuickData(camera) {
    const data = [];
    this.#players.forEach((p) => {
      data.push(p.quickData(camera));
    });
    return data;
  }

  createStartChunks(num) {
    const numPx = num * 1600;
    for (let x = -numPx; x <= numPx; x += 1600) {
      this.chunks.set(x, new Map());
      for (let y = -numPx; y <= numPx; y += 1600) {
        this.chunks.get(x).set(y, new Chunk(x, y));
      }
    }
  }

  addObject(coords, texture, ignore) {
    if (coords.x === undefined || coords.y === undefined) return;
    const chunk = this.getChunk(coords.x, coords.y);
    if (!chunk)
      this.addChunk(this.identifyChunk(coords.x), this.identifyChunk(coords.y));
    this.findChunk(
      this.identifyChunk(coords.x),
      this.identifyChunk(coords.y)
    ).createObject(coords, texture, ignore);
  }

  getChunk(xI, yI) {
    // find the chunk
    if (xI === undefined || yI === undefined) return;
    const x = this.identifyChunk(xI);
    if (!this.chunks.has(x)) this.chunks.set(x, new Map());
    const row = this.chunks.get(x);
    const y = this.identifyChunk(yI);
    const chunk = row.get(y);
    if (!chunk) row.set(y, new Chunk(x, y));
    return chunk;
  }

  updateObject(coords, texture) {
    const chunk = this.getChunk(coords.x, coords.y);
    if (!chunk) return;
    chunk.findUpdateObject({ x: coords.x, y: coords.y }, texture);
  }

  identifyChunk(val) {
    if (typeof val !== "number") return NaN;
    // takes the value and finds closest smallest multiple of 1600
    if (val >= 0) return val - (val % 1600);
    if (val < 0) {
      let i = 0;
      while (true) {
        if (i < val) break;
        i -= 1600;
      }
      return i;
    }
  }

  addChunk(x, y) {
    if (!x || !y) return;
    if (!this.checkIfAvalibleChunk(x, y)) return;
    // if row missing, add
    if (!this.chunks.has(x)) this.chunks.set(x, new Map());
    this.chunks.get(x).set(y, new Chunk());
  }

  checkIfMultiple(num) {
    if (typeof num !== "number") return false;
    if (num % 1600) return false;
    return true;
  }

  checkIfAvalibleChunk(x, y) {
    if (!this.checkIfMultiple(x) || !this.checkIfMultiple(y)) return;
    const row = this.chunks.get(x);
    if (!row) return true;
    // might not work
    const chunk = row.get(y);
    if (!chunk) return true;
    return false;
  }

  findChunk(x, y) {
    const row = this.chunks.get(x);
    if (!row) return undefined;
    return row.get(y);
  }

  checkSpaceAvalible() {
    if (this.#players.size >= this.maxPlayers) return false;
    return true;
  }

  joinRoom(uuid, startPos, username = "Anonymous") {
    if (!this.#running) this.startGameClock();

    this.#players.set(uuid, new Player(uuid, startPos, username));

    this.sendRoomInfo(uuid);
    this.broadcast({
      type: "event",
      event: `${username} joined the room`,
      icon: "userJoin",
      classification: "normal",
    });
  }

  leaveRoom(uuid) {
    const player = this.#players.get(uuid);
    this.#players.delete(uuid);
    this.broadcast({
      type: "event",
      event: `${player?.username} left the room`,
      icon: "userLeave",
      classification: "warning",
    });
  }

  sendRoomInfo(uuid) {
    clients.find(uuid).sendTo({
      type: "roominfo",
      syncStartTime: this.syncStartTime,
    });
  }

  getPlayer(uuid) {
    return this.#players.get(uuid);
  }

  updatePlayerState(uuid, data) {
    const player = this.getPlayer(uuid);
    if (!player) return;
    player.addClientTick(data);
    this.sendChunks(player);
  }

  updatePlayerCamera(uuid, camera) {
    const player = this.getPlayer(uuid);
    if (!player) return;
    player.camera = camera;
    this.#players.set(uuid, player);
  }

  sendChunks(player) {
    const chunkX = this.identifyChunk(player.x);
    const chunkY = this.identifyChunk(player.y);

    const chunkLeft = chunkX - (1600 * maxRenderDistance) / 2;
    const chunkRight = chunkX + (1600 * maxRenderDistance) / 2;

    const chunkTop = chunkY - (1600 * maxRenderDistance) / 2;
    const chunkBottom = chunkY + (1600 * maxRenderDistance) / 2;

    const list = [];

    for (let x = chunkLeft; x <= chunkRight; x += 1600) {
      for (let y = chunkTop; y <= chunkBottom; y += 1600) {
        const chunk = this.findChunk(x, y);
        if (!chunk) continue;
        if (chunk.gameObjects.size === 0) continue;
        // console.log(player);
        if (player.updatedChunks.get(`${x}:${y}`) >= chunk.lastUpdate) continue;
        player.updatedChunks.set(`${x}:${y}`, Date.now());
        list.push(...chunk.gameObjects.values());
      }
    }

    if (list.length === 0) return;

    // message containing multiple objects - mobj
    const message = {
      type: "mobj",
      data: list,
    };

    clients.find(player.uuid).sendTo(message);
  }

  inside(uuid) {
    return this.#players.has(uuid);
  }

  broadcast(message, uuid) {
    for (const [id, client] of clients.allClients()) {
      if (client.room === this.code) {
        if (id !== uuid) {
          client.sendTo(message);
        }
      }
    }
  }

  get size() {
    return this.#players.size;
  }

  get isEmpty() {
    if (this.#players.size <= 0) return true;
  }
};
