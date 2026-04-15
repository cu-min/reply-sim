const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event = {}) => {
  try {
    const scenarioId = event.scenario_id || event.scriptId;

    if (!scenarioId) {
      return {
        code: -1,
        message: "缺少 scenario_id"
      };
    }

    const { data } = await db.collection("scenarios").where({ id: scenarioId }).limit(1).get();

    if (!data.length) {
      return {
        code: -1,
        message: "剧本不存在"
      };
    }

    return {
      code: 0,
      data: data[0]
    };
  } catch (error) {
    return {
      code: -1,
      message: error.message || "获取剧本详情失败"
    };
  }
};
