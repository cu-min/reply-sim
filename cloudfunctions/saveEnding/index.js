const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event = {}) => {
  try {
    const { session_id: sessionId, scenario_id: scenarioId, ending_type: endingType, ending_text: endingText } = event;
    if (!sessionId || !scenarioId || !endingType || !endingText) {
      return {
        code: 1,
        message: "结局参数不完整"
      };
    }

    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;

    const result = await db.collection("endings").add({
      data: {
        openid,
        scenario_id: scenarioId,
        session_id: sessionId,
        ending_type: endingType,
        ending_text: endingText,
        created_at: db.serverDate()
      }
    });

    await db.collection("sessions").doc(sessionId).update({
      data: {
        status: "ended",
        updated_at: db.serverDate()
      }
    });

    return {
      code: 0,
      data: {
        _id: result._id
      }
    };
  } catch (error) {
    return {
      code: 1,
      message: error.message || "保存结局失败"
    };
  }
};
