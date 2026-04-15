const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event = {}) => {
  try {
    const scenarioId = event.scenario_id;
    if (!scenarioId) {
      return {
        code: 1,
        message: "缺少 scenario_id"
      };
    }

    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    const { data } = await db.collection("scenarios").where({ id: scenarioId }).limit(1).get();

    if (!data.length) {
      return {
        code: 1,
        message: "剧本不存在"
      };
    }

    const scenario = data[0];
    const session = {
      openid,
      scenario_id: scenarioId,
      messages: [],
      current_mood: scenario.character.initial_mood || "",
      current_favorability: Number(scenario.character.initial_favorability || 0),
      status: "ongoing",
      created_at: db.serverDate(),
      updated_at: db.serverDate()
    };

    const result = await db.collection("sessions").add({ data: session });

    return {
      code: 0,
      data: {
        _id: result._id
      }
    };
  } catch (error) {
    return {
      code: 1,
      message: error.message || "创建会话失败"
    };
  }
};
