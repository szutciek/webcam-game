module.exports = class Client {
  #ws = undefined;

  constructor(ws) {
    this.#ws = ws;
  }
};
