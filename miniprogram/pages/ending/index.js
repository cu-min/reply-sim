const { getEndingResult, getScriptDetail } = require("../../services/script-service");
const { isFavorited, toggleFavorite } = require("../../services/favorites-service");
const themeBehavior = require("../../behaviors/theme");

// ── Mood palette per ending type ──────────────────────────────
// moodGrad:       hero card gradient [top, bottom]
// moodTitleColor: large title + subtitle color
// moodTagColor:   small italic tag above title
// moodEmoji:      decoration at bottom-right of hero card

const MOOD_WARM = {
  moodGrad: ["#D4B5A0", "#C49A85"],
  moodTitleColor: "#5A3220",
  moodTagColor: "#8A6050",
  moodEmoji: "🌤",
  moodTag: "关系回暖",
  categoryLabel: ""
};

const MOOD_COLD = {
  moodGrad: ["#BDB0CC", "#9887AE"],
  moodTitleColor: "#3D2E55",
  moodTagColor: "#7A6A8A",
  moodEmoji: "🌧",
  moodTag: "关系后退",
  categoryLabel: ""
};

const MOOD_OPEN = {
  moodGrad: ["#B4C4BC", "#90A89E"],
  moodTitleColor: "#233029",
  moodTagColor: "#5A7060",
  moodEmoji: "🌫",
  moodTag: "待续",
  categoryLabel: ""
};

function getMoodForEnding(ending) {
  const src = [
    ending.type || "",
    ending.id || "",
    ending.label || "",
    ending.badgeLabel || "",
    ending.title || ""
  ].join(" ").toLowerCase();

  if (/融|暖|进展|升温|亲近|破冰|warm|好转|重逢|相通|开始|冰融/.test(src)) {
    return MOOD_WARM;
  }
  if (/冷|战|疏|僵|隔|远|失|错|cold|后退|crumble|分开|崩/.test(src)) {
    return MOOD_COLD;
  }
  return MOOD_OPEN;
}

// ── Data builders ─────────────────────────────────────────────
function buildMissedBranchText(ending) {
  if (!ending || !ending.missedBranchHint) return "";
  return "如果换一种回应，" + ending.missedBranchHint.replace(/^如果/, "");
}

function buildEndingFromGlobal(ending) {
  return {
    id: ending.id || ending.type || "unknown",
    type: ending.type || "",
    title: ending.label || ending.badge_label || "这一局有了一个结果",
    relationSummary: ending.relationship_result || "",
    keyFeedback: ending.key_behavior_feedback || "",
    missedBranchHint: ending.missed_branch_hint || "",
    closingLine: ending.literary_closing || "",
    badgeLabel: ending.badge_label || ending.label || ending.type || "进行中",
    label: ending.label || ""
  };
}

function withMoodFields(ending, script) {
  const mood = getMoodForEnding(ending);
  return Object.assign({}, ending, mood, {
    categoryLabel: (script && script.title) || "",
    missedBranchText: buildMissedBranchText(ending)
  });
}

// ── Page ──────────────────────────────────────────────────────
Page({
  behaviors: [themeBehavior],
  data: {
    script: null,
    ending: null,
    loadState: "loading",
    errorMessage: "",
    isFavorited: false,
    favAnimating: false,
    statusBarHeight: 0
  },

  async onLoad(query) {
    const { statusBarHeight = 0 } = wx.getSystemInfoSync();
    this.setData({ statusBarHeight });

    try {
      const app = getApp();
      const lastEnding = app.globalData && app.globalData.lastEnding;

      if (lastEnding && lastEnding.ending) {
        const script = await getScriptDetail(lastEnding.scenarioId);
        const ending = buildEndingFromGlobal(lastEnding.ending);
        const resolvedScript = script || { id: lastEnding.scenarioId, title: lastEnding.scriptTitle || "这段对话" };

        this.setData({
          script: resolvedScript,
          ending: withMoodFields(ending, resolvedScript),
          loadState: "ready",
          errorMessage: "",
          isFavorited: isFavorited(resolvedScript.id)
        });
        return;
      }

      const script = await getScriptDetail(query.scriptId);
      const ending = await getEndingResult(query.scriptId, query.endingId);

      if (!script || !ending) {
        wx.showToast({ title: "结局不存在", icon: "none" });
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
        ending: withMoodFields(ending, script),
        loadState: "ready",
        errorMessage: "",
        isFavorited: isFavorited(script.id)
      });
    } catch (error) {
      wx.showToast({ title: "结局加载失败", icon: "none" });
      this.setData({
        script: null,
        ending: null,
        loadState: "error",
        errorMessage: "结局内容暂时加载失败，请稍后再试。"
      });
    }
  },

  handleToggleFavorite() {
    const script = this.data.script;
    if (!script) return;
    const nowFav = toggleFavorite(script);
    this.setData({ isFavorited: nowFav, favAnimating: true });
    setTimeout(() => this.setData({ favAnimating: false }), 380);
  },

  handleReplay() {
    const script = this.data.script;
    if (!script) return;
    wx.redirectTo({ url: "/pages/chat/index?scriptId=" + script.id });
  },

  handleBackHome() {
    wx.switchTab({ url: "/pages/home/index" });
  },

  preventTouchMove() {},

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
