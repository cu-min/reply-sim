const { checkHearts } = require("../../services/heart-service");
const { callCloud } = require("../../services/cloud-service");
const { getFavorites } = require("../../services/favorites-service");

const CAT_MOOD = {
  "暗恋": { grad: ["#D4B5A0", "#C49A85"], text: "#6B3A2A", tag: "#C49A85", emoji: "🌙" },
  "前任": { grad: ["#C4AFCA", "#A99AB8"], text: "#4A2A5A", tag: "#A99AB8", emoji: "✨" },
  "社交": { grad: ["#D4C4A0", "#C0A97A"], text: "#4A3A1A", tag: "#C0A97A", emoji: "☕" },
  "职场": { grad: ["#B0BEC5", "#90A4AE"], text: "#2A3A4A", tag: "#90A4AE", emoji: "💼" },
};

const ACHIEVEMENTS = [
  { id: "night_owl",  emoji: "🌙", label: "深夜倾诉者", desc: "夜间完成3段",  grad: ["#C4AFCA", "#A99AB8"] },
  { id: "streak_7",   emoji: "🔥", label: "连续演练",   desc: "连续登录7天",  grad: ["#D4B5A0", "#C49A85"] },
  { id: "endings_10", emoji: "✨", label: "结局收集家", desc: "解锁10个结局", grad: ["#D4C4A0", "#C0A97A"] },
  { id: "crush_5",    emoji: "🍃", label: "破冰高手",   desc: "完成5段暗恋",  grad: ["#B8C4B8", "#9BAF9B"] },
];

function settle(p) {
  return p.then(
    v => ({ status: "fulfilled", value: v }),
    r => ({ status: "rejected", reason: r })
  );
}

