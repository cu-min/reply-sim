const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const DEFAULT_USER_HEARTS = 5;

function getUserDocId(openid) {
  return "user_" + openid;
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
    return {
      user: Object.assign({}, userDoc.data, { _id: userDocId }),
      userRef
    };
  }

  const legacyUsers = await db.collection("users").where({ openid }).limit(1).get();
  const legacyUser = legacyUsers.data[0] || null;
  const userRecord = buildCanonicalUserRecord(openid, legacyUser);

  await userRef.set({
    data: userRecord
  });

  return {
    user: Object.assign({}, userRecord, { _id: userDocId }),
    userRef
  };
}

exports.main = async (event = {}) => {
  const { action } = event;
  const openid = cloud.getWXContext().OPENID;

  try {
    const { user } = await ensureCanonicalUser(openid);

    switch (action) {
      case "check":
        return {
          code: 0,
          data: {
            hearts: Number(user.hearts || 0),
            canPlay: Number(user.hearts || 0) > 0
          }
        };

      case "consume":
        return {
          code: -1,
          error_code: "HEART_CONSUME_DEPRECATED",
          message: "旧版前端扣减链路已停用，请改走 chatEngine 首轮发送扣减"
        };

      case "reward":
        // 当前平台拿不到可靠的“真实分享成功”信号，先关闭自动发奖能力，
        // 避免保留“点击分享按钮即发奖”的可刷路径。后续如接入可核验凭证，
        // 再在服务端补上“每日最多 1 次、每次 +1”的正式奖励逻辑。
        return {
          code: 0,
          data: {
            hearts: Number(user.hearts || 0),
            rewarded: false,
            disabled: true,
            message: "当前版本暂未开启自动分享奖励"
          }
        };

      default:
        return {
          code: -1,
          error_code: "UNKNOWN_ACTION",
          message: "未知操作"
        };
    }
  } catch (error) {
    console.error("[heartManager]", error);
    return {
      code: -1,
      message: error.message || "心动值操作失败"
    };
  }
};
