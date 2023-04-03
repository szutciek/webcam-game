const userJoin =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M376,144c-3.92,52.87-44,96-88,96s-84.15-43.12-88-96c-4-55,35-96,88-96S380,90,376,144Z" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:28px"/><path d="M288,304c-87,0-175.3,48-191.64,138.6-2,10.92,4.21,21.4,15.65,21.4H464c11.44,0,17.62-10.48,15.65-21.4C463.3,352,375,304,288,304Z" style="fill:none;stroke-miterlimit:10;stroke-width:28px"/><line x1="88" y1="176" x2="88" y2="288" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:28px"/><line x1="144" y1="232" x2="32" y2="232" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:28px"/></svg>';
const userLeave =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M376,144c-3.92,52.87-44,96-88,96s-84.15-43.12-88-96c-4-55,35-96,88-96S380,90,376,144Z" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:28px"/><path d="M288,304c-87,0-175.3,48-191.64,138.6-2,10.92,4.21,21.4,15.65,21.4H464c11.44,0,17.62-10.48,15.65-21.4C463.3,352,375,304,288,304Z" style="fill:none;stroke-miterlimit:10;stroke-width:28px"/><line x1="144" y1="232" x2="32" y2="232" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:28px"/></svg>';
const info =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><polyline points="196 220 260 220 260 392" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:34px"/><line x1="187" y1="396" x2="325" y2="396" style="fill:none;stroke-linecap:round;stroke-miterlimit:10;stroke-width:34px"/><path style="fill:#fff" d="M256,160a32,32,0,1,1,32-32A32,32,0,0,1,256,160Z"/></svg>';
const alert =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256,80c-8.66,0-16.58,7.36-16,16l8,216a8,8,0,0,0,8,8h0a8,8,0,0,0,8-8l8-216C272.58,87.36,264.66,80,256,80Z" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:28px"/><circle cx="256" cy="416" r="16" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:28px"/></svg>';

export default class Message {
  messageField = document.getElementById("log");

  constructor(message, icon = "info", type = "normal") {
    this.message = message;
    this.icon = icon;
    this.type = type;
  }

  hide() {
    this.element.classList.add("expired");
    setTimeout(() => {
      this.element.remove();
    }, 500);
  }

  cancelHide() {
    clearTimeout(this.hideTimeout);
  }

  display() {
    this.element = document.createElement("div");
    this.element.classList.add("event");
    this.element.classList.add(this.type);

    switch (this.icon) {
      case "userJoin":
        this.element.innerHTML = userJoin;
        break;
      case "info":
        this.element.innerHTML = info;
        break;
      case "alert":
        this.element.innerHTML = alert;
        break;
      case "userLeave":
        this.element.innerHTML = userLeave;
        break;
      default:
        this.element.innerHTML = info;
        break;
    }

    const description = document.createElement("p");
    description.innerText = this.message;
    this.element.insertAdjacentElement("beforeend", description);

    this.messageField.insertAdjacentElement("beforeend", this.element);

    this.hideTimeout = setInterval(() => {
      this.hide();
    }, 3 * 1000);
  }
}
