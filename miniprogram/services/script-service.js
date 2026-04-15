const { callCloud } = require("./cloud-service");
const { getCompletedHistory, getStorageSync, setStorageSync } = require("../utils/storage");

const CACHE_KEYS = {
  scriptList: "cache_scenarios_",
  scriptDetail: "cache_scenario_detail_",
  categories: "cache_scenario_categories"
};

function normalizeCategory(category) {
  return category || "全部";
}

function getUnlockedEndingIds(scriptId) {
  return Array.from(
    new Set(
      getCompletedHistory()
        .filter((item) => item.scriptId === scriptId)
        .map((item) => item.endingId)
    )
  );
}

function toMeta(tags) {
  return (tags || []).join(" | ");
}

function toDetail(scenario) {
  return {
    id: scenario.id,
    title: scenario.title,
    category: scenario.category,
    openingLine: scenario.cover.opening_message,
    meta: toMeta(scenario.cover.tags),
    blurb: scenario.cover.subtitle,
    tags: scenario.cover.tags || [],
    unlockedEndingIds: getUnlockedEndingIds(scenario.id),
    background: scenario.background,
    scenePrompt: scenario.scene_prompt,
    availableEndingLabels: (scenario.possible_endings || []).map((item) => item.label),
    possibleEndings: scenario.possible_endings || [],
    character: {
      name: scenario.character.name,
      age: String(scenario.character.age),
      gender: scenario.character.gender,
      relationship: scenario.character.relationship,
      archetype: scenario.character.archetype,
      occupation: scenario.character.occupation,
      personalityTags: (scenario.cover.tags || []).slice(0, 2),
      speakingStyle: scenario.character.speaking_style,
      currentAttitude: scenario.character.current_attitude,
      initialMood: scenario.character.initial_mood,
      initialFavorability: scenario.character.initial_favorability
    }
  };
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
    unlockedEndingIds: detail.unlockedEndingIds
  };
}

function getListCacheKey(category) {
  return CACHE_KEYS.scriptList + normalizeCategory(category);
}

function updateCategoriesFromScripts(scripts) {
  const categories = ["全部"].concat(
    Array.from(new Set((scripts || []).map((item) => item.category).filter(Boolean)))
  );
  setStorageSync(CACHE_KEYS.categories, categories);
  return categories;
}

function getCategories() {
  return getStorageSync(CACHE_KEYS.categories, ["全部"]);
}

async function getScriptList(category) {
  const targetCategory = normalizeCategory(category);

  try {
    const data = await callCloud("getScenarios", {
      category: targetCategory === "全部" ? "" : targetCategory
    });
    const scripts = (data || []).map((item) => toSummary(toDetail(item)));

    setStorageSync(getListCacheKey(targetCategory), scripts);
    if (targetCategory === "全部") {
      updateCategoriesFromScripts(scripts);
    }

    return scripts;
  } catch (error) {
    const cached = getStorageSync(getListCacheKey(targetCategory), null);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function getScriptDetail(scriptId) {
  if (!scriptId) {
    return null;
  }

  try {
    const data = await callCloud("getScenarioDetail", {
      scenario_id: scriptId
    });
    const detail = toDetail(data);
    setStorageSync(CACHE_KEYS.scriptDetail + scriptId, detail);
    return detail;
  } catch (error) {
    return getStorageSync(CACHE_KEYS.scriptDetail + scriptId, null);
  }
}

async function getScriptsByIds(ids) {
  const all = await getScriptList("全部");
  return (ids || []).map((id) => all.find((item) => item.id === id)).filter(Boolean);
}

async function getEndingResult(scriptId, endingId) {
  const detail = await getScriptDetail(scriptId);
  if (!detail) {
    return null;
  }

  const ending = (detail.possibleEndings || []).find((item) => item.id === endingId);
  if (!ending) {
    return null;
  }

  return {
    id: ending.id,
    scriptId,
    title: ending.label,
    impactLine: ending.impact_line,
    relationSummary: ending.relationship_result,
    keyFeedback: ending.key_behavior_feedback,
    missedBranchHint: ending.missed_branch_hint,
    closingLine: ending.literary_closing,
    badgeLabel: ending.badge_label
  };
}

module.exports = {
  getCategories,
  getScriptList,
  getScriptDetail,
  getScriptsByIds,
  getEndingResult
};
