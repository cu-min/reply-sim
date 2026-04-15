const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function normalizeEndingText(rawEndingText) {
  const endingText = rawEndingText || {};
  return {
    relationship_result: endingText.relationship_result || "",
    key_behavior_feedback: endingText.key_behavior_feedback || "",
    missed_branch_hint: endingText.missed_branch_hint || "",
    literary_closing: endingText.literary_closing || ""
  };
}

function isCompleteEndingText(endingText) {
  return [
    endingText.relationship_result,
    endingText.key_behavior_feedback,
    endingText.missed_branch_hint,
    endingText.literary_closing
  ].every((item) => Boolean(String(item || "").trim()));
}

exports.main = async (event = {}) => {
  try {
    const {
      session_id: sessionId,
      scenario_id: scenarioId,
      ending_id: endingId,
      ending_type: endingType,
      ending_label: endingLabel,
      badge_label: badgeLabel,
      ending_text: rawEndingText
    } = event;
    const endingText = normalizeEndingText(rawEndingText);

    if (!sessionId || !scenarioId || !endingType || !isCompleteEndingText(endingText)) {
      return {
        code: -1,
        message: "结局参数不完整"
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
        message: "无权保存该会话结局"
      };
    }

    if (session.scenario_id !== scenarioId) {
      return {
        code: -1,
        message: "结局与会话剧本不匹配"
      };
    }

    const existingRes = await db.collection("endings").where({ session_id: sessionId, openid }).limit(1).get();
    const existingEnding = existingRes.data[0];

    if (existingEnding) {
      await db.collection("endings").doc(existingEnding._id).update({
        data: {
          ending_id: endingId || existingEnding.ending_id || "",
          ending_type: endingType,
          ending_label: endingLabel || existingEnding.ending_label || endingType,
          badge_label: badgeLabel || existingEnding.badge_label || endingLabel || endingType,
          ending_text: endingText
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
          _id: existingEnding._id,
          duplicated: true
        }
      }
    }

    const result = await db.collection("endings").add({
      data: {
        openid,
        scenario_id: scenarioId,
        session_id: sessionId,
        ending_id: endingId || "",
        ending_type: endingType,
        ending_label: endingLabel || endingType,
        badge_label: badgeLabel || endingLabel || endingType,
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
      code: -1,
      message: error.message || "保存结局失败"
    };
  }
};
