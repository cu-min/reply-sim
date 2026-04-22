const { getScriptDetail } = require("../../services/script-service");
const { createSession } = require("../../services/session-service");
const { checkHearts } = require("../../services/heart-service");
const { isFavorited, toggleFavorite } = require("../../services/favorites-service");

const CAT_MOOD = {
  "暗恋": { grad: ["#D4B5A0", "#C49A85"], text: "#6B3A2A", tag: "#C49A85", emoji: "🌙" },
  "前任": { grad: ["#C4AFCA", "#A99AB8"], text: "#4A2A5A", tag: "#A99AB8", emoji: "✨" },
  "社交": { grad: ["#D4C4A0", "#C0A97A"], text: "#4A3A1A", tag: "#C0A97A", emoji: "☕" },
  "职场": { grad: ["#B0BEC5", "#90A4AE"], text: "#2A3A4A", tag: "#90A4AE", emoji: "💼" },
};

Page({
  data: {
    script: null,
    loadState: "loading",
    errorMessage: "",
    loadHint: "",
    statusBarHeight: 0,
    moodBg: "linear-gradient(145deg, #D4B5A0, #C49A85)",
    moodTagColor: "#C49A85",
    moodText: "#6B3A2A",
    emoji: "🌙",
    isFavorited: false,
    favAnimating: false
  },

  async onLoad(query) {
    const { statusBarHeight } = wx.getWindowInfo();
    this.setData({ statusBarHeight });

    const scriptId = query.scriptId;
    if (!scriptId) {
      this.setData({
        script: null,
        loadState: "error",
        errorMessage: "没有拿到有效的剧本参数，请回到上一页重新进入。"
      });
      return;
    }

    wx.showLoading({
      title: "加载中"
    });

    try {
      const script = await getScriptDetail(scriptId);
      if (!script) {
        wx.showToast({
          title: "剧本不存在",
          icon: "none"
        });
        this.setData({
          script: null,
          loadState: "error",
          errorMessage: "没有找到这个剧本，可能是链接失效或参数不完整。",
          loadHint: ""
        });
        return;
      }

      const mood = CAT_MOOD[script.category] || CAT_MOOD["暗恋"];
      this.setData({
        script,
        loadState: "ready",
        errorMessage: "",
        loadHint: script.__fallbackSource === "local" ? "当前展示的是本地离线剧本内容，线上数据暂时不可用。" : "",
        moodBg: `linear-gradient(145deg, ${mood.grad[0]}, ${mood.grad[1]})`,
        moodTagColor: mood.tag,
        moodText: mood.text,
        emoji: mood.emoji,
        isFavorited: isFavorited(script.id)
      });

      if (script.__fallbackSource === "local") {
        wx.showToast({
          title: "当前为离线内容",
          icon: "none"
        });
      }
    } catch (error) {
      wx.showToast({
        title: "剧本加载失败",
        icon: "none"
      });
      this.setData({
        script: null,
        loadState: "error",
        errorMessage: "剧本详情暂时加载失败，请稍后重试。",
        loadHint: ""
      });
    } finally {
      wx.hideLoading();
    }
  },

  async handleStartChat() {
    const script = this.data.script;
    if (!script) {
      return;
    }

    try {
      const heartResult = await checkHearts();
      if (!heartResult || !heartResult.canPlay) {
        wx.showModal({
          title: "心动值不足",
          content: "当前心动值为 0，暂时无法开始新的对话。",
          confirmText: "知道了",
          showCancel: false
        });
        return;
      }
    } catch (error) {
      wx.showToast({
        title: "暂时无法检查心动值",
        icon: "none"
      });
      return;
    }

    let cloudSessionId = "";

    try {
      cloudSessionId = await createSession(script.id);
    } catch (error) {
      wx.showToast({
        title: "云端会话暂时没接上",
        icon: "none"
      });
    }

    wx.navigateTo({
      url: "/pages/chat/index?scriptId=" + script.id + (cloudSessionId ? "&cloudSessionId=" + cloudSessionId : "")
    });
  },

  handleToggleFavorite() {
    const script = this.data.script;
    if (!script) return;
    const nowFav = toggleFavorite(script);
    this.setData({ isFavorited: nowFav, favAnimating: true });
    setTimeout(() => this.setData({ favAnimating: false }), 380);
  },

  handleBack() {
    wx.navigateBack();
  },

  handleBackHome() {
    wx.switchTab({
      url: "/pages/home/index"
    });
  },

  onShareAppMessage() {
    const detail = this.data.script || {};
    return {
      title: "「" + (detail.openingLine || "如果这样回") + "」——你会怎么回？",
      path: "/pages/home/index"
    };
  },

  onShareTimeline() {
    const detail = this.data.script || {};
    return {
      title: "如果这样回——" + (detail.title || "情感对话模拟"),
      query: ""
    };
  }
});
