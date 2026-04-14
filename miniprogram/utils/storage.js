const STORAGE_KEYS = {
  activeSessions: "if-so-reply/active-sessions",
  completedHistory: "if-so-reply/completed-history"
};

function getStorageSync(key, fallback) {
  try {
    const value = wx.getStorageSync(key);
    if (value === undefined || value === null || value === "") {
      return fallback;
    }
    return value;
  } catch (error) {
    return fallback;
  }
}

function setStorageSync(key, value) {
  try {
    wx.setStorageSync(key, value);
  } catch (error) {}
}

function getActiveSessionMap() {
  return getStorageSync(STORAGE_KEYS.activeSessions, {});
}

function saveActiveSessionMap(map) {
  setStorageSync(STORAGE_KEYS.activeSessions, map);
}

function getCompletedHistory() {
  return getStorageSync(STORAGE_KEYS.completedHistory, []);
}

function saveCompletedHistory(records) {
  setStorageSync(STORAGE_KEYS.completedHistory, records);
}

module.exports = {
  STORAGE_KEYS,
  getStorageSync,
  setStorageSync,
  getActiveSessionMap,
  saveActiveSessionMap,
  getCompletedHistory,
  saveCompletedHistory
};
