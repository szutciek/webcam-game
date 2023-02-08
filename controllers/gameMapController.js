const { readFileSync, readdirSync } = require("fs");
const { rootDir } = require("../config");

exports.loadMap = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = readFileSync(rootDir + `/maps/${name}.json`, {
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

exports.findAvalibleMaps = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = readdirSync(rootDir + `/maps/`);
      if (!data) reject();
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
};
