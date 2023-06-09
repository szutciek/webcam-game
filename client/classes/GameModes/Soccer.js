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

  predictMovement(secondsPassed, milisecondsServerStart) {
    this.predictBallMovement(secondsPassed, milisecondsServerStart);
  }

  findBall() {
    this.controller.gameObjects.allObjects.forEach((e) => {
      if (e.class === "soccer_ball") {
        this.ball = e;
        this.ball.rotation = 0;
      }
    });
  }

  predictBallMovement(secondsPassed, milisecondsServerStart) {
    if (!this.ball) return;
    const [diffX, diffY] = this.calculateBallMovement();
    const timePassed = milisecondsServerStart - this.lastBallMove;

    const velY = diffY / timePassed;
    const velX = diffX / timePassed;

    this.ball.x += velX * secondsPassed * 600;
    this.ball.y += velY * secondsPassed * 600;

    this.ball.rotation += diffX * Math.sign(diffX);

    this.updateLastBallPosition(this.ball.x, this.ball.y);
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
    if (!this.ball) return this.findBall();

    const [diffX, diffY] = this.calculateBallMovement();
    const diff = Math.abs(diffX) + Math.abs(diffY);
    this.ball.rotation += (diff / 2) * Math.sign(diffX);

    this.updateLastBallPosition(this.ball.x, this.ball.y);

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
