const { readFileSync } = require("fs");

exports.loadMap = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = readFileSync(`./maps/${name}.json`, {
        encoding: "utf-8",
        flag: "r",
      });
      if (!data) reject();
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
};
