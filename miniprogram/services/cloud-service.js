async function callCloud(name, data) {
  try {
    if (!wx.cloud || !wx.cloud.callFunction) {
      throw new Error("云开发未初始化");
    }

    const res = await wx.cloud.callFunction({
      name,
      data: data || {}
    });

    if (res.result && res.result.code === 0) {
      return res.result.data;
    }

    throw new Error((res.result && res.result.message) || "云函数调用失败");
  } catch (error) {
    console.error("[cloud-service] " + name + " 失败:", error);
    throw error;
  }
}

module.exports = {
  callCloud
};
