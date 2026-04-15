const { getProfile } = require("../../services/profile-service");
const { getScriptsByIds } = require("../../services/script-service");

Page({
  data: {
    profile: null,
    favoriteScripts: [],
    loadState: "loading"
  },

  onLoad() {
    this.loadProfile();
  },

  onShow() {
    this.loadProfile();
  },

  async loadProfile() {
    try {
      wx.showLoading({
        title: "加载中"
      });

      const profile = await getProfile();
      const favoriteScripts = await getScriptsByIds(profile.favoriteScriptIds);

      this.setData({
        profile,
        favoriteScripts,
        loadState: "ready"
      });
    } catch (error) {
      wx.showToast({
        title: "资料加载失败",
        icon: "none"
      });
    } finally {
      wx.hideLoading();
    }
  }
});
