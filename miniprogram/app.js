const { login } = require("./services/user-service");

App({
  globalData: {
    brandName: "如果这样回",
    userInfo: null,
    lastEnding: null
  },

  async onLaunch() {
    try {
      if (wx.cloud && wx.cloud.init) {
        wx.cloud.init({
          env: "ran-1g26gduhce2045d3",
          traceUser: true
        });
      }
    } catch (error) {
      console.error("[app] 云开发初始化失败:", error);
    }

    try {
      const user = await login();
      if (user) {
        this.globalData.userInfo = user;
      }
    } catch (error) {
      console.error("[app] 静默登录失败:", error);
    }
  }
});
