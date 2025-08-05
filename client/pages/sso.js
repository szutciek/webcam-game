const url = window.location.href;
const urlObj = new URL(url);
let accessToken = urlObj.searchParams.get("access_token");
console.log(accessToken);
