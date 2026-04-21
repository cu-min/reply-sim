const { getCloudConfig } = require("./config/env");
const { login } = require("./services/user-service");

App({
  globalData: {
    brandName: "如果这样回",
    userInfo: null,
    lastEnding: null,
    runtimeEnv: ""
  },

  async onLaunch() {
    try {
      if (wx.cloud && wx.cloud.init) {
        const cloudConfig = getCloudConfig();
        wx.cloud.init({
          env: cloudConfig.env,
          traceUser: cloudConfig.traceUser
        });
        this.globalData.runtimeEnv = cloudConfig.runtime;
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
