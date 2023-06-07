export default class MenuController {
  maps = [];

  constructor(controller) {
    this.clientController = controller;

    this.menuElement = document.getElementById("menuScreen");

    this.getMaps().then((maps) => {
      this.maps = maps;
      this.populateMapsMenu();
    });
  }

  async getMaps() {
    const response = await fetch("/api/maps");
    if (response.status !== 200) return;
    const maps = await response.json();
    if (maps.data) {
      return maps.data;
    } else {
      return [];
    }
  }

  populateMapsMenu() {
    const mapArea = this.menuElement.querySelector(".mapSelection");

    this.maps.forEach((map) => {
      const container = document.createElement("div");
      container.classList.add("mapOption");
      container.style.backgroundImage = `url(${map.preview})`;

      const name = document.createElement("h1");
      name.innerText = map.displayName;

      container.insertAdjacentElement("afterbegin", name);
      mapArea.insertAdjacentElement("beforeend", container);
    });
  }

  handleClick(e) {
    console.log(e.target);
  }
}
