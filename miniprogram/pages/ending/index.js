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

function buildEndingFromGlobal(ending) {
  return {
    id: ending.id || ending.type || "unknown",
    title: ending.label || ending.badge_label || "这一局有了一个结果",
    impactLine: ending.key_behavior_feedback || "",
    relationSummary: ending.relationship_result || "",
    keyFeedback: ending.key_behavior_feedback || "",
    missedBranchHint: ending.missed_branch_hint || "",
    closingLine: ending.literary_closing || "",
    badgeLabel: ending.badge_label || ending.label || ending.type || "进行中"
  };
}

Page({
  data: {
    script: null,
    ending: null,
    loadState: "loading",
    errorMessage: ""
  },

  async onLoad(query) {
    try {
      const app = getApp();
      const lastEnding = app.globalData && app.globalData.lastEnding;

      if (lastEnding && lastEnding.ending) {
        const script = await getScriptDetail(lastEnding.scenarioId);
        const ending = buildEndingFromGlobal(lastEnding.ending);

        this.setData({
          script: script || {
            id: lastEnding.scenarioId,
            title: lastEnding.scriptTitle || "这段对话"
          },
          ending: Object.assign({}, ending, {
            summaryParagraphs: buildSummaryParagraphs(ending)
          }),
          loadState: "ready",
          errorMessage: ""
        });
        return;
      }

      const script = await getScriptDetail(query.scriptId);
      const ending = await getEndingResult(query.scriptId, query.endingId);

      if (!script || !ending) {
        wx.showToast({
          title: "结局不存在",
          icon: "none"
        });
        this.setData({
          script: script || null,
          ending: null,
          loadState: "error",
          errorMessage: "这一页结局没有找到，可能是直接进入了无效链接。"
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
    } catch (error) {
      wx.showToast({
        title: "结局加载失败",
        icon: "none"
      });
      this.setData({
        script: null,
        ending: null,
        loadState: "error",
        errorMessage: "结局内容暂时加载失败，请稍后再试。"
      });
    }
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

  onShareAppMessage() {
    const ending = this.data.ending || {};
    return {
      title: ending.closingLine || "有些话说出口会后悔，有些话没说出口更后悔",
      path: "/pages/home/index"
    };
  },

  onShareTimeline() {
    const ending = this.data.ending || {};
    return {
      title: ending.closingLine || "如果这样回——你会怎么选？",
      query: ""
    };
  }
});
