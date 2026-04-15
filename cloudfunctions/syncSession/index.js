const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event = {}) => {
  try {
    const sessionId = event.session_id;
    if (!sessionId) {
      return {
        code: 1,
        message: "缺少 session_id"
      };
    }

    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;

    await db.collection("sessions").doc(sessionId).update({
      data: {
        openid,
        messages: Array.isArray(event.messages) ? event.messages : [],
        current_mood: event.current_mood || "",
        current_favorability: Number(event.current_favorability || 0),
        updated_at: db.serverDate()
      }
    });

    return {
      code: 0,
      data: {
        session_id: sessionId
      }
    };
  } catch (error) {
    return {
      code: 1,
      message: error.message || "同步会话失败"
    };
  }
};
