const { generateStrategies, generateReplies, generateResponse } = require("../../services/chat-ai-service");
const { createSession, syncSession } = require("../../services/session-service");
const { getScriptDetail } = require("../../services/script-service");

const STRATEGY_LOADING_ID = "system-strategy-loading";
const STRATEGY_RETRY_ID = "system-strategy-retry";
const REPLY_LOADING_ID = "system-reply-loading";
const REPLY_RETRY_ID = "system-reply-retry";

function randomDelay() {
  return 500 + Math.floor(Math.random() * 1000);
}

function createAssistantMessage(text, emotionHint, name) {
  return {
    id: "assistant-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    role: "assistant",
    text: text || "",
    emotionHint: emotionHint || "",
    name: name || "",
    timestamp: Date.now()
  };
}

function createUserMessage(text) {
  return {
    id: "user-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    role: "user",
    text: text || "",
    timestamp: Date.now()
  };
}

function getLastMessageId(messages) {
  const lastMessage = (messages || [])[messages.length - 1];
  return lastMessage ? "msg-" + lastMessage.id : "";
}

function getTurnLabel(messages, canFinish) {
  const userMessageCount = (messages || []).filter((item) => item.role === "user").length;
  if (canFinish) {
    return "本局已到收尾节点";
  }
  return "第 " + (userMessageCount + 1) + " 轮表达";
}

function getStrategyLoadingOptions() {
  return [
    {
      id: STRATEGY_LOADING_ID,
      label: "正在思考",
      description: "正在思考表达方向..."
    }
  ];
}

function getStrategyRetryOptions() {
  return [
    {
      id: STRATEGY_RETRY_ID,
      label: "再试一次",
      description: "对方在想怎么回你..."
    }
  ];
}

function getReplyLoadingOptions() {
  return [
    {
      id: REPLY_LOADING_ID,
      label: "正在组织语言",
      tone: "再等一小会",
      text: "正在组织语言..."
    }
  ];
}

