const { getScriptDetail } = require("../../services/script-service");
const { createSession } = require("../../services/session-service");

Page({
  data: {
    script: null,
    loadState: "loading",
    errorMessage: ""
  },

  async onLoad(query) {
    const scriptId = query.scriptId;
    wx.showLoading({
      title: "加载中"
    });

    const script = await getScriptDetail(scriptId);
    wx.hideLoading();

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

  async handleStartChat() {
    const script = this.data.script;
    if (!script) {
      return;
    }

    let cloudSessionId = "";

    try {
      cloudSessionId = await createSession(script.id);
    } catch (error) {
      wx.showToast({
        title: "云端会话未创建，先进入本地体验",
        icon: "none"
      });
    }

    wx.navigateTo({
      url: "/pages/chat/index?scriptId=" + script.id + (cloudSessionId ? "&cloudSessionId=" + cloudSessionId : "")
    });
  },

  handleBackHome() {
    wx.switchTab({
      url: "/pages/home/index"
    });
  }
});
