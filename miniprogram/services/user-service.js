const { callCloud } = require("./cloud-service");
const { getCompletedHistory, getStorageSync, setStorageSync } = require("../utils/storage");

const USER_CACHE_KEY = "cache_user_info";
const PROFILE_CACHE_KEY = "cache_user_profile";

function buildLocalHistory() {
  return getCompletedHistory().sort((left, right) => right.playedAtTs - left.playedAtTs).slice(0, 10);
}

function buildLocalProfile() {
  const history = buildLocalHistory();
  const scenarioCount = Array.from(new Set(history.map((item) => item.scriptId))).length;
  const endingCount = Array.from(
    new Set(history.map((item) => item.scriptId + ":" + item.endingId))
  ).length;
  const totalRounds = history.reduce((sum, item) => sum + (item.turnCount || 0), 0);
  const user = getStorageSync(USER_CACHE_KEY, {});

  return {
    nickname: user.nickname || "匿名旅人",
    avatar: user.avatar || "",
    hearts: typeof user.hearts === "number" ? user.hearts : 5,
    scenarioCount,
    endingCount,
    totalRounds,
    recentSessions: history.map((item) => ({
      _id: item.id || "",
      scenario_id: item.scriptId || "",
      title: item.scriptTitle || item.scriptId || "未命名剧本",
      status: "ended",
      endingId: item.endingId || "",
      endingLabel: item.endingTitle || item.badgeLabel || "已完成",
      updated_at: item.playedAt || "",
      created_at: item.playedAt || ""
    }))
  };
}

function mapProfile(cloudProfile) {
  const profile = cloudProfile || {};

  return {
    nickname: profile.nickname || "匿名旅人",
    avatar: profile.avatar || "",
    hearts: typeof profile.hearts === "number" ? profile.hearts : 5,
    scenarioCount: Number(profile.scenarioCount || 0),
    endingCount: Number(profile.endingCount || 0),
    totalRounds: Number(profile.totalRounds || 0),
    recentSessions: Array.isArray(profile.recentSessions) ? profile.recentSessions : []
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
