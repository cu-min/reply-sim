const { callCloud } = require("./cloud-service");

function normalizeStrategy(item, index) {
  return {
    id: item.id || "strategy-" + (index + 1),
    label: item.label || "",
    description: item.description || ""
  };
}

function normalizeReply(item, strategyId, index) {
  return {
    id: item.id || strategyId + "-reply-" + (index + 1),
    label: item.label || item.style_label || "",
    tone: item.tone || item.style_description || "",
    text: item.text || item.content || ""
  };
}

function normalizeEnding(ending) {
  if (!ending) {
    return null;
  }

  return {
    id: ending.id || "",
    type: ending.type || "unknown",
    label: ending.label || "",
    badge_label: ending.badge_label || ending.label || ending.type || "",
    relationship_result: ending.relationship_result || "",
    key_behavior_feedback: ending.key_behavior_feedback || "",
    missed_branch_hint: ending.missed_branch_hint || "",
    literary_closing: ending.literary_closing || ""
  };
}

function normalizeResponse(data) {
  const result = data || {};

  return {
    reply_messages: Array.isArray(result.reply_messages) ? result.reply_messages : [],
    mood_update: result.mood_update || "",
    favorability_change: typeof result.favorability_change === "number" ? result.favorability_change : 0,
    new_favorability: typeof result.new_favorability === "number" ? result.new_favorability : 0,
    emotion_hint: result.emotion_hint || "",
    should_end: Boolean(result.should_end && result.ending),
    ending: normalizeEnding(result.ending)
  };
}

async function generateStrategies(sessionId) {
  const data = await callCloud("chatEngine", {
    action: "generateStrategies",
    session_id: sessionId
  });

  return {
    strategies: ((data && data.strategies) || []).map(normalizeStrategy)
  };
}

async function generateReplies(sessionId, strategy) {
  const normalizedStrategy = normalizeStrategy(strategy || {}, 0);
  const data = await callCloud("chatEngine", {
    action: "generateReplies",
    session_id: sessionId,
    strategy: normalizedStrategy
  });

  return {
    replies: ((data && data.replies) || []).map((item, index) =>
      normalizeReply(item, normalizedStrategy.id || "strategy", index)
    )
  };
}

async function generateResponse(sessionId, userMessage, requestId) {
  const data = await callCloud("chatEngine", {
    action: "generateResponse",
    session_id: sessionId,
    user_message: userMessage,
    request_id: requestId
  });

  return normalizeResponse(data);
}

module.exports = {
  generateStrategies,
  generateReplies,
  generateResponse
};
