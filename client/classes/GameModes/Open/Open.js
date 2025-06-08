export default class Open {
  #ws = undefined;

  constructor(controller, ws) {
    this.controller = controller;
    this.#ws = ws;

    this.changeBackground();
  }

  changeBackground() {
    document.body.style.background = "#55a155";
  }

  handleMessage(message) {
    // console.table(message);
  }

  predictMovement(secondsPassed) {}

  handleClick(e) {
    // console.log(e);
  }

  handleMouseMove(e) {
    // console.log(e)
  }

  cleanUpUI() {}

  tick() {}
}
