const {
  clearDraft,
  createMockSession,
  finishSession,
  getCurrentTurn,
  getRecoverableSessionId,
  resetIntentSelection,
  saveEnding,
  selectIntent,
  selectReply,
  submitReply,
  syncSession,
  updateComposer
} = require("../../services/session-service");
const { getEndingResult, getScriptDetail } = require("../../services/script-service");

function deriveCurrentMood(state, script) {
  const lastAssistantMessage = state.messages.slice().reverse().find((item) => item.role === "assistant");
  return (lastAssistantMessage && lastAssistantMessage.emotionHint) || (script && script.character.currentAttitude) || "";
}

function deriveCurrentFavorability(state, script) {
  const base = Number(script && script.character && script.character.initialFavorability) || 0;
  const userMessageCount = state.messages.filter((item) => item.role === "user").length;
  return base + userMessageCount;
}

function syncPageState(page, state, script) {
  const currentTurn = state.currentTurn;
  const lastMessage = state.messages[state.messages.length - 1];
  const replySelected = Boolean(state.selectedReplyId);
  const hasComposerText = Boolean((state.composerText || "").trim());
  const isStrategyChosen = Boolean(state.selectedIntentId);
  const userMessageCount = state.messages.filter((item) => item.role === "user").length;
  const totalTurns = currentTurn ? userMessageCount + 1 : userMessageCount;

  page.setData({
    script,
    sessionId: state.session.sessionId,
    messages: state.messages,
    intentOptions: currentTurn ? currentTurn.intentOptions : [],
    replyOptions: state.replyOptions || [],
    selectedIntentId: state.selectedIntentId,
    selectedReplyId: state.selectedReplyId,
    composerText: state.composerText,
    canFinish: state.canFinish,
    endingPrompt: state.endingPrompt,
    counterpartInitial: script.character.name.slice(0, 1),
    selectedIntentLabel: currentTurn && isStrategyChosen
      ? ((currentTurn.intentOptions.find((item) => item.id === state.selectedIntentId) || {}).label || "")
      : "",
    isStrategyChosen,
    turnLabel: state.canFinish ? "本局已到收尾节点" : "第 " + totalTurns + " 轮表达",
    scrollIntoViewId: lastMessage ? "msg-" + lastMessage.id : "",
    sendButtonDisabled: !hasComposerText,
    draftSourceLabel: replySelected ? "已选中这一句，可继续微调后发送" : "你也可以直接先在这里写",
    topStatusText: state.canFinish ? "这一局快到落幕的位置了" : script.character.currentAttitude,
    loadState: "ready",
    errorMessage: ""
  });
}

function syncTypingState(page, state, script) {
  const messages = state.messages.slice(0, -1);
  const lastMessage = messages[messages.length - 1];

  page.setData({
    script,
    sessionId: state.session.sessionId,
    messages,
    intentOptions: [],
    replyOptions: [],
    selectedIntentId: "",
    selectedReplyId: "",
    composerText: "",
    canFinish: false,
    endingPrompt: "",
    counterpartInitial: script.character.name.slice(0, 1),
    selectedIntentLabel: "",
    isStrategyChosen: false,
    turnLabel: "对方正在斟酌怎么回你",
    scrollIntoViewId: lastMessage ? "msg-" + lastMessage.id : "",
    sendButtonDisabled: true,
    draftSourceLabel: "等对方说完，再决定这一轮怎么接",
    topStatusText: script.character.name + "正在输入...",
    isTyping: true,
    loadState: "ready",
    errorMessage: ""
  });
}

