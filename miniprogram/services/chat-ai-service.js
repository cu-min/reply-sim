const { callCloud } = require("./cloud-service");

async function generateStrategies(sessionId) {
  return callCloud("chatEngine", {
    action: "generateStrategies",
    session_id: sessionId
  });
}

async function generateReplies(sessionId, strategy) {
  return callCloud("chatEngine", {
    action: "generateReplies",
    session_id: sessionId,
    strategy
  });
}

async function generateResponse(sessionId, userMessage) {
  return callCloud("chatEngine", {
    action: "generateResponse",
    session_id: sessionId,
    user_message: userMessage
  });
}

module.exports = {
  generateStrategies,
  generateReplies,
  generateResponse
};
