export default class Open {
  #ws = undefined;

  constructor(controller, ws) {
    this.controller = controller;
    this.#ws = ws;
  }

  tick() {}
}
