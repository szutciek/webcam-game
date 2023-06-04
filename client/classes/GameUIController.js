class GameUIController {
  constructor(UIController) {
    this.UIController = UIController;
  }

  addEventListeners() {
    document.addEventListener("click", (e) => this.clickFunction(e));
  }

  removeEventListeners() {
    document.removeEventListener("click", (e) => this.clickFunction(e));
  }

  clickFunction(e) {
    if (e.target.closest(".gameIgnoreClick") === null) {
      this.UIController.handleGameClick(e);
    }
  }
}

export default GameUIController;
