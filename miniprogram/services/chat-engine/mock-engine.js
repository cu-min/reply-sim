const { scenarioLibrary } = require("../../mock/content");
const { getEndingResult, getScriptDetail } = require("../script-service");
const {
  getActiveSessionMap,
  getCompletedHistory,
  saveActiveSessionMap,
  saveCompletedHistory
} = require("../../utils/storage");

function createSessionId(scriptId) {
  return scriptId + "-" + Date.now().toString(36);
}

function getScenario(scriptId) {
  return scenarioLibrary.find((item) => item.id === scriptId) || null;
}

function cloneMessage(turn) {
  return {
    id: turn.id + "-" + Date.now().toString(36),
    role: "assistant",
    text: turn.assistant_message,
    emotionHint: turn.emotion_hint || ""
  };
}

function formatPlayedAt(timestamp) {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return month + "-" + day + " " + hour + ":" + minute;
}

function getTurns(scriptId) {
  const scenario = getScenario(scriptId);
  return scenario ? scenario.turns : [];
}

function getSession(sessionId) {
  const sessions = getActiveSessionMap();
  return sessions[sessionId] || null;
}

function getIntentOptions(turn) {
  if (!turn || !turn.strategies) {
    return [];
  }

  return turn.strategies.map((item) => ({
    id: item.id,
    label: item.label,
    description: item.description
  }));
}

function getIntentOption(turn, intentId) {
  return getIntentOptions(turn).find((item) => item.id === intentId) || null;
}

function getReplyOptionsForIntent(turn, intentId) {
  if (!turn || !intentId || !turn.strategies) {
    return [];
  }

  const strategy = turn.strategies.find((item) => item.id === intentId);
  if (!strategy) {
    return [];
  }

  return strategy.replies.map((item) => ({
    id: item.id,
    label: item.style_label,
    text: item.content,
    tone: item.style_description
  }));
}

function saveSession(session) {
  const sessions = getActiveSessionMap();
  sessions[session.sessionId] = session;
  saveActiveSessionMap(sessions);
}

function buildSessionView(session) {
  const turns = getTurns(session.scriptId);
  const turn = turns[session.currentTurnIndex] || null;
  const replyOptions = turn ? getReplyOptionsForIntent(turn, session.selectedIntentId) : [];

  return {
    session,
    currentTurn: session.status === "active"
      ? {
          id: turn.id,
          intentOptions: getIntentOptions(turn)
        }
      : null,
    messages: session.messages,
    replyOptions,
    selectedIntentId: session.selectedIntentId,
    selectedReplyId: session.selectedReplyId,
    composerText: session.composerText,
    canFinish: session.status === "readyToFinish",
    endingPrompt: session.endingPrompt
  };
}

function saveHistoryRecord(session) {
  const detail = getScriptDetail(session.scriptId);
  const ending = getEndingResult(session.scriptId, session.endingId);
  const existing = getCompletedHistory();
  const alreadySaved = existing.some((item) => item.sessionId === session.sessionId);

  if (!alreadySaved && detail && ending) {
    const timestamp = Date.now();
    const record = {
      id: "history-" + session.sessionId,
      sessionId: session.sessionId,
      scriptId: session.scriptId,
      scriptTitle: detail.title,
      endingId: ending.id,
      endingTitle: ending.title,
      endingSummary: ending.relationSummary,
      badgeLabel: ending.badgeLabel,
      playedAt: formatPlayedAt(timestamp),
      playedAtTs: timestamp,
      turnCount: session.messages.filter((item) => item.role === "user").length
    };

    saveCompletedHistory([record].concat(existing));
  }
}

function getRecoverableSessionId(scriptId) {
  const sessions = getActiveSessionMap();
  const recoverable = Object.values(sessions)
    .filter((item) => item.scriptId === scriptId && item.status !== "finished")
    .sort((left, right) => right.sessionId.localeCompare(left.sessionId))[0];

  return recoverable ? recoverable.sessionId : null;
}

