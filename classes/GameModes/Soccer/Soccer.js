const GameMode = require("../GameMode.js");
const Ball = require("./Ball.js");

const lerp = (s, e, t) => {
  return (1 - t) * s + t * e;
};

module.exports = class Soccer extends GameMode {
  mode = "soccer";

  lastContact = undefined;
  score = [0, 0];

  ballVelocity = {
    x: 0,
    y: 0,
  };

  ballMass = 0.5;
  playerMass = 50;

  lastBallMove = 0;

  obstacles = [];
  horizontalWalls = [];
  verticalWalls = [];
  posts = [];
  goals = [];

  inGoal = false;
  goalArea = {
    y: -150,
    h: 350,
  };

  constructor(host, room) {
    super(host, room);

    this.spawnBall();

    setImmediate(() => {
      this.obstacles = this.getObstacles();
      this.sortObstacles();
    });
  }

  getObstacles() {
    const quadrants = [];
    quadrants.push(this.room.getChunk(-1, 1));
    quadrants.push(this.room.getChunk(1, 1));
    quadrants.push(this.room.getChunk(1, -1));
    quadrants.push(this.room.getChunk(-1, -1));
    const obstacles = [];
    quadrants.forEach((q) => {
      obstacles.push(...q.staticObjects.values());
    });
    return obstacles;
  }

  sortObstacles() {
    this.obstacles.forEach((o) => {
      if (!o.class) return;
      if (o.class === "soccer_wall_vert") {
        this.verticalWalls.push(o);
      }
      if (o.class === "soccer_wall_hor") {
        this.horizontalWalls.push(o);
      }
      if (o.class === "soccer_post") {
        this.posts.push(o);
      }
      if (o.class === "soccer_post") {
        this.posts.push(o);
      }
      if (o.class === "soccer_goal_0") {
        this.goals.push(o);
      }
      if (o.class === "soccer_goal_1") {
        this.goals.push(o);
      }
    });
  }

  spawnBall() {
    try {
      // this.ball = this.room.addSpecialObject(
      //   { x: -30, y: -30, r: 30 },
      //   { type: "graphic", value: "https://assets.kanapka.eu/images/ball.png" },
      //   {
      //     shape: "circ",
      //     dynamic: true,
      //     colliding: false,
      //     class: "soccer_ball",
      //   }
      // );

      this.ball = new Ball(
        { x: -30, y: -30, r: 30 },
        { x: 0, y: 0 },
        { type: "graphic", value: "https://assets.kanapka.eu/images/ball.png" }
      );
    } catch (err) {
      throw err;
    }
  }

  tick(currentTime, syncTick) {
    this.room.players.forEach((p) => {
      this.ball.impact(p.position, p.velocities, p.uuid);
    });

    this.controlBallPosition();

    const timeBetween = currentTime - this.lastBallMove;

    const newX = this.ball.x + (this.ball.velocity.x * timeBetween) / 1000;
    const newY = this.ball.y + (this.ball.velocity.y * timeBetween) / 1000;

    this.ball.slowDown();

    this.ball.x = newX;
    this.ball.y = newY;
    this.lastBallMove = currentTime;

    if (syncTick === true) this.sendBallPosition();
  }

  handleGoal(goalNr) {
    let player;
    this.room.players.forEach((p) => {
      if (p.uuid === this.lastContact) player = p.username;
    });
    if (!player) {
      player = "Anonymous";
    } else {
      // update Players statistics
    }

    this.inGoal = true;
    this.score[goalNr]++;
    setTimeout(() => {
      this.ball.reset();
      this.inGoal = false;
    }, 1000);
    this.room.broadcast({
      type: "game",
      event: "goal",
      message: `${player} scored a goal! ${this.score[0]}:${this.score[1]}`,
      score: this.score,
    });
  }

  controlBallPosition() {
    this.horizontalWalls.forEach((wall) => {
      if (this.inGoal === true) return;
      if (wall.y < 0) {
        if (this.ball.y < wall.y + wall.h) {
          this.ball.velocity.y = Math.abs(this.ball.velocity.y);
        }
      } else {
        if (this.ball.y + this.ball.r * 2 > wall.y) {
          this.ball.velocity.y = -Math.abs(this.ball.velocity.y);
        }
      }
    });

    this.verticalWalls.forEach((wall) => {
      if (this.inGoal === true) return;
      if (
        this.ball.y < this.goalArea.y ||
        this.ball.y + this.ball.r * 2 > this.goalArea.y + this.goalArea.h
      ) {
        if (wall.x < 0) {
          if (this.ball.x < wall.x + wall.w) {
            this.ball.velocity.x = Math.abs(this.ball.velocity.x);
          }
        } else {
          if (this.ball.x + this.ball.r * 2 > wall.x) {
            this.ball.velocity.x = -Math.abs(this.ball.velocity.x);
          }
        }
      }
    });

    this.goals.forEach((goal) => {
      if (this.inGoal === true) return;
      if (goal.class === "soccer_goal_0") {
        if (this.ball.x + this.ball.r * 2 < goal.x + goal.w) {
          this.handleGoal(1);
        }
      }
      if (goal.class === "soccer_goal_1") {
        if (this.ball.x > goal.x) {
          this.handleGoal(0);
        }
      }
    });
  }

  sendBallPosition() {
    this.room.broadcast({
      type: "game",
      subType: "ball",
      data: {
        x: this.ball.x,
        y: this.ball.y,
        r: this.ball.r,
        velX: this.ball.velocity.x,
        velY: this.ball.velocity.y,
      },
    });
  }

  handleEvent(player, data) {}

  get info() {
    return {
      score: this.score,
    };
  }
};