Page({
  data: {
    nickname: "匿名旅人",
    nameInitial: "匿",
    bio: "有些话，先在这里试着说。",
    hearts: 0,
    scenarioCount: 0,
    endingCount: 0,
    totalRounds: 0,
    statusBarHeight: 0,
    showHeartBanner: false,
    recentSessions: [],
    allSessions: [],
    historyExpanded: false,
    favCount: 0,
    favSub: "还没有收藏，去探索剧本吧",
    favItems: [],
    favExpanded: false,
    achievements: [],
    showFeedbackModal: false,
    feedbackTypes: [
      { label: "体验问题", value: "体验问题" },
      { label: "内容建议", value: "内容建议" },
      { label: "剧本反馈", value: "剧本反馈" },
      { label: "其他", value: "其他" },
    ],
    feedbackType: "体验问题",
    feedbackContent: "",
    feedbackContact: "",
    feedbackSubmitting: false,
  },

  onShow() {
    const { statusBarHeight } = wx.getWindowInfo();
    this.setData({ statusBarHeight });
    this.loadFavorites();
    this.loadProfileData();
  },

  async loadProfileData() {
    try {
      const [heartResult, profileResult] = await Promise.all([
        settle(checkHearts()),
        settle(callCloud("getUserProfile", {}))
      ]);

      let hearts = 0;
      if (heartResult.status === "fulfilled" && heartResult.value) {
        hearts = heartResult.value.hearts || 0;
      }

      const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
      if (profile) {
        const scenarioCount = profile.scenarioCount || 0;
        const endingCount   = profile.endingCount   || 0;
        const totalRounds   = profile.totalRounds   || 0;
        hearts = typeof profile.hearts === "number" ? profile.hearts : hearts;

        const allRaw = profile.recentSessions || [];
        const recentSessions = allRaw.slice(0, 3).map(item => this.enrichSession(item));
        const allSessions    = allRaw.map(item => this.enrichSession(item));

        const nickname = profile.nickname || "匿名旅人";
        this.setData({
          nickname,
          nameInitial: nickname.charAt(0),
          hearts,
          scenarioCount,
          endingCount,
          totalRounds,
          showHeartBanner: hearts <= 2,
          recentSessions,
          allSessions,
          achievements: this.computeAchievements({ scenarioCount, endingCount, totalRounds }),
        });
        return;
      }

      this.setData({
        hearts,
        showHeartBanner: hearts <= 2,
        achievements: this.computeAchievements({ scenarioCount: 0, endingCount: 0, totalRounds: 0 }),
      });
    } catch (err) {
      console.error("[profile] 加载失败:", err);
      wx.showToast({ title: "资料加载失败", icon: "none" });
    }
  },

  enrichSession(item) {
    const category = item.category || "暗恋";
    const mood = CAT_MOOD[category] || CAT_MOOD["暗恋"];
    const { dateStr, timeStr } = this.formatDateTime(item.updated_at || item.created_at);
    return {
      ...item,
      category,
      emoji: mood.emoji,
      moodGrad0: mood.grad[0],
      moodGrad1: mood.grad[1],
      moodTag: mood.tag,
      moodTagBg: mood.tag + "22",
      dateStr,
      timeStr,
    };
  },

  computeAchievements({ scenarioCount, endingCount }) {
    return ACHIEVEMENTS.map(a => ({
      ...a,
      grad0: a.grad[0],
      grad1: a.grad[1],
      unlocked: this.checkAchievement(a.id, { scenarioCount, endingCount }),
    }));
  },

  checkAchievement(id, { scenarioCount, endingCount }) {
    if (id === "endings_10") return endingCount >= 10;
    if (id === "crush_5")    return scenarioCount >= 5;
    return false;
  },

  loadFavorites() {
    try {
      const favs = getFavorites();
      const favCount = favs.length;
      const cats = [...new Set(favs.map(f => f.category).filter(Boolean))];
      const favSub = favCount > 0
        ? (cats.length > 0 ? cats.join(" · ") : `${favCount} 个剧本`)
        : "还没有收藏，去探索剧本吧";
      const favItems = favs.map(f => {
        const mood = CAT_MOOD[f.category] || CAT_MOOD["暗恋"];
        return {
          ...f,
          emoji: mood.emoji,
          moodGrad0: mood.grad[0],
          moodGrad1: mood.grad[1],
          moodTag: mood.tag,
          moodTagBg: mood.tag + "22",
        };
      });
      this.setData({ favCount, favSub, favItems });
    } catch (e) {
      this.setData({ favCount: 0, favSub: "还没有收藏，去探索剧本吧", favItems: [] });
    }
  },

  handleToggleFavs() {
    this.setData({ favExpanded: !this.data.favExpanded });
  },

  handleFavTap(e) {
    const scriptId = e.currentTarget.dataset.id;
    if (!scriptId) return;
    wx.navigateTo({ url: "/pages/script-detail/index?scriptId=" + scriptId });
  },

  handleHistoryTap(event) {
    const scenarioId = event.currentTarget.dataset.id;
    if (!scenarioId) return;
    wx.navigateTo({ url: "/pages/script-detail/index?scriptId=" + scenarioId });
  },

  handleToggleHistory() {
    this.setData({ historyExpanded: !this.data.historyExpanded });
  },


  handleSettings() {
    wx.showToast({ title: "设置暂未开放", icon: "none" });
  },

  handleFeedback() {
    this.setData({
      showFeedbackModal: true,
      feedbackType: "体验问题",
      feedbackContent: "",
      feedbackContact: "",
      feedbackSubmitting: false,
    });
  },

  noop() {},

  handleFeedbackClose() {
    this.setData({ showFeedbackModal: false });
  },

  handleFeedbackTypeSelect(e) {
    this.setData({ feedbackType: e.currentTarget.dataset.value });
  },

  handleFeedbackInput(e) {
    this.setData({ feedbackContent: e.detail.value });
  },

  handleContactInput(e) {
    this.setData({ feedbackContact: e.detail.value });
  },

  async handleFeedbackSubmit() {
    const { feedbackContent, feedbackType, feedbackContact, feedbackSubmitting } = this.data;
    if (!feedbackContent.trim() || feedbackSubmitting) return;
    this.setData({ feedbackSubmitting: true });
    try {
      await callCloud("submitFeedback", {
        type: feedbackType,
        content: feedbackContent,
        contact: feedbackContact,
      });
      this.setData({ showFeedbackModal: false });
      wx.showToast({ title: "感谢你的反馈 ✨", icon: "none", duration: 2000 });
    } catch (err) {
      console.error("[feedback] 提交失败:", err);
      wx.showToast({ title: "提交失败，请重试", icon: "none" });
    } finally {
      this.setData({ feedbackSubmitting: false });
    }
  },

  handleAbout() {
    wx.showModal({
      title: "关于如果这样回",
      content: "有些话说出口会后悔，有些话没说出口更后悔。\n\n如果这样回，是一个模拟真实对话的练习场。",
      showCancel: false,
      confirmText: "知道了"
    });
  },

  formatDateTime(dateValue) {
    if (!dateValue) return { dateStr: "", timeStr: "" };
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return { dateStr: "", timeStr: "" };
    const month   = date.getMonth() + 1;
    const day     = date.getDate();
    const hours   = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return { dateStr: month + "." + day, timeStr: hours + ":" + minutes };
  }
});
