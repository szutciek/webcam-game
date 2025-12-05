import { generateColoredImage } from "../../../canvasMethods.js";

export default class Sus {
  #ws = undefined;

  playerModelTorsoSource = null;
  playerModelLegSource = null;
  playerModels = new Map();

  disablePlayerCollision = true;
  playerModel = "sus";

  emergencyButtonVisible = false;
  killButtonVisible = false;
  reportButtonVisible = false;
  taskButtonVisible = false;

  viewRadius = 400;
  isImpostor = null;
  killRange = 200;

  constructor(controller, ws) {
    this.controller = controller;
    this.#ws = ws;

    this.changeBackground();
    this.loadPlayerModel();
  }

  get drawSusPlayers() {
    return this.playerModel === "sus" && this.inRound === true;
  }

  get limitedView() {
    return this.inRound;
  }

  loadPlayerModel() {
    const imgTorso = new Image();
    imgTorso.src = "https://assets.kanapka.eu/images/susAlphaWCGame.png";
    imgTorso.crossOrigin = "Anonymous";
    imgTorso.onload = () => {
      this.playerModelTorsoSource = imgTorso;
    };
    const imgLeg = new Image();
    imgLeg.src = "https://assets.kanapka.eu/images/susLegAlphaWCGame.png";
    imgLeg.crossOrigin = "Anonymous";
    imgLeg.onload = () => {
      this.playerModelLegSource = imgLeg;
    };
  }

  getPlayerRendererData(player) {
    const data = this.playerModels.get(player.uuid);
    return data;
  }

  handlePlayerColors(colors) {
    Object.entries(colors).forEach(([uuid, color]) => {
      const imageTorso = generateColoredImage(
        { w: 100, h: 200 },
        this.playerModelTorsoSource,
        color
      );
      const imageLeg = generateColoredImage(
        { w: 60, h: 120 },
        this.playerModelLegSource,
        color
      );
      this.playerModels.set(uuid, {
        color: color,
        modelTorso: imageTorso,
        modelLeg: imageLeg,
      });
    });
  }

  handlePlayerRole(role) {
    this.isImpostor = role;
    if (this.isImpostor === true) {
      this.hideTaskButton(true);
    } else {
      this.hideKillButton(true);
    }
  }

  changeBackground() {
    document.body.style.background = "#333";
    document.body.style.backgroundImage =
      "url(https://assets.kanapka.eu/images/shipBackground.png)";
    document.body.style.backgroundSize = "100%";
    document.body.style.backgroundRepeat = "repeat";
  }

  initializeActionUI() {
    const actionUI = document.getElementById("sus_actions");
    actionUI.style.display = "flex";
    actionUI.addEventListener("click", (e) => {
      const action = e.target.closest(".action").dataset.action;
      if (action === "kill" && this.canKillAny) {
        this.sendData({ action: "kill" });
      }
      if (action === "emergency") {
        this.sendData({ action: "emergency" });
      }
      if (action === "report" && this.canReportAny) {
        this.sendData({ action: "report" });
      }
      if (action === "task") {
        // Display Task UI
      }
    });
  }

  clearActionUI() {
    const actionUI = document.getElementById("sus_actions");
    actionUI.style.display = "none";
  }

  showEmergencyButton() {
    this.emergencyButtonVisible = true;
    const actionUI = document.getElementById("sus_actions");
    const element = actionUI.querySelector(".emergency");
    element.classList.add("active");
  }
  hideEmergencyButton() {
    this.emergencyButtonVisible = false;
    const actionUI = document.getElementById("sus_actions");
    const element = actionUI.querySelector(".emergency");
    element.classList.remove("active");
  }

  showKillButton() {
    this.killButtonVisible = true;
    const actionUI = document.getElementById("sus_actions");
    const element = actionUI.querySelector(".kill");
    element.classList.add("active");
    element.style.display = "flex";
  }
  hideKillButton(completely = false) {
    this.killButtonVisible = false;
    const actionUI = document.getElementById("sus_actions");
    const element = actionUI.querySelector(".kill");
    element.classList.remove("active");
    if (completely === true) {
      element.style.display = "none";
    }
  }

  showReportButton() {
    this.reportButtonVisible = true;
    const actionUI = document.getElementById("sus_actions");
    const element = actionUI.querySelector(".report");
    element.classList.add("active");
  }
  hideReportButton() {
    this.reportButtonVisible = false;
    const actionUI = document.getElementById("sus_actions");
    const element = actionUI.querySelector(".report");
    element.classList.remove("active");
  }

  showTaskButton() {
    this.taskButtonVisible = true;
    const actionUI = document.getElementById("sus_actions");
    const element = actionUI.querySelector(".task");
    element.classList.add("active");
    element.style.display = "flex";
  }
  hideTaskButton(completely = false) {
    this.taskButtonVisible = false;
    const actionUI = document.getElementById("sus_actions");
    const element = actionUI.querySelector(".task");
    element.classList.remove("active");
    if (completely === true) {
      element.style.display = "none";
    }
  }

  initializeTaskCompletionUI() {
    const task_completion = document.getElementById("sus_task_completion");
    task_completion.innerHTML = "";
    const text = document.createElement("p");
    text.classList.add("text");
    text.innerText = "Task Completion Tracker";
    task_completion.appendChild(text);
    const bar = document.createElement("div");
    bar.classList.add("taskBar");
    const progress = document.createElement("div");
    progress.classList.add("progress");
    bar.appendChild(progress);
    task_completion.appendChild(bar);
  }

  clearTaskCompletionUI() {
    const task_completion = document.getElementById("sus_task_completion");
    task_completion.innerHTML = "";
  }

