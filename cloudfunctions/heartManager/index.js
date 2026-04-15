const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event = {}) => {
  const { action } = event;
  const openid = cloud.getWXContext().OPENID;

  try {
    const userRes = await db.collection("users").where({ openid }).limit(1).get();
    if (!userRes.data || userRes.data.length === 0) {
      return {
        code: -1,
        message: "用户不存在"
      };
    }

    const user = userRes.data[0];

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
        if (Number(user.hearts || 0) <= 0) {
          return {
            code: -1,
            message: "心动值不足",
            data: { hearts: 0 }
          };
        }

        await db.collection("users").doc(user._id).update({
          data: {
            hearts: _.inc(-1)
          }
        });

        return {
          code: 0,
          data: {
            hearts: Number(user.hearts || 0) - 1
          }
        };

      case "reward": {
        const source = event.source || "share_friend";
        const today = new Date().toISOString().slice(0, 10);
        const rewardKey = "share_reward_" + today;
        const todayRewards = Number(user[rewardKey] || 0);

        if (todayRewards >= 3) {
          return {
            code: 0,
            data: {
              hearts: Number(user.hearts || 0),
              rewarded: false,
              message: "今日分享奖励已领完，明天再来"
            }
          };
        }

        const rewardAmount = source === "share_timeline" ? 2 : 1;

        await db.collection("users").doc(user._id).update({
          data: {
            hearts: _.inc(rewardAmount),
            [rewardKey]: _.inc(1)
          }
        });

        return {
          code: 0,
          data: {
            hearts: Number(user.hearts || 0) + rewardAmount,
            rewarded: true,
            rewardAmount,
            message: "获得 " + rewardAmount + " 点心动值"
          }
        };
      }

      default:
        return {
          code: -1,
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