function getReplyRetryOptions() {
  return [
    {
      id: REPLY_RETRY_ID,
      label: "重新生成",
      tone: "轻点一下再试一次",
      text: "点这里重新生成这组候选回复。"
    }
  ];
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
    selectedIntentDescription: "",
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
    const incomingSessionId = query.cloudSessionId || query.sessionId || "";
    const script = await getScriptDetail(requestedScriptId);

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

    let sessionId = incomingSessionId;
    if (!sessionId) {
      try {
        sessionId = await createSession(script.id);
      } catch (error) {}
    }

    if (!sessionId) {
      this.setData({
        script,
        loadState: "error",
        errorMessage: "这段对话暂时接不上云端会话，请回到上一页重新进入。"
      });
      return;
    }

    const initialMessages = [
      createAssistantMessage(script.openingLine, "", script.character.name)
    ];

    this.pendingEnding = null;
    this.setData({
      script,
      sessionId,
      cloudSessionId: sessionId,
      messages: initialMessages,
      intentOptions: getStrategyLoadingOptions(),
      replyOptions: [],
      selectedIntentId: "",
      selectedReplyId: "",
      composerText: "",
      canFinish: false,
      endingPrompt: "",
      counterpartInitial: script.character.name.slice(0, 1),
      selectedIntentLabel: "",
      selectedIntentDescription: "",
      isStrategyChosen: false,
      turnLabel: getTurnLabel(initialMessages, false),
      scrollIntoViewId: getLastMessageId(initialMessages),
      sendButtonDisabled: true,
      draftSourceLabel: "你也可以直接自己写一句",
      restoredSession: false,
      isTyping: false,
      topStatusText: script.character.currentAttitude,
      loadState: "ready",
      errorMessage: ""
    });

    await this.syncOpeningMessage(initialMessages);
    await this.fetchStrategies();
  },

  async syncOpeningMessage(messages) {
    try {
      await syncSession(this.data.sessionId, {
        messages,
        currentMood: this.data.script.character.initialMood || this.data.script.character.currentAttitude || "",
        currentFavorability: Number(this.data.script.character.initialFavorability || 0)
      });
    } catch (error) {}
  },

  async fetchStrategies() {
    this.setData({
      intentOptions: getStrategyLoadingOptions(),
      replyOptions: [],
      selectedIntentId: "",
      selectedReplyId: "",
      selectedIntentLabel: "",
      selectedIntentDescription: "",
      isStrategyChosen: false,
      composerText: "",
      sendButtonDisabled: true,
      draftSourceLabel: "对方在想怎么回你..."
    });

    try {
      const result = await generateStrategies(this.data.sessionId);
      const strategies = (result && result.strategies) || [];
      if (!strategies.length) {
        throw new Error("未生成策略");
      }
      this.setData({
        intentOptions: strategies,
        draftSourceLabel: "先选一个表达方向，再决定这一轮怎么说"
      });
    } catch (error) {
      this.setData({
        intentOptions: getStrategyRetryOptions(),
        draftSourceLabel: "对方在想怎么回你..."
      });
      wx.showToast({
        title: "对方在想怎么回你...",
        icon: "none"
      });
    }
  },

  async fetchReplies(strategy) {
    this.setData({
      isStrategyChosen: true,
      selectedIntentId: strategy.id,
      selectedIntentLabel: strategy.label,
      selectedIntentDescription: strategy.description || "",
      replyOptions: getReplyLoadingOptions(),
      selectedReplyId: "",
      composerText: "",
      sendButtonDisabled: true,
      draftSourceLabel: "正在组织语言..."
    });

    try {
      const result = await generateReplies(this.data.sessionId, strategy);
      const replies = (result && result.replies) || [];
      if (!replies.length) {
        throw new Error("未生成候选回复");
      }
      this.setData({
        replyOptions: replies,
        draftSourceLabel: "选中一句后，可以继续微调再发送"
      });
    } catch (error) {
      this.setData({
        replyOptions: getReplyRetryOptions(),
        draftSourceLabel: "对方在想怎么回你..."
      });
      wx.showToast({
        title: "对方在想怎么回你...",
        icon: "none"
      });
    }
  },

  handleIntentSelect(event) {
    const intentId = event.currentTarget.dataset.id;
    if (!intentId || intentId === STRATEGY_LOADING_ID) {
      return;
    }

    if (intentId === STRATEGY_RETRY_ID) {
      this.fetchStrategies();
      return;
    }

    const strategy = (this.data.intentOptions || []).find((item) => item.id === intentId);
    if (!strategy) {
      return;
    }

    this.fetchReplies(strategy);
  },

  handleReplySelect(event) {
    const replyId = event.currentTarget.dataset.id;
    if (!replyId || replyId === REPLY_LOADING_ID) {
      return;
    }

    if (replyId === REPLY_RETRY_ID) {
      this.fetchReplies({
        id: this.data.selectedIntentId,
        label: this.data.selectedIntentLabel,
        description: this.data.selectedIntentDescription
      });
      return;
    }

    const reply = (this.data.replyOptions || []).find((item) => item.id === replyId);
    if (!reply) {
      return;
    }

    this.setData({
      selectedReplyId: reply.id,
      composerText: reply.text,
      sendButtonDisabled: !String(reply.text || "").trim(),
      draftSourceLabel: "已选中这一句，可继续微调后发送"
    });
  },

  handleBackToIntentSelect() {
    if (this.data.isTyping) {
      return;
    }

    this.fetchStrategies();
  },

  handleComposerInput(event) {
    const value = event.detail.value || "";
    this.setData({
      composerText: value,
      sendButtonDisabled: !String(value).trim()
    });
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

    const userMessage = String(this.data.composerText || "").trim();
    if (!userMessage) {
      wx.showToast({
        title: "先选一句或自己写一句",
        icon: "none"
      });
      return;
    }

    const nextMessages = this.data.messages.concat([createUserMessage(userMessage)]);
    this.setData({
      messages: nextMessages,
      scrollIntoViewId: getLastMessageId(nextMessages),
      isTyping: true,
      topStatusText: this.data.script.character.name + "正在输入...",
      draftSourceLabel: "对方在想怎么回你...",
      sendButtonDisabled: true
    });

    try {
      const result = await generateResponse(this.data.sessionId, userMessage);
      if (!result || !Array.isArray(result.reply_messages)) {
        throw new Error("AI 回应格式异常");
      }
      const delay = randomDelay();
      const aiMessages = (result.reply_messages || []).map((text, index) =>
        createAssistantMessage(
          text,
          index === 0 ? result.emotion_hint || "" : "",
          this.data.script.character.name
        )
      );

      this._responseTimer = setTimeout(() => {
        const mergedMessages = nextMessages.concat(aiMessages);
        const shouldEnd = Boolean(result.should_end && result.ending);

        this.setData({
          messages: mergedMessages,
          intentOptions: shouldEnd ? [] : getStrategyLoadingOptions(),
          replyOptions: [],
          selectedIntentId: "",
          selectedReplyId: "",
          selectedIntentLabel: "",
          selectedIntentDescription: "",
          isStrategyChosen: false,
          composerText: "",
          canFinish: shouldEnd,
          endingPrompt: shouldEnd ? "这段对话到了一个节点，要在这里画上句号吗？" : "",
          turnLabel: getTurnLabel(mergedMessages, shouldEnd),
          scrollIntoViewId: getLastMessageId(mergedMessages),
          sendButtonDisabled: true,
          draftSourceLabel: shouldEnd ? "这一局可以先停在这里" : "你也可以直接自己写一句",
          isTyping: false,
          topStatusText: result.mood_update || this.data.script.character.currentAttitude
        });

        if (shouldEnd) {
          this.pendingEnding = result.ending;
          return;
        }

        this.fetchStrategies();
      }, delay);
    } catch (error) {
      this.setData({
        messages: nextMessages,
        isTyping: false,
        topStatusText: this.data.script.character.currentAttitude,
        draftSourceLabel: "对方在想怎么回你..."
      });
      wx.showToast({
        title: "对方在想怎么回你...",
        icon: "none"
      });
    }
  },

  handleSeeEnding() {
    if (!this.pendingEnding) {
      wx.showToast({
        title: "这段对话还没落到结局",
        icon: "none"
      });
      return;
    }

    const app = getApp();
    app.globalData = app.globalData || {};
    app.globalData.lastEnding = {
      scenarioId: this.data.script.id,
      sessionId: this.data.sessionId,
      ending: this.pendingEnding,
      characterName: this.data.script.character.name,
      scriptTitle: this.data.script.title
    };

    wx.navigateTo({
      url: "/pages/ending/index"
    });
  },

  async handleRestart() {
    const script = this.data.script;
    if (!script) {
      return;
    }

    try {
      const newSessionId = await createSession(script.id);
      wx.redirectTo({
        url: "/pages/chat/index?scriptId=" + script.id + "&cloudSessionId=" + newSessionId
      });
    } catch (error) {
      wx.showToast({
        title: "暂时还开不了新一局",
        icon: "none"
      });
    }
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

    this.setData({
      selectedReplyId: "",
      composerText: "",
      sendButtonDisabled: true
    });
  },

  onUnload() {
    if (this._responseTimer) {
      clearTimeout(this._responseTimer);
    }
  }
});
