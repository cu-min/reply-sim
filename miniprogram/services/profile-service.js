const { profileSeed } = require("../mock/content");
const { getCompletedHistory } = require("../utils/storage");

function getProfile() {
  const runtimeHistory = getCompletedHistory();
  const mergedHistory = profileSeed.seedHistory
    .concat(runtimeHistory)
    .sort((left, right) => right.playedAtTs - left.playedAtTs);

  const experiencedCount = Array.from(new Set(mergedHistory.map((item) => item.scriptId))).length;
  const unlockedEndingCount = Array.from(
    new Set(mergedHistory.map((item) => item.scriptId + ":" + item.endingId))
  ).length;
  const totalTurns = mergedHistory.reduce((sum, item) => sum + item.turnCount, 0);

  return {
    id: profileSeed.id,
    nickname: profileSeed.nickname,
    signature: profileSeed.signature,
    heartBalance: profileSeed.heartBalance,
    favoriteScriptIds: profileSeed.favoriteScriptIds,
    history: mergedHistory,
    stats: {
      experiencedCount,
      unlockedEndingCount,
      totalTurns
    }
  };
}

module.exports = {
  getProfile
};
