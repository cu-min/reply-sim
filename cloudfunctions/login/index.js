const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  try {
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;

    const { data } = await db.collection("users").where({ openid }).get();

    if (data.length > 0) {
      return {
        code: 0,
        data: Object.assign({}, data[0], {
          isNew: false
        })
      };
    }

    const newUser = {
      openid,
      nickname: "匿名旅人",
      avatar: "",
      hearts: 5,
      created_at: db.serverDate()
    };

    const result = await db.collection("users").add({ data: newUser });

    return {
      code: 0,
      data: Object.assign({}, newUser, {
        _id: result._id,
        isNew: true
      })
    };
  } catch (error) {
    return {
      code: -1,
      message: error.message || "登录失败"
    };
  }
};