Page({
  data: {
    script: null,
    sessionId: "",
    cloudSessionId: "",
    messages: [],
    intentOptions: [],
    replyOptions: [],
    selectedIntentId: "",
    selectedReplyId: "",
    composerText: "",
    canFinish: false,
    endingPrompt: "",
    counterpartInitial: "他",
    selectedIntentLabel: "",
    isStrategyChosen: false,
    turnLabel: "",
    scrollIntoViewId: "",
    sendButtonDisabled: true,
    draftSourceLabel: "你也可以直接自己写一句",
    restoredSession: false,
    isTyping: false,
    topStatusText: "",
    loadState: "loading",
    errorMessage: ""
  },

  async onLoad(query) {
    const requestedScriptId = query.scriptId;
    const localSessionId = query.sessionId;
    const cloudSessionId = query.cloudSessionId || "";
    let state = localSessionId ? getCurrentTurn(localSessionId) : null;
    let scriptId = requestedScriptId || (state ? state.session.scriptId : "");
    let script = await getScriptDetail(scriptId);

    if (!script && state) {
      scriptId = state.session.scriptId;
      script = await getScriptDetail(scriptId);
    }

    if (!script) {
      wx.showToast({
        title: "剧本不存在",
        icon: "none"
      });
      this.setData({
        loadState: "error",
        errorMessage: "这个对话场景没有找到，可能是页面参数失效了。"
      });
      return;
    }

    if (state && state.session.scriptId !== scriptId) {
      state = null;
    }

    const recoveredSessionId = !localSessionId ? getRecoverableSessionId(scriptId) : null;
    if (!state && recoveredSessionId) {
      state = getCurrentTurn(recoveredSessionId);
    }

    if (!state) {
      const session = createMockSession(scriptId);
      state = session ? getCurrentTurn(session.sessionId) : null;
    }

    if (!state) {
      wx.showToast({
        title: "会话创建失败",
        icon: "none"
      });
      this.setData({
        script,
        loadState: "error",
        errorMessage: "这段对话暂时还没准备好，请返回上一页重新进入。"
      });
      return;
    }

    if (!state.currentTurn && !state.canFinish) {
      this.setData({
        script,
        loadState: "error",
        errorMessage: "会话状态丢失了，建议重新开始这一局。"
      });
      return;
    }

    syncPageState(this, state, script);
    this.setData({
      cloudSessionId,
      restoredSession: Boolean(recoveredSessionId || localSessionId),
      isTyping: false
    });

    this.persistCloudSession(state);
  },

  async persistCloudSession(state) {
    if (!this.data.cloudSessionId || !state || !this.data.script) {
      return;
    }

    try {
      await syncSession(this.data.cloudSessionId, {
        messages: state.messages,
        currentMood: deriveCurrentMood(state, this.data.script),
        currentFavorability: deriveCurrentFavorability(state, this.data.script)
      });
    } catch (error) {}
  },

  handleIntentSelect(event) {
    const intentId = event.currentTarget.dataset.id;
    if (!intentId) {
      return;
    }

    const state = selectIntent(this.data.sessionId, intentId);
    if (state) {
      syncPageState(this, state, this.data.script);
    }
  },

  handleReplySelect(event) {
    const replyId = event.currentTarget.dataset.id;
    if (!replyId) {
      return;
    }

    const state = selectReply(this.data.sessionId, replyId);
    if (state) {
      syncPageState(this, state, this.data.script);
    }
  },

  handleBackToIntentSelect() {
    if (this.data.isTyping) {
      return;
    }

    const state = resetIntentSelection(this.data.sessionId);
    if (state) {
      syncPageState(this, state, this.data.script);
    }
  },

  handleComposerInput(event) {
    const value = event.detail.value || "";
    const state = updateComposer(this.data.sessionId, value);
    if (state) {
      syncPageState(this, state, this.data.script);
    }
  },

  async handleSend() {
    if (this.data.isTyping) {
      return;
    }

    if (!this.data.selectedIntentId) {
      wx.showToast({
        title: "先选一个策略",
        icon: "none"
      });
      return;
    }

    const text = (this.data.composerText || "").trim();
    if (!text) {
      wx.showToast({
        title: "先选一句或自己写一句",
        icon: "none"
      });
      return;
    }

    const state = submitReply(this.data.sessionId, {
      replyId: this.data.selectedReplyId,
      customText: this.data.composerText
    });

    if (!state) {
      wx.showToast({
        title: "发送失败",
        icon: "none"
      });
      this.setData({
        loadState: "error",
        errorMessage: "这一轮没有成功推进，请重新进入剧本再试一次。"
      });
      return;
    }

    this.persistCloudSession(state);

    const lastMessage = state.messages[state.messages.length - 1];
    const shouldSimulateTyping =
      !state.canFinish &&
      lastMessage &&
      lastMessage.role === "assistant" &&
      state.messages.length >= 2;

    if (shouldSimulateTyping) {
      if (this._typingTimer) {
        clearTimeout(this._typingTimer);
      }

      syncTypingState(this, state, this.data.script);
      this._typingTimer = setTimeout(() => {
        syncPageState(this, state, this.data.script);
        this.setData({
          isTyping: false
        });
      }, 900);
      return;
    }

    syncPageState(this, state, this.data.script);
    this.setData({
      isTyping: false
    });
  },

  async handleSeeEnding() {
    const result = finishSession(this.data.sessionId);
    if (!result) {
      wx.showToast({
        title: "还没到结局节点",
        icon: "none"
      });
      return;
    }

    if (this.data.cloudSessionId) {
      try {
        const ending = await getEndingResult(result.scriptId, result.endingId);
        if (ending) {
          await saveEnding({
            sessionId: this.data.cloudSessionId,
            scenarioId: result.scriptId,
            endingType: ending.id,
            endingText: {
              relationship_result: ending.relationSummary,
              key_behavior_feedback: ending.keyFeedback,
              missed_branch_hint: ending.missedBranchHint,
              literary_closing: ending.closingLine
            }
          });
        }
      } catch (error) {}
    }

    wx.navigateTo({
      url:
        "/pages/ending/index?scriptId=" +
        result.scriptId +
        "&endingId=" +
        result.endingId +
        "&sessionId=" +
        this.data.sessionId
    });
  },

  handleRestart() {
    const script = this.data.script;
    if (!script) {
      return;
    }

    wx.redirectTo({
      url: "/pages/chat/index?scriptId=" + script.id
    });
  },

  handleBackHome() {
    wx.switchTab({
      url: "/pages/home/index"
    });
  },

  handleClearComposer() {
    if (this.data.isTyping) {
      return;
    }

    const state = clearDraft(this.data.sessionId);
    if (state) {
      syncPageState(this, state, this.data.script);
    }
  },

  onUnload() {
    if (this._typingTimer) {
      clearTimeout(this._typingTimer);
    }
  }
});
