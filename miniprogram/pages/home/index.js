const { getScriptList } = require("../../services/script-service");

Page({
  data: {
    categories: [],
    selectedCategory: "全部",
    featuredScripts: [],
    scripts: [],
    isEmpty: false
  },

  onLoad() {
    this.loadPageData();
  },

  onShow() {
    this.loadPageData();
  },

  async loadPageData() {
    const selectedCategory = this.data.selectedCategory || "全部";

    try {
      wx.showLoading({
        title: "加载中"
      });

      const allScripts = await getScriptList("全部");
      const categories = ["全部"].concat(
        Array.from(new Set(allScripts.map((item) => item.category).filter(Boolean)))
      );
      const scripts = selectedCategory === "全部"
        ? allScripts
        : allScripts.filter((item) => item.category === selectedCategory);

      this.setData({
        categories,
        featuredScripts: allScripts.slice(0, 3),
        scripts,
        isEmpty: scripts.length === 0
      });
    } catch (error) {
      wx.showToast({
        title: "剧本加载失败",
        icon: "none"
      });

      wx.showModal({
        title: "暂时没有拉到剧本列表",
        content: "请检查云开发环境和数据库数据，稍后可以重新试一次。",
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
