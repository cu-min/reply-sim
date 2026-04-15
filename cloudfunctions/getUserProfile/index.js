const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function formatPlayedAt(rawDate) {
  const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return month + "-" + day + " " + hour + ":" + minute;
}

function normalizeServerDate(rawValue) {
  if (!rawValue) {
    return null;
  }

  if (rawValue instanceof Date) {
    return rawValue;
  }

  if (rawValue.$date) {
    return new Date(rawValue.$date);
  }

  return new Date(rawValue);
}

exports.main = async () => {
  try {
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;

    const [userRes, endingsRes, sessionsRes] = await Promise.all([
      db.collection("users").where({ openid }).limit(1).get(),
      db.collection("endings").where({ openid }).get(),
      db.collection("sessions").where({ openid }).orderBy("updated_at", "desc").get()
    ]);

    const user = userRes.data[0] || {
      openid,
      nickname: "匿名旅人",
      avatar: "",
      hearts: 5
    };
    const endings = endingsRes.data || [];
    const sessions = sessionsRes.data || [];

    const scenarioIds = Array.from(new Set(sessions.map((item) => item.scenario_id).filter(Boolean)));
    let scenarios = [];
    if (scenarioIds.length) {
      const _ = db.command;
      const scenarioRes = await db.collection("scenarios").where({ id: _.in(scenarioIds) }).get();
      scenarios = scenarioRes.data || [];
    }

    const scenarioMap = scenarios.reduce((map, item) => {
      map[item.id] = item;
      return map;
    }, {});

    const endingMap = endings.reduce((map, item) => {
      map[item.session_id] = item;
      return map;
    }, {});

    const history = sessions.slice(0, 10).map((session) => {
      const scenario = scenarioMap[session.scenario_id] || {};
      const ending = endingMap[session._id] || {};
      const updatedAt = normalizeServerDate(session.updated_at) || normalizeServerDate(session.created_at);
      const endingText = ending.ending_text || {};

      return {
        id: "history-" + session._id,
        sessionId: session._id,
        scriptId: session.scenario_id,
        scriptTitle: scenario.title || "未命名剧本",
        endingId: ending.ending_type || "",
        endingTitle: ending.ending_type || "",
        endingSummary: endingText.relationship_result || endingText.key_behavior_feedback || "这段对话还没有留下结局摘要。",
        badgeLabel: ending.ending_type || "进行中",
        playedAt: formatPlayedAt(updatedAt),
        playedAtTs: updatedAt ? updatedAt.getTime() : 0,
        turnCount: Array.isArray(session.messages) ? session.messages.length : 0
      };
    });

    const experiencedCount = Array.from(new Set(endings.map((item) => item.scenario_id))).length;
    const unlockedEndingCount = endings.length;
    const totalTurns = sessions.reduce((sum, item) => {
      const messageCount = Array.isArray(item.messages) ? item.messages.length : 0;
      return sum + messageCount;
    }, 0);

    return {
      code: 0,
      data: {
        user,
        stats: {
          experiencedCount,
          unlockedEndingCount,
          totalTurns
        },
        history
      }
    };
  } catch (error) {
    return {
      code: 1,
      message: error.message || "获取用户资料失败"
    };
  }
};
