const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const PAGE_SIZE = 100;

async function fetchAllScenarios(query) {
  const records = [];
  let offset = 0;

  while (true) {
    const { data } = await query
      .field({
        id: true,
        title: true,
        category: true,
        cover: true
      })
      .skip(offset)
      .limit(PAGE_SIZE)
      .get();

    records.push(...data);

    if (data.length < PAGE_SIZE) {
      break;
    }

    offset += data.length;
  }

  return records;
}

exports.main = async (event = {}) => {
  try {
    const query = db.collection("scenarios");
    const category = (event.category || "").trim();
    const filteredQuery = category ? query.where({ category }) : query;

    return {
      code: 0,
      data: await fetchAllScenarios(filteredQuery)
    };
  } catch (error) {
    return {
      code: -1,
      message: error.message || "获取剧本列表失败"
    };
  }
};
