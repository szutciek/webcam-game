import Ball from "./Ball.js";

export default class Soccer {
  #ws = undefined;

  lastBallPosition = {
    x: -15,
    y: -15,
  };

  previousVelocities = {
    x: 0,
    y: 0,
  };
  lastBallMove = 0;

  constructor(controller, ws) {
    this.controller = controller;
    this.#ws = ws;

    this.initializeMap();
    this.createElement();
    this.createBall();
  }

  initializeMap() {
    const mapDiv = document.getElementById("mapDiv");
    mapDiv.innerHTML = `<div class="map"><div id="soccerBallPosition"><div class="arrow"></div></div></div>`;
    this.soccerBallPosition = document.getElementById("soccerBallPosition");
  }

  createElement() {
    this.element = document.getElementById("soccer");
    this.element.innerHTML = "";
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

  createBall() {
    this.ball = new Ball(this, { x: -30, y: -30, r: 30 });
  }

  cleanUpUI() {
    this.element.innerHTML = "";
    const mapDiv = document.getElementById("mapDiv");
    mapDiv.innerHTML = "";
  }

  updateScore(home, guests) {
    this.homeElement.innerText = home;
    this.guestsElement.innerText = guests;
  }

  handleMessage(message) {
    if (message.subType === "ball") {
      this.handleBallUpdate(message.data);
    }
    if (message.event === "goal") {
      this.controller.showMessage(message.message, "info", "normal");
      this.updateScore(message.score[0], message.score[1]);
    }
    if (message.type === "roominfo") {
      if (message.gameInfo.score) {
        this.updateScore(message.gameInfo.score[0], message.gameInfo.score[1]);
      }
    }
  }

  handleBallUpdate(data) {
    this.lastServerBallMove = performance.now();
    this.ball.x = data.x;
    this.ball.y = data.y;
    this.ball.r = data.r;
    this.ball.velocities.x = data.velX;
    this.ball.velocities.y = data.velY;
  }

  predictMovement(secondsPassed, milisecondsServerStart) {
    this.ball.predictMovement(secondsPassed, milisecondsServerStart);
  }

  calculateBallMovement() {
    return [
      this.ball.x - this.lastBallPosition.x,
      this.ball.y - this.lastBallPosition.y,
    ];
  }

  updateLastBallPosition(x, y) {
    this.lastBallPosition = { x, y };
    this.lastBallMove = this.controller.gameController.milisecondsServerStart;
  }

  handleClick(e) {
    // console.log(e);
  }

  handleMouseMove(e) {
    // console.log(e)
  }

  tick() {
    this.controller.drawItem(this.ball.renderInfo);

    const angle = Math.atan(
      (this.ball.y - this.controller.player.y) /
        (this.ball.x - this.controller.player.x)
    );

    const realAngle = 90 + (angle * 180) / Math.PI;

    if (this.ball.x - this.controller.player.x < 0) {
      this.soccerBallPosition.style.transform = `rotate(${180 + realAngle}deg)`;
    } else {
      this.soccerBallPosition.style.transform = `rotate(${realAngle}deg)`;
    }
  }
}
