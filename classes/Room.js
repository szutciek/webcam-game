const UserError = require("../utils/UserError");
const clients = require("../state/clients");
const Player = require("./Player.js");
const { maxPlayersRoom, maxRenderDistance } = require("../config");
const Chunk = require("./Chunk");

module.exports = class Room {
  #players = new Map();

  // 1600px x 1600px
  chunks = new Map();

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

  joinRoom(uuid) {
    this.#players.set(uuid, new Player(uuid, { x: 0, y: 0, w: 100, h: 200 }));
  }

  leaveRoom(uuid) {
    this.#players.delete(uuid);
  }

  updatePlayerPosition(uuid, position) {
    const player = this.#players.get(uuid);
    if (!player) return;
    player.updatePosition(position);
    this.sendChunks(player);
  }
  updatePlayerPose(uuid, pose) {
    const player = this.#players.get(uuid);
    if (!player) return;
    player.updatePose(pose);
  }
  updatePlayerCamera(uuid, camera) {
    const player = this.#players.get(uuid);
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
