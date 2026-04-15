async function callCloud(name, data) {
  console.log("[cloud-service] 开始调用:", name, data);

  try {
    if (!wx.cloud || !wx.cloud.callFunction) {
      console.error("[cloud-service] wx.cloud 不可用");
      throw new Error("云开发未初始化");
    }

    console.log("[cloud-service] wx.cloud 可用，发起请求...");

    const res = await wx.cloud.callFunction({
      name,
      data: data || {}
    });

    console.log("[cloud-service] " + name + " 原始返回:", JSON.stringify(res.result ?? null).slice(0, 500));

    if (res.result && res.result.code === 0) {
      return res.result.data;
    }

    throw new Error((res.result && res.result.message) || "云函数调用失败");
  } catch (error) {
    console.error("[cloud-service] " + name + " 失败:", error.message || error);
    throw error;
  }
}

module.exports = {
  callCloud
};