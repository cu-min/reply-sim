const { endings, scriptDetails } = require("../mock/content");
const { getCompletedHistory } = require("../utils/storage");

function getUnlockedEndingIds(scriptId, seededIds) {
  const records = getCompletedHistory().filter((item) => item.scriptId === scriptId);
  const runtimeIds = records.map((item) => item.endingId);
  return Array.from(new Set([].concat(seededIds, runtimeIds)));
}

function toSummary(detail) {
  return {
    id: detail.id,
    title: detail.title,
    category: detail.category,
    openingLine: detail.openingLine,
    meta: detail.meta,
    blurb: detail.blurb,
    tags: detail.tags,
    unlockedEndingIds: getUnlockedEndingIds(detail.id, detail.unlockedEndingIds)
  };
}

function getCategories() {
  return ["全部", "前任", "恋爱", "职场"];
}

function getScriptList(category) {
  const targetCategory = category || "全部";
  const allSummaries = scriptDetails.map(toSummary);
  if (targetCategory === "全部") {
    return allSummaries;
  }
  return allSummaries.filter((item) => item.category === targetCategory);
}

function getScriptDetail(scriptId) {
  const detail = scriptDetails.find((item) => item.id === scriptId);
  if (!detail) {
    return null;
  }
  return Object.assign({}, detail, {
    unlockedEndingIds: getUnlockedEndingIds(detail.id, detail.unlockedEndingIds)
  });
}

function getScriptsByIds(ids) {
  return ids
    .map((id) => getScriptDetail(id))
    .filter(Boolean)
    .map(toSummary);
}

function getEndingResult(scriptId, endingId) {
  return endings.find((item) => item.scriptId === scriptId && item.id === endingId) || null;
}

module.exports = {
  getCategories,
  getScriptList,
  getScriptDetail,
  getScriptsByIds,
  getEndingResult
};
