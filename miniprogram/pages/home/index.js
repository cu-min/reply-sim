const { getCategories, getScriptList } = require("../../services/script-service");

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

  loadPageData() {
    const selectedCategory = this.data.selectedCategory || "全部";
    const categories = getCategories();
    const allScripts = getScriptList("全部");
    const scripts = getScriptList(selectedCategory);

    this.setData({
      categories,
      featuredScripts: allScripts.slice(0, 3),
      scripts,
      isEmpty: scripts.length === 0
    });
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
