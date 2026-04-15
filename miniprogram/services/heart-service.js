const { callCloud } = require("./cloud-service");

async function checkHearts() {
  return callCloud("heartManager", { action: "check" });
}

async function consumeHeart() {
  return callCloud("heartManager", { action: "consume" });
}

async function rewardShareHearts(source) {
  return callCloud("heartManager", {
    action: "reward",
    source
  });
}

module.exports = {
  checkHearts,
  consumeHeart,
  rewardShareHearts
};
