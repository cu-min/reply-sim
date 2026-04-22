const CAT_MOOD = {
  "暗恋": { grad: ["#D4B5A0", "#C49A85"], text: "#6B3A2A", tag: "#C49A85", emoji: "🌙" },
  "前任": { grad: ["#C4AFCA", "#A99AB8"], text: "#4A2A5A", tag: "#A99AB8", emoji: "✨" },
  "社交": { grad: ["#D4C4A0", "#C0A97A"], text: "#4A3A1A", tag: "#C0A97A", emoji: "☕" },
  "职场": { grad: ["#B0BEC5", "#90A4AE"], text: "#2A3A4A", tag: "#90A4AE", emoji: "💼" },
};

const { getFavoritedIds } = require("../../services/favorites-service");

Page({
  data: {
    statusBarHeight: 0,
    scrolled: false,
    categories: [],
    selectedCategory: "全部",
    featuredScripts: [],
    scripts: [],
    isEmpty: false,
    loadHint: "",
    favoritedIds: {}
  },

  onLoad() {
    const { statusBarHeight } = wx.getWindowInfo();
    this.setData({ statusBarHeight });
    this._syncFavoritedIds();
    this.skipNextOnShow = true;
    this.loadPageData();
  },

  onShow() {
    this._syncFavoritedIds();
    if (this.skipNextOnShow) {
      this.skipNextOnShow = false;
      return;
    }
    this.loadPageData();
  },

  _syncFavoritedIds() {
    this.setData({ favoritedIds: getFavoritedIds() });
  },

  onPageScroll({ scrollTop }) {
    const scrolled = scrollTop > 20;
    if (scrolled !== this.data.scrolled) {
      this.setData({ scrolled });
    }
  },

  async loadPageData() {
    const selectedCategory = this.data.selectedCategory || "全部";

    try {
      wx.showLoading({
        title: "加载中"
      });

      const { getScriptList } = require("../../services/script-service");
      const allScripts = await getScriptList("全部");
      const usingLocalFallback = Boolean(allScripts && allScripts.__fallbackSource === "local");
      const categories = ["全部"].concat(
        Array.from(new Set(allScripts.map((item) => item.category).filter(Boolean)))
      );
      const enrich = (list) => list.map((item) => {
        const mood = CAT_MOOD[item.category] || CAT_MOOD["暗恋"];
        return {
          ...item,
          moodBg: `linear-gradient(145deg, ${mood.grad[0]}, ${mood.grad[1]})`,
          moodGrad0: mood.grad[0],
          moodGrad1: mood.grad[1],
          moodTagColor: mood.tag,
          moodText: mood.text,
          emoji: mood.emoji
        };
      });

      const filtered = selectedCategory === "全部"
        ? allScripts
        : allScripts.filter((item) => item.category === selectedCategory);
      const scripts = enrich(filtered);

      this.setData({
        categories,
        featuredScripts: enrich(allScripts.slice(0, 3)),
        scripts,
        isEmpty: scripts.length === 0,
        loadHint: usingLocalFallback ? "当前展示的是本地离线剧本内容，线上数据暂时不可用。" : ""
      });

      if (usingLocalFallback && !this.hasShownLocalFallbackToast) {
        this.hasShownLocalFallbackToast = true;
        wx.showToast({
          title: "当前为离线内容",
          icon: "none"
        });
      }

      if (!usingLocalFallback) {
        this.hasShownLocalFallbackToast = false;
      }
    } catch (error) {
      console.error("[home] loadPageData failed:", error);
      this.setData({
        categories: [],
        featuredScripts: [],
        scripts: [],
        isEmpty: true,
        loadHint: "首页脚本已运行，但线上数据和本地离线内容都没有加载成功。请打开真机调试查看报错。"
      });

      wx.showModal({
        title: "暂时没有拉到剧本列表",
        content: "请检查云开发环境、数据库数据，或打开真机调试查看首页报错。",
        confirmText: "重试",
        success: (res) => {
          if (res.confirm) {
            this.loadPageData();
          }
        }
      });
    } finally {
      wx.hideLoading();
    }
  },

  handleSelectCategory(event) {
    const category = event.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category
    });
    this.loadPageData();
  },

  handleOpenDetail(event) {
    const scriptId = event.currentTarget.dataset.id;
    if (!scriptId) {
      wx.showToast({
        title: "剧本信息缺失",
        icon: "none"
      });
      return;
    }

    wx.navigateTo({
      url: "/pages/script-detail/index?scriptId=" + scriptId
    });
  }
});
