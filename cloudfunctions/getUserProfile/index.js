const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const DEFAULT_USER_HEARTS = 5;

function getUserDocId(openid) {
  return "user_" + openid;
}

function normalizeDate(rawValue) {
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

function normalizeUserHearts(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return DEFAULT_USER_HEARTS;
  }

  return Math.max(0, numericValue);
}

function buildCanonicalUserRecord(openid, source) {
  const user = Object.assign({}, source || {});
  delete user._id;

  return Object.assign(user, {
    openid,
    nickname: user.nickname || "匿名旅人",
    avatar: user.avatar || "",
    hearts: normalizeUserHearts(user.hearts),
    created_at: user.created_at || db.serverDate(),
    updated_at: db.serverDate()
  });
}

async function ensureCanonicalUser(openid) {
  const userDocId = getUserDocId(openid);
  const userRef = db.collection("users").doc(userDocId);
  const userDoc = await userRef.get().catch(() => ({ data: null }));

  if (userDoc && userDoc.data) {
    return userDoc.data;
  }

  const legacyUsers = await db.collection("users").where({ openid }).limit(1).get();
  const legacyUser = legacyUsers.data[0] || null;
  const userRecord = buildCanonicalUserRecord(openid, legacyUser);

  await userRef.set({
    data: userRecord
  });

  return userRecord;
}

exports.main = async () => {
  try {
    const openid = cloud.getWXContext().OPENID;
    const user = await ensureCanonicalUser(openid);

    const [endingsRes, sessionsRes] = await Promise.all([
      db.collection("endings").where({ openid }).get(),
      db.collection("sessions").where({ openid }).orderBy("updated_at", "desc").get()
    ]);

    const endings = endingsRes.data || [];
    const sessions = sessionsRes.data || [];

    const scenarioIds = Array.from(new Set(sessions.map((item) => item.scenario_id).filter(Boolean)));
    let scenarios = [];

    if (scenarioIds.length > 0) {
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

    const totalRounds = Math.floor(
      sessions.reduce((sum, item) => sum + (Array.isArray(item.messages) ? item.messages.length : 0), 0) / 2
    );

    const recentSessions = sessions.slice(0, 20).map((session) => {
      const updatedAt = normalizeDate(session.updated_at) || normalizeDate(session.created_at);
      const linkedScenario = scenarioMap[session.scenario_id] || {};
      const linkedEnding = endingMap[session._id] || {};

      return {
        _id: session._id,
        scenario_id: session.scenario_id,
        title: linkedScenario.title || session.scenario_id || "未命名剧本",
        status: session.status || "ongoing",
        endingId: linkedEnding.ending_id || "",
        endingLabel: linkedEnding.ending_label || linkedEnding.badge_label || linkedEnding.ending_type || "",
        updated_at: updatedAt ? updatedAt.toISOString() : "",
        created_at: normalizeDate(session.created_at) ? normalizeDate(session.created_at).toISOString() : ""
      };
    });

    return {
      code: 0,
      data: {
        nickname: user.nickname || "匿名旅人",
        avatar: user.avatar || "",
        hearts: Number(user.hearts || 0),
        scenarioCount: scenarioIds.length,
        endingCount: endings.length,
        totalRounds,
        recentSessions
      }
    };
  } catch (error) {
    return {
      code: -1,
      message: error.message || "获取用户资料失败"
    };
  }
};
