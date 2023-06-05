export default class Open {
  #ws = undefined;

  constructor(controller, ws) {
    this.controller = controller;
    this.#ws = ws;
  }

  handleMessage(message) {
    console.log(message);
  }

  predictMovement(secondsPassed) {}

  handleClick(e) {
    console.log(e);
  }

  tick() {}
}
