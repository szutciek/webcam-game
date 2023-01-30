import canvas from "/canvas.js";
import gameObjects from "/gameObjects.js";
import player from "/player.js";

canvas.resize();
window.addEventListener("resize", () => {
  canvas.resize();

  view.vw = window.innerWidth;
  view.vh = window.innerHeight;

  renderFrame();
});

const returnItemsFrame = (items, view) => {
  if (!(items instanceof Map)) return;

  const maxRight = view.x + view.vw;
  const maxBottom = view.y + view.vh;

  let list = [];
  items.forEach(
    (i) =>
      i.x < maxRight &&
      i.y < maxBottom &&
      i.x + i.w > view.x &&
      i.y + i.h > view.y &&
      list.push({
        x: i.x - view.x,
        y: i.y - view.y,
        w: i.w,
        h: i.h,
        fc: i.fc,
      })
  );
  return list;
};

const calcMovement = () => {
  // we doing velocity in px/frame
  view.y += view.velY;
  view.x += view.velX;
};

export const renderFrame = () => {
  //   calcMovement();
  //   const items = returnItemsFrame(gameState.allObjects, view);
  canvas.clear();
  //   items.forEach((i) => canvas.draw([i.x, i.y, i.w, i.h], i.fc));
  //   canvas.draw(player.box, "red");
};
