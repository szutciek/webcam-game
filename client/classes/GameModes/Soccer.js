export default class Soccer {
  #ws = undefined;

  lastBallPosition = {
    x: -15,
    y: -15,
  };

  constructor(controller, ws) {
    this.controller = controller;
    this.#ws = ws;

    this.createElement();
  }

  createElement() {
    this.element = document.getElementById("soccer");
    const score = document.createElement("div");
    score.classList.add("score");

    this.homeElement = document.createElement("p");
    this.homeElement.classList.add("home");
    this.homeElement.innerText = 0;
    this.guestsElement = document.createElement("p");
    this.guestsElement.classList.add("guests");
    this.guestsElement.innerText = 0;

    score.insertAdjacentElement("beforeend", this.homeElement);
    score.insertAdjacentElement("beforeend", this.guestsElement);
    this.element.insertAdjacentElement("afterbegin", score);
  }

  updateScore(home, guests) {
    this.homeElement.innerText = home;
    this.guestsElement.innerText = guests;
  }

  handleMessage(message) {
    if (message.event === "goal") {
      this.controller.showMessage(message.message, "info", "normal");
      this.updateScore(message.score[0], message.score[1]);
    }
  }

  findBall() {
    this.controller.gameObjects.allObjects.forEach((e) => {
      if (e.class === "soccer_ball") {
        this.ball = e;
        this.ball.rotation = 0;
      }
    });
  }

  tick() {
    if (!this.ball) return this.findBall();

    const diffX = this.ball.x - this.lastBallPosition.x;
    const diffY = this.ball.y - this.lastBallPosition.y;
    const diff = Math.abs(diffX) + Math.abs(diffY);
    this.ball.rotation += (diff / 2) * Math.sign(diffX);

    this.lastBallPosition = { x: this.ball.x, y: this.ball.y };
  }
}
