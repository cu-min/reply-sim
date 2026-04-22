const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { type, content, contact } = event;

  if (!content || !content.trim()) {
    return { code: -1, message: "反馈内容不能为空" };
  }

  await db.collection("feedbacks").add({
    data: {
      openid: OPENID,
      type: type || "其他",
      content: content.trim(),
      contact: contact ? contact.trim() : "",
      created_at: db.serverDate(),
    },
  });

  return { code: 0, data: { success: true } };
};
