async function callCloud(name, data) {
  try {
    if (!wx.cloud || !wx.cloud.callFunction) {
      console.error("[cloud-service] wx.cloud 不可用");
      const initError = new Error("云开发未初始化");
      initError.cloudCode = "CLOUD_NOT_INITIALIZED";
      throw initError;
    }

    const res = await wx.cloud.callFunction({
      name,
      data: data || {}
    });

    const result = typeof res.result === "undefined" ? null : res.result;

    if (result && result.code === 0) {
      return result.data;
    }

    const error = new Error((result && result.message) || "云函数调用失败");
    error.cloudCode = result && result.error_code ? result.error_code : "";
    error.cloudData = result && result.data ? result.data : null;
    throw error;
  } catch (error) {
    console.error("[cloud-service] " + name + " 失败:", error.message || error);
    throw error;
  }
}

module.exports = {
  callCloud
};
