const { getScriptDetail } = require("../../services/script-service");
const { createSession } = require("../../services/session-service");
const { checkHearts, rewardShareHearts } = require("../../services/heart-service");

Page({
  data: {
    script: null,
    loadState: "loading",
    errorMessage: ""
  },

  async onLoad(query) {
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
          errorMessage: "没有找到这个剧本，可能是链接失效或参数不完整。"
        });
        return;
      }

      this.setData({
        script,
        loadState: "ready",
        errorMessage: ""
      });
    } catch (error) {
      wx.showToast({
        title: "剧本加载失败",
        icon: "none"
      });
      this.setData({
        script: null,
        loadState: "error",
        errorMessage: "剧本详情暂时加载失败，请稍后重试。"
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
          content: "当前心动值为 0，分享给好友可以获得更多心动值。",
          confirmText: "知道了",
          showCancel: false
        });
        return;
      }
    } catch (error) {
      wx.showToast({
        title: "暂时没法检查心动值",
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
  },

  async handleShareReward() {
    try {
      const result = await rewardShareHearts("share_friend");
      if (result && result.rewarded) {
        wx.showToast({
          title: "+" + result.rewardAmount + " 心动值",
          icon: "none",
          duration: 2000
        });
        return;
      }

      if (result && result.message) {
        wx.showToast({
          title: result.message,
          icon: "none"
        });
      }
    } catch (error) {
      console.error("[detail] 分享奖励失败:", error);
    }
  }
});