const mockChatEngine = {
  createSession(scriptId) {
    const recoverableSessionId = getRecoverableSessionId(scriptId);
    if (recoverableSessionId) {
      return getSession(recoverableSessionId);
    }

    const turns = getTurns(scriptId);
    const firstTurn = turns[0];
    if (!firstTurn) {
      return null;
    }

    const session = {
      sessionId: createSessionId(scriptId),
      scriptId,
      currentTurnIndex: 0,
      messages: [cloneMessage(firstTurn)],
      selectedIntentId: "",
      selectedReplyId: "",
      composerText: "",
      status: "active",
      endingId: "",
      endingPrompt: ""
    };

    saveSession(session);
    return session;
  },

  getSessionView(sessionId) {
    const session = getSession(sessionId);
    return session ? buildSessionView(session) : null;
  },

  selectIntent(sessionId, intentId) {
    const session = getSession(sessionId);
    const turns = session ? getTurns(session.scriptId) : [];
    const turn = session ? turns[session.currentTurnIndex] : null;
    if (!session || session.status !== "active") {
      return session ? buildSessionView(session) : null;
    }

    if (!turn || !getIntentOption(turn, intentId)) {
      return buildSessionView(session);
    }

    session.selectedIntentId = intentId;
    session.selectedReplyId = "";
    session.composerText = "";
    saveSession(session);
    return buildSessionView(session);
  },

  resetIntentSelection(sessionId) {
    const session = getSession(sessionId);
    if (!session || session.status !== "active") {
      return session ? buildSessionView(session) : null;
    }

    session.selectedIntentId = "";
    session.selectedReplyId = "";
    session.composerText = "";
    saveSession(session);
    return buildSessionView(session);
  },

  selectReply(sessionId, replyId) {
    const session = getSession(sessionId);
    const turns = session ? getTurns(session.scriptId) : [];
    const turn = session ? turns[session.currentTurnIndex] : null;
    if (!session || !turn || session.status !== "active") {
      return session ? buildSessionView(session) : null;
    }

    const option = getReplyOptionsForIntent(turn, session.selectedIntentId).find((item) => item.id === replyId);
    if (!option) {
      return buildSessionView(session);
    }

    session.selectedReplyId = replyId;
    session.composerText = option.text;
    saveSession(session);
    return buildSessionView(session);
  },

  clearDraft(sessionId) {
    const session = getSession(sessionId);
    if (!session || session.status !== "active") {
      return session ? buildSessionView(session) : null;
    }

    session.selectedReplyId = "";
    session.composerText = "";
    saveSession(session);
    return buildSessionView(session);
  },

  updateComposer(sessionId, text) {
    const session = getSession(sessionId);
    if (!session || session.status !== "active") {
      return session ? buildSessionView(session) : null;
    }

    session.composerText = text;
    saveSession(session);
    return buildSessionView(session);
  },

  submitReply(sessionId, payload) {
    const session = getSession(sessionId);
    const turns = session ? getTurns(session.scriptId) : [];
    const turn = session ? turns[session.currentTurnIndex] : null;

    if (!session || !turn || session.status !== "active") {
      return session ? buildSessionView(session) : null;
    }

    if (!session.selectedIntentId) {
      return buildSessionView(session);
    }

    const manualText = (payload.customText || session.composerText || "").trim();
    const selectedReplyId = payload.replyId || session.selectedReplyId;
    const selectedReply = getReplyOptionsForIntent(turn, session.selectedIntentId).find((item) => item.id === selectedReplyId);
    const finalText = manualText || (selectedReply ? selectedReply.text : "");

    if (!finalText) {
      return buildSessionView(session);
    }

    session.messages = session.messages.concat([
      {
        id: session.sessionId + "-user-" + Date.now().toString(36),
        role: "user",
        text: finalText
      }
    ]);

    const nextTurn = turns[session.currentTurnIndex + 1];
    session.selectedReplyId = "";
    session.selectedIntentId = "";
    session.composerText = "";

    if (nextTurn) {
      session.currentTurnIndex = session.currentTurnIndex + 1;
      session.messages = session.messages.concat([cloneMessage(nextTurn)]);
    } else {
      session.status = "readyToFinish";
      session.endingId = turn.ending_id || "";
      session.endingPrompt = turn.ending_prompt || "这段对话已经来到一个节点了。";
    }

    saveSession(session);
    return buildSessionView(session);
  },

  finishSession(sessionId) {
    const session = getSession(sessionId);
    if (!session) {
      return null;
    }

    if (session.status === "finished") {
      return {
        scriptId: session.scriptId,
        endingId: session.endingId
      };
    }

    if (session.status !== "readyToFinish" || !session.endingId) {
      return null;
    }

    session.status = "finished";
    saveSession(session);
    saveHistoryRecord(session);

    return {
      scriptId: session.scriptId,
      endingId: session.endingId
    };
  },

  getRecoverableSessionId
};

module.exports = {
  mockChatEngine
};
