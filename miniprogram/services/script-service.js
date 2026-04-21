const { callCloud } = require("./cloud-service");
const { getCompletedHistory, getStorageSync, setStorageSync } = require("../utils/storage");

const CACHE_KEYS = {
  scriptList: "cache_scenarios_",
  scriptDetail: "cache_scenario_detail_",
  categories: "cache_scenario_categories"
};

function getLocalScenarioLibrary() {
  const { scenarioLibrary } = require("../mock/content");
  return Array.isArray(scenarioLibrary) ? scenarioLibrary : [];
}

function markLocalFallback(target) {
  if (target && typeof target === "object") {
    target.__fallbackSource = "local";
  }

  return target;
}

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

function normalizeScenarioListItem(scenario) {
  const cover = scenario.cover || {};

  return {
    id: scenario.id,
    title: scenario.title,
    category: scenario.category,
    openingLine: cover.opening_message || "",
    meta: toMeta(cover.tags),
    blurb: cover.subtitle || "",
    tags: cover.tags || [],
    unlockedEndingIds: getUnlockedEndingIds(scenario.id)
  };
}

function normalizeScenarioDetail(scenario) {
  const cover = scenario.cover || {};
  const character = scenario.character || {};

  return {
    id: scenario.id,
    title: scenario.title,
    category: scenario.category,
    openingLine: cover.opening_message || "",
    meta: toMeta(cover.tags),
    blurb: cover.subtitle || "",
    tags: cover.tags || [],
    unlockedEndingIds: getUnlockedEndingIds(scenario.id),
    background: scenario.background || "",
    scenePrompt: scenario.scene_prompt || "",
    availableEndingLabels: (scenario.possible_endings || []).map((item) => item.label),
    possibleEndings: scenario.possible_endings || [],
    character: {
      name: character.name || "",
      age: String(character.age || ""),
      gender: character.gender || "",
      relationship: character.relationship || "",
      archetype: character.archetype || "",
      occupation: character.occupation || "",
      personalityTags: (cover.tags || []).slice(0, 2),
      speakingStyle: character.speaking_style || "",
      currentAttitude: character.current_attitude || "",
      initialMood: character.initial_mood || "",
      initialFavorability: character.initial_favorability || 0
    }
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

function getLocalScriptList(category) {
  const targetCategory = normalizeCategory(category);
  const localScripts = getLocalScenarioLibrary().map(normalizeScenarioListItem);
  const filteredScripts = targetCategory === "全部"
    ? localScripts
    : localScripts.filter((item) => item.category === targetCategory);

  return markLocalFallback(filteredScripts);
}

function getLocalScriptDetail(scriptId) {
  const scenario = getLocalScenarioLibrary().find((item) => item.id === scriptId);
  if (!scenario) {
    return null;
  }

  return markLocalFallback(normalizeScenarioDetail(scenario));
}

async function getScriptList(category) {
  const targetCategory = normalizeCategory(category);

  try {
    const data = await callCloud("getScenarios", {
      category: targetCategory === "全部" ? "" : targetCategory
    });
    const scripts = (data || []).map(normalizeScenarioListItem);

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

    const localLibrary = getLocalScenarioLibrary();
    if (localLibrary.length > 0) {
      const fallbackScripts = getLocalScriptList(targetCategory);
      if (targetCategory === "全部") {
        updateCategoriesFromScripts(fallbackScripts);
      }
      return fallbackScripts;
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
    const detail = normalizeScenarioDetail(data);
    setStorageSync(CACHE_KEYS.scriptDetail + scriptId, detail);
    return detail;
  } catch (error) {
    const cached = getStorageSync(CACHE_KEYS.scriptDetail + scriptId, null);
    if (cached) {
      return cached;
    }

    return getLocalScriptDetail(scriptId);
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
