const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function getUserDocId(openid) {
  return "user_" + openid;
}

exports.main = async (event = {}) => {
  try {
    const openid = cloud.getWXContext().OPENID;
    if (!openid) return { code: -1, message: "未登录" };

    const { script } = event;
    if (!script || !script.id) return { code: -1, message: "缺少 script 参数" };

    const userRef = db.collection("users").doc(getUserDocId(openid));
    const userDoc = await userRef.get().catch(() => ({ data: null }));
    if (!userDoc || !userDoc.data) return { code: -1, message: "用户不存在" };

    const favorites = userDoc.data.favorites || [];
    const existIdx = favorites.findIndex(f => f.id === script.id);

    let next, nowFavorited;
    if (existIdx >= 0) {
      next = favorites.filter(f => f.id !== script.id);
      nowFavorited = false;
    } else {
      const entry = {
        id: script.id,
        title: script.title || script.id,
        category: script.category || "",
        openingLine: script.openingLine || "",
        blurb: script.blurb || "",
        savedAt: Date.now()
      };
      next = [entry, ...favorites];
      nowFavorited = true;
    }

    await userRef.update({ data: { favorites: next } });
    return { code: 0, favorited: nowFavorited };
  } catch (error) {
    return { code: -1, message: error.message || "操作失败" };
  }
};
