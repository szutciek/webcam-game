const UserError = require("../utils/UserError");
const clients = require("../state/clients");
const Player = require("./Player.js");
const { maxPlayersRoom } = require("../config");
const Chunk = require("./Chunk");

module.exports = class Room {
  #players = new Map();

  // 1600px x 1600px
  chunks = [];

  constructor(code, creatorId, maxPlayers = maxPlayersRoom) {
    this.code = code;
    this.creatorId = creatorId;
    this.maxPlayers = maxPlayers;

    this.createStartChunks(2);
  }

  createStartChunks(num) {
    for (let x = 0; x <= num; x++) {
      for (let y = 0; y <= num; y++) {
        console.log(x, y);
      }
    }
  }

  checkIfChunkExists(quadrant, x, y) {
    for (const [key] of this.chunks[quadrant]) {
      if (key[0] === x && key[1] === y) return true;
    }
  }

  createChunk(quadrant, x, y) {
    if (!quadrant || x === undefined || y === undefined) return;
    if (this.checkIfChunkExists(quadrant, x, y)) return;
    this.chunks[quadrant].set([x, y], new Chunk(quadrant, x, y));
  }

  findChunkQuadrant(quadrant) {
    return this.chunks[quadrant];
  }

  findChunk(quadrant, x, y) {
    for (const [key, value] of this.chunks[quadrant]) {
      if (key[0] === x && key[1] === y) return value;
    }
    return undefined;
  }

  findChunksRow(quadrant, x) {
    const list = [];
    for (const [key, value] of this.chunks[quadrant]) {
      if (key[0] === x) list.push(value);
    }
    return list;
  }
  findChunksColumn(quadrant, y) {
    const list = [];
    for (const [key, value] of this.chunks[quadrant]) {
      if (key[1] === y) list.push(value);
    }
    return list;
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

  updatePlayerPosition(uuid, data) {
    const player = this.#players.get(uuid);
    if (!player) return;
    player.updatePosition(data.data);
  }

  updatePlayerCamera(uuid, data) {
    const player = this.#players.get(uuid);
    if (!player) return;
    player.camera = data;
    this.#players.set(uuid, player);
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
};
