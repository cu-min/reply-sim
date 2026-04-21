const { callCloud } = require("./cloud-service");

async function checkHearts() {
  return callCloud("heartManager", { action: "check" });
}

module.exports = {
  checkHearts
};
