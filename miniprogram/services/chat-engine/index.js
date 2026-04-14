const { mockChatEngine } = require("./mock-engine");

let activeEngine = mockChatEngine;

function getChatEngine() {
  return activeEngine;
}

function setChatEngine(engine) {
  activeEngine = engine;
}

module.exports = {
  getChatEngine,
  setChatEngine
};
