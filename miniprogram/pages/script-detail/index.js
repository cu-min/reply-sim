const { getScriptDetail } = require("../../services/script-service");

Page({
  data: {
    script: null,
    loadState: "loading",
    errorMessage: ""
  },

  onLoad(query) {
    const scriptId = query.scriptId;
    const script = getScriptDetail(scriptId);

    if (!script) {
      wx.showToast({
        title: "剧本不存在",
        icon: "none"
      });
      this.setData({
        script: null,
        loadState: "error",
        errorMessage: "没有找到这个剧本，可能是链接失效或参数不完整。"
      });
      return;
    }

    this.setData({
      script,
      loadState: "ready",
      errorMessage: ""
    });
  },

  handleStartChat() {
    const script = this.data.script;
    if (!script) {
      return;
    }

    wx.navigateTo({
      url: "/pages/chat/index?scriptId=" + script.id
    });
  },

  handleBackHome() {
    wx.switchTab({
      url: "/pages/home/index"
    });
  }
});
