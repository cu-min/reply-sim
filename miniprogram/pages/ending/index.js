const { getEndingResult, getScriptDetail } = require("../../services/script-service");

function buildSummaryParagraphs(ending) {
  if (!ending) {
    return [];
  }

  const paragraphs = [];
  if (ending.keyFeedback) {
    paragraphs.push(ending.keyFeedback);
  }

  if (ending.missedBranchHint) {
    paragraphs.push("如果换一种回应，" + ending.missedBranchHint.replace(/^如果/, ""));
  }

  return paragraphs;
}

Page({
  data: {
    script: null,
    ending: null,
    loadState: "loading",
    errorMessage: ""
  },

  onLoad(query) {
    const script = getScriptDetail(query.scriptId);
    const ending = getEndingResult(query.scriptId, query.endingId);

    if (!script || !ending) {
      wx.showToast({
        title: "结局不存在",
        icon: "none"
      });
      this.setData({
        script: script || null,
        ending: null,
        loadState: "error",
        errorMessage: "这页结局没有找到，可能是直接进入了无效链接。"
      });
      return;
    }

    this.setData({
      script,
      ending: Object.assign({}, ending, {
        summaryParagraphs: buildSummaryParagraphs(ending)
      }),
      loadState: "ready",
      errorMessage: ""
    });
  },

  handleReplay() {
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

  handleShare() {
    wx.showToast({
      title: "分享能力稍后接入",
      icon: "none"
    });
  }
});
