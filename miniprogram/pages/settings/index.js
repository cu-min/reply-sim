const { getSettings, saveSettings, buildThemeStyle } = require("../../utils/settings");

const CLEARABLE_KEYS = ["profile_favorites"];

Page({
  data: {
    statusBarHeight: 0,
    themeStyle: "",
    fontSize: "md",
    eyeCare: false,
  },

  onLoad() {
    const { statusBarHeight = 0 } = wx.getSystemInfoSync();
    const settings = getSettings();
    this.setData({
      statusBarHeight,
      themeStyle: buildThemeStyle(settings),
      fontSize: settings.fontSize,
      eyeCare: settings.eyeCare,
    });
  },

  handleFontSize(e) {
    const fontSize = e.currentTarget.dataset.size;
    const settings = saveSettings({ fontSize });
    this.setData({ fontSize, themeStyle: buildThemeStyle(settings) });
  },

  handleEyeCare(e) {
    const eyeCare = e.detail.value;
    const settings = saveSettings({ eyeCare });
    this.setData({ eyeCare, themeStyle: buildThemeStyle(settings) });
  },

  handleClearCache() {
    wx.showModal({
      title: "清理缓存",
      content: "将清除本地临时缓存，不影响收藏和对话数据",
      confirmText: "清理",
      confirmColor: "#8b5a5a",
      success: ({ confirm }) => {
        if (!confirm) return;
        CLEARABLE_KEYS.forEach(key => {
          try { wx.removeStorageSync(key); } catch (e) {}
        });
        wx.showToast({ title: "缓存已清理", icon: "success" });
      }
    });
  },

  handlePrivacy() {
    wx.navigateTo({ url: "/pages/privacy/index" });
  },

  handleAbout() {
    wx.navigateTo({ url: "/pages/about/index" });
  },

  handleBack() {
    wx.navigateBack();
  }
});