  initializeHostStartUI(nPlayers) {
    const host_start = document.getElementById("sus_host_start");
    host_start.innerHTML = "";
    const startRoundButton = document.createElement("button");
    startRoundButton.innerText = `START ROUND WITH ${nPlayers} PLAYERS`;
    host_start.insertAdjacentElement("afterbegin", startRoundButton);
    startRoundButton.addEventListener("click", () => {
      this.sendData({ startRound: true });
    });
  }

  clearHostStartUI() {
    const host_start = document.getElementById("sus_host_start");
    host_start.innerHTML = "";
  }

  sendData(payload) {
    payload.type = "game";
    this.#ws.send(
      JSON.stringify({
        type: "gameevt",
        event: payload,
      })
    );
  }

  handleMessage(message) {
    console.log(message);
    if (message.event === "announceHost" && message.isHost === true) {
      this.initializeHostStartUI(message.nWaiting);
    }
    if (message.event === "playerColors") {
      this.handlePlayerColors(message.colors);
    }
    if (message.event === "playerRole") {
      this.handlePlayerRole(message.isImpostor);
    }
    if (message.event === "roundStart") {
      this.inRound = true;
      this.controller.showMessage(message.message, "info", "normal");
      this.clearHostStartUI();
      this.initializeTaskCompletionUI();
      this.initializeActionUI();
    }
    if (message.event === "roundEnd") {
      this.inRound = false;
      this.controller.showMessage(message.message, "info", "normal");
      this.clearTaskCompletionUI();
    }
  }

  predictMovement(secondsPassed) {}

  handleClick(e) {
    // console.log(e);
  }

  handleMouseMove(e) {
    // console.log(e)
  }

  cleanUpUI() {
    this.clearHostStartUI();
    this.clearTaskCompletionUI();
    this.clearActionUI();
  }

  checkRectInRangeAnyCorner(rect, origin) {
    for (let i = rect.x; i <= rect.x + rect.w; i += rect.w) {
      for (let j = rect.y; j <= rect.y + rect.h; j += rect.h) {
        const dX = origin.x - i;
        const dY = origin.y - j;
        const distance = dX * dX + dY * dY;
        if (distance < origin.radius * origin.radius) {
          return true;
        }
      }
    }
    return false;
  }

  getClipPath() {
    const path = new Path2D();

    // restrict to view radius first
    path.arc(
      window.innerWidth / 2,
      window.innerHeight / 2,
      this.viewRadius,
      0,
      2 * Math.PI
    );

    // then check intersections with walls and items in range that are obstructing
    const cP = this.centerPlayerWorld;
    const allObjects = this.controller.gameObjects.allObjects.values();
    const objectsInRange = Array.from(allObjects).filter((o) => {
      switch (o.shape) {
        case "rect":
          // run check for all corners
          return this.checkRectInRangeAnyCorner(o, {
            x: cP[0],
            y: cP[1],
            radius: this.viewRadius,
          });
        case "circ":
          const cO = [o.x + o.w / 2, o.y + o.h / 2];
          const dX = cP[0] - cO[0];
          const dY = cP[1] - cO[1];
          const distance = dX * dX + dY * dY;
          return distance < this.viewRadius * this.viewRadius;
      }
    });
    const obstructingObjects = objectsInRange.filter((o) => o.colliding);

    obstructingObjects.forEach((o) => {
      switch (o.shape) {
        case "rect":
          // clip the area between extreme points of rectangle, reaching to the edge of the view zone.
          // if the rectangle is not fully in range, then calculate where it needs with the view circle.
          break;
        case "circ":
          console.warn("Obstructing circle not implemented yet in Sus.js");
          break;
      }
    });

    return path;
  }

  tick() {
    if (!this.inRound) return;

    const objectsInRange = this.controller.gameObjects.allObjects.values();
    const playersInRange = this.controller.gameObjects.allPlayers.values();

    // check if emergency button is in players range
    const emergencyButton = objectsInRange.find(
      (o) => o.class === "button_zone"
    );
    if (emergencyButton) {
      if (emergencyButton.collidingWithRectangle(this.controller.player)) {
        if (this.emergencyButtonVisible === false) {
          this.showEmergencyButton();
        }
      } else {
        if (this.emergencyButtonVisible === true) {
          this.hideEmergencyButton();
        }
      }
    }

    const centerPlayer = this.centerPlayerWorld;

    // check if any player in killing range if impostor
    if (this.isImpostor) {
      this.canKillAny = false;
      playersInRange.forEach((p) => {
        const centerTarget = [p.x + p.w / 2, p.y + p.h / 2];
        const dX = centerPlayer[0] - centerTarget[0];
        const dY = centerPlayer[1] - centerTarget[1];
        const distance = dX * dX + dY * dY;
        if (distance < this.killRange * this.killRange) {
          this.canKillAny = true;
        }
      });
      if (this.canKillAny) {
        this.showKillButton();
      } else {
        this.hideKillButton();
      }
    }
  }

  convertFromWorldToScreen(wX, wY) {
    const sX =
      wX -
      this.controller.player.position.x -
      this.controller.player.position.w / 2 +
      window.innerWidth / 2;
    const sY =
      wY -
      this.controller.player.position.y -
      this.controller.player.position.h / 2 +
      window.innerHeight / 2;
    return [sX, sY];
  }

  get centerPlayerWorld() {
    return [
      this.controller.player.position.x + this.controller.player.position.w / 2,
      this.controller.player.position.y + this.controller.player.position.h / 2,
    ];
  }
}
