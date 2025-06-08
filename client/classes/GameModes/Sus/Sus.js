export default class Sus {
  #ws = undefined;

  disablePlayerCollision = true;

  emergencyButtonVisible = false;
  killButtonVisible = false;
  reportButtonVisible = false;
  taskButtonVisible = false;

  constructor(controller, ws) {
    this.controller = controller;
    this.#ws = ws;

    this.changeBackground();
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
    actionUI.style.display = "grid";
    actionUI.addEventListener("click", (e) => {
      console.log(e.target.closest("button"));
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
  }
  hideKillButton() {
    this.killButtonVisible = false;
    const actionUI = document.getElementById("sus_actions");
    const element = actionUI.querySelector(".kill");
    element.classList.remove("active");
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
  }
  hideTaskButton() {
    this.taskButtonVisible = false;
    const actionUI = document.getElementById("sus_actions");
    const element = actionUI.querySelector(".task");
    element.classList.remove("active");
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
    if (message.event === "roundStart") {
      this.controller.showMessage(message.message, "info", "normal");
      this.clearHostStartUI();
      this.initializeTaskCompletionUI();
      this.initializeActionUI();
    }
    if (message.event === "roundEnd") {
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

  tick() {
    const objectsInRange = this.controller.gameObjects.allObjects.values();

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
  }
}
