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
  const userRef = db.collection("users").doc(getUserDocId(openid));
  const userDoc = await userRef.get().catch(() => ({ data: null }));

  if (userDoc && userDoc.data) {
    return {
      user: userDoc.data,
      isNew: false
    };
  }

  const legacyUsers = await db.collection("users").where({ openid }).limit(1).get();
  const legacyUser = legacyUsers.data[0] || null;
  const userRecord = buildCanonicalUserRecord(openid, legacyUser);

  await userRef.set({
    data: userRecord
  });

  return {
    user: userRecord,
    isNew: !legacyUser
  };
}

exports.main = async () => {
  try {
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    const { user, isNew } = await ensureCanonicalUser(openid);

    return {
      code: 0,
      data: Object.assign({}, user, {
        _id: getUserDocId(openid),
        isNew
      })
    };
  } catch (error) {
    return {
      code: -1,
      message: error.message || "登录失败"
    };
  }
};
