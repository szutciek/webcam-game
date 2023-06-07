export default class MenuController {
  maps = [];
  publicRooms = [];

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

  async getPublicRooms() {
    const response = await fetch("/api/rooms");
    if (response.status !== 200) return [];
    const rooms = await response.json();
    if (rooms.data) {
      return rooms.data;
    } else {
      return [];
    }
  }

  displayPublicRooms() {
    const roomsArea = this.menuElement.querySelector(".roomSelection");
    roomsArea.innerHTML = "";

    this.publicRooms.forEach((room) => {
      if (room.code === this.clientController.room) return;

      const container = document.createElement("div");
      container.classList.add("roomOption");
      container.dataset.code = room.code;

      const code = document.createElement("h1");
      code.innerText = room.code;

      const creator = document.createElement("p");
      creator.innerText = `Host: ${room.creator}`;

      const secondary = document.createElement("p");
      secondary.innerText = `${room.players.length} online - playing ${room.gameMode} on map ${room.map}`;

      container.insertAdjacentElement("beforeend", code);
      container.insertAdjacentElement("beforeend", creator);
      container.insertAdjacentElement("beforeend", secondary);
      roomsArea.insertAdjacentElement("afterbegin", container);
    });
  }

  async getDisplayPublicRooms() {
    this.spinRefrashRoomIcon();
    const rooms = await this.getPublicRooms();
    this.publicRooms = rooms;
    this.displayPublicRooms();
  }

  populateMapsMenu() {
    const mapArea = this.menuElement.querySelector(".mapSelection");
    mapArea.innerHTML = "";

    this.maps.forEach((map) => {
      const container = document.createElement("div");
      container.classList.add("mapOption");
      container.style.backgroundImage = `url(${map.preview})`;
      container.dataset.map = map.name;

      const name = document.createElement("h1");
      name.innerText = map.displayName;

      const mode = document.createElement("p");
      mode.innerText = `${map.displayGameMode}`;

      container.insertAdjacentElement("afterbegin", name);
      container.insertAdjacentElement("beforeend", mode);
      mapArea.insertAdjacentElement("beforeend", container);
    });
  }

  createNewGame(map, roomCode) {
    window.location = `${window.location.origin}/?room=${roomCode}&map=${map}`;
  }

  handleClick(e) {
    if (e.target.closest(".mapSelection") !== null)
      return this.handleMapSelection(e);
    if (e.target.closest(".refreshRooms") !== null)
      return this.getDisplayPublicRooms();
    if (e.target.closest(".roomSelection") !== null)
      return this.handleRoomSelection(e);
  }

  handleMapSelection(e) {
    const option = e.target.closest(".mapOption");
    if (option !== null) {
      const map = option.dataset.map;
      if (map) {
        const roomCode = crypto.randomUUID().split("-")[0];
        this.createNewGame(map, roomCode);
      }
    }
  }
  handleRoomSelection(e) {
    const option = e.target.closest(".roomOption");
    if (option !== null) {
      const code = option.dataset.code;
      if (code) window.location = `${window.location.origin}/?room=${code}`;
    }
  }

  spinRefrashRoomIcon() {
    const animation = [
      {
        rotate: "0deg",
      },
      {
        rotate: "360deg",
      },
    ];

    this.menuElement
      .querySelector(".refreshRooms")
      .animate(animation, { duration: 400, easing: "ease-in-out" });
  }
}
