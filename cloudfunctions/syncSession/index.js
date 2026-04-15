const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function clampFavorability(value) {
  const numericValue = Number(value || 0);
  return Math.max(0, Math.min(100, numericValue));
}

function normalizeMessages(messages) {
  return (Array.isArray(messages) ? messages : []).map((item) => ({
    role: item && item.role === "assistant" ? "assistant" : "user",
    name: item && item.name ? String(item.name) : "",
    content: item && item.content ? String(item.content) : "",
    timestamp: item && item.timestamp ? Number(item.timestamp) : Date.now()
  }));
}

exports.main = async (event = {}) => {
  try {
    const sessionId = event.session_id;
    if (!sessionId) {
      return {
        code: -1,
        message: "缺少 session_id"
      };
    }

    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    const sessionRes = await db.collection("sessions").where({ _id: sessionId }).limit(1).get();
    const session = sessionRes.data[0];

    if (!session) {
      return {
        code: -1,
        message: "会话不存在"
      };
    }

    if (session.openid !== openid) {
      return {
        code: -1,
        message: "无权更新该会话"
      };
    }

    await db.collection("sessions").doc(sessionId).update({
      data: {
        messages: normalizeMessages(event.messages),
        current_mood: event.current_mood || "",
        current_favorability: clampFavorability(event.current_favorability),
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
      code: -1,
      message: error.message || "同步会话失败"
    };
  }
};
