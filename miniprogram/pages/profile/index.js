const { checkHearts } = require("../../services/heart-service");
const { callCloud } = require("../../services/cloud-service");

Page({
  data: {
    nickname: "匿名旅人",
    avatar: "",
    bio: "有些话，先在这里试着说。",
    hearts: 0,
    scenarioCount: 0,
    endingCount: 0,
    totalRounds: 0,
    historyExpanded: false,
    historyList: []
  },

  onShow() {
    this.loadProfileData();
  },

  async loadProfileData() {
    try {
      const [heartResult, profileResult] = await Promise.allSettled([
        checkHearts(),
        callCloud("getUserProfile", {})
      ]);

      if (heartResult.status === "fulfilled" && heartResult.value) {
        this.setData({
          hearts: heartResult.value.hearts || 0
        });
      }

      const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
      if (profile) {
        this.setData({
          nickname: profile.nickname || "匿名旅人",
          avatar: profile.avatar || "",
          hearts: typeof profile.hearts === "number" ? profile.hearts : this.data.hearts,
          scenarioCount: profile.scenarioCount || 0,
          endingCount: profile.endingCount || 0,
          totalRounds: profile.totalRounds || 0,
          historyList: (profile.recentSessions || []).map((item) => ({
            ...item,
            ...this.formatDateTime(item.updated_at || item.created_at)
          }))
        });
        return;
      }

      if (heartResult.status === "rejected" && profileResult.status === "rejected") {
        throw heartResult.reason || profileResult.reason || new Error("资料加载失败");
      }
    } catch (error) {
      console.error("[profile] 加载失败:", error);
      wx.showToast({
        title: "资料加载失败",
        icon: "none"
      });
    }
  },

  toggleHistory() {
    this.setData({
      historyExpanded: !this.data.historyExpanded
    });
  },

  handleHistoryTap(event) {
    const scenarioId = event.currentTarget.dataset.id;
    if (!scenarioId) {
      return;
    }

    wx.navigateTo({
      url: "/pages/script-detail/index?scriptId=" + scenarioId
    });
  },

  handleSettings() {
    wx.showToast({
      title: "设置功能开发中",
      icon: "none"
    });
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
    if (!dateValue) {
      return {
        dateStr: "",
        timeStr: ""
      };
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return {
        dateStr: "",
        timeStr: ""
      };
    }

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return {
      dateStr: month + "." + day,
      timeStr: hours + ":" + minutes
    };
  }
});
