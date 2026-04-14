const { getChatEngine } = require("./chat-engine/index");

function createMockSession(scriptId) {
  return getChatEngine().createSession(scriptId);
}

function getCurrentTurn(sessionId) {
  return getChatEngine().getSessionView(sessionId);
}

function selectIntent(sessionId, intentId) {
  return getChatEngine().selectIntent(sessionId, intentId);
}

function resetIntentSelection(sessionId) {
  return getChatEngine().resetIntentSelection(sessionId);
}

function selectReply(sessionId, replyId) {
  return getChatEngine().selectReply(sessionId, replyId);
}

function clearDraft(sessionId) {
  return getChatEngine().clearDraft(sessionId);
}

function updateComposer(sessionId, text) {
  return getChatEngine().updateComposer(sessionId, text);
}

function submitReply(sessionId, payload) {
  return getChatEngine().submitReply(sessionId, payload);
}

function finishSession(sessionId) {
  return getChatEngine().finishSession(sessionId);
}

function getRecoverableSessionId(scriptId) {
  return getChatEngine().getRecoverableSessionId(scriptId);
}

module.exports = {
  createMockSession,
  getCurrentTurn,
  selectIntent,
  resetIntentSelection,
  selectReply,
  clearDraft,
  updateComposer,
  submitReply,
  finishSession,
  getRecoverableSessionId
};
