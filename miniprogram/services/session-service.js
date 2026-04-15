const { getChatEngine } = require("./chat-engine/index");
const { callCloud } = require("./cloud-service");

function createMockSession(scriptId) {
  return getChatEngine().createSession(scriptId);
}

async function createSession(scenarioId) {
  const data = await callCloud("createSession", {
    scenario_id: scenarioId
  });
  return data ? data._id : "";
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

async function syncSession(sessionId, payload) {
  return callCloud("syncSession", {
    session_id: sessionId,
    messages: (payload.messages || []).map((item) => ({
      role: item.role,
      name: item.name || "",
      content: item.text || item.content || "",
      timestamp: item.timestamp || Date.now()
    })),
    current_mood: payload.currentMood || "",
    current_favorability: Number(payload.currentFavorability || 0)
  });
}

async function saveEnding(payload) {
  return callCloud("saveEnding", {
    session_id: payload.sessionId,
    scenario_id: payload.scenarioId,
    ending_id: payload.endingId,
    ending_type: payload.endingType,
    ending_label: payload.endingLabel,
    badge_label: payload.badgeLabel,
    ending_text: payload.endingText
  });
}

module.exports = {
  createSession,
  createMockSession,
  getCurrentTurn,
  selectIntent,
  resetIntentSelection,
  selectReply,
  clearDraft,
  updateComposer,
  submitReply,
  finishSession,
  getRecoverableSessionId,
  syncSession,
  saveEnding
};
