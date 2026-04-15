const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event = {}) => {
  try {
    const query = db.collection("scenarios");
    const category = (event.category || "").trim();
    const filteredQuery = category ? query.where({ category }) : query;

    const { data } = await filteredQuery
      .field({
        id: true,
        title: true,
        category: true,
        cover: true
      })
      .get();

    return {
      code: 0,
      data
    };
  } catch (error) {
    return {
      code: -1,
      message: error.message || "获取剧本列表失败"
    };
  }
};
