const { callCloud } = require("./cloud-service");
const { getCompletedHistory, getStorageSync, setStorageSync } = require("../utils/storage");

const USER_CACHE_KEY = "cache_user_info";
const PROFILE_CACHE_KEY = "cache_user_profile";

function buildLocalHistory() {
  return getCompletedHistory().sort((left, right) => right.playedAtTs - left.playedAtTs).slice(0, 10);
}

function buildLocalProfile() {
  const history = buildLocalHistory();
  const experiencedCount = Array.from(new Set(history.map((item) => item.scriptId))).length;
  const unlockedEndingCount = Array.from(
    new Set(history.map((item) => item.scriptId + ":" + item.endingId))
  ).length;
  const totalTurns = history.reduce((sum, item) => sum + (item.turnCount || 0), 0);
  const user = getStorageSync(USER_CACHE_KEY, {});

  return {
    id: user.openid || "local-user",
    nickname: user.nickname || "匿名旅人",
    signature: "有些话，先在这里试着说。",
    heartBalance: typeof user.hearts === "number" ? user.hearts : 5,
    favoriteScriptIds: [],
    history,
    stats: {
      experiencedCount,
      unlockedEndingCount,
      totalTurns
    }
  };
}

function mapProfile(cloudProfile) {
  const user = (cloudProfile && cloudProfile.user) || {};

  return {
    id: user.openid || "cloud-user",
    nickname: user.nickname || "匿名旅人",
    signature: "有些话，先在这里试着说。",
    heartBalance: typeof user.hearts === "number" ? user.hearts : 5,
    favoriteScriptIds: [],
    history: (cloudProfile && cloudProfile.history) || [],
    stats: Object.assign(
      {
        experiencedCount: 0,
        unlockedEndingCount: 0,
        totalTurns: 0
      },
      cloudProfile && cloudProfile.stats
    )
  };
}

async function login() {
  try {
    const user = await callCloud("login");
    setStorageSync(USER_CACHE_KEY, user);
    return user;
  } catch (error) {
    return getStorageSync(USER_CACHE_KEY, null);
  }
}

function getLocalUser() {
  return getStorageSync(USER_CACHE_KEY, null);
}

async function getUserProfile() {
  try {
    const data = await callCloud("getUserProfile");
    const profile = mapProfile(data);
    setStorageSync(PROFILE_CACHE_KEY, profile);
    return profile;
  } catch (error) {
    const cached = getStorageSync(PROFILE_CACHE_KEY, null);
    return cached || buildLocalProfile();
  }
}

module.exports = {
  login,
  getLocalUser,
  getUserProfile
};
