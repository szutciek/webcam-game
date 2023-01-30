const { randomUUID } = require("crypto");

const list = [];

for (let i = 0; i < 100; i++) {
  const obj = {
    x: -i * 100 + 20,
    y: 0,
    w: 100,
    h: 100,
  };
  if (i % 2) {
    obj.fc = "gray";
  } else {
    obj.fc = "white";
  }
  list.push([randomUUID(), obj]);
}

list.push([
  randomUUID(),
  {
    x: 20,
    y: 600,
    w: 200,
    h: 10,
    fc: "gold",
  },
]);

module.exports = list;
