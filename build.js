const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

execSync("npx webpack --mode production -c webpack.config.js", {
  stdio: "inherit",
});

const srcPath = path.join(__dirname, "client", "index.html");
let html = fs.readFileSync(srcPath, "utf-8");

html = html.replace(
  /<script\s+src="\/script\.js"(.*?)><\/script>/,
  '<script src="/webpack.bundle.js"$1></script>'
);

const distPath = path.join(__dirname, "dist", "index.html");
fs.writeFileSync(distPath, html);
