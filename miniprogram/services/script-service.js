const { scenarioLibrary } = require("../mock/content");
const { getCompletedHistory } = require("../utils/storage");

function getUnlockedEndingIds(scriptId, seededIds) {
  const records = getCompletedHistory().filter((item) => item.scriptId === scriptId);
  const runtimeIds = records.map((item) => item.endingId);
  return Array.from(new Set([].concat(seededIds, runtimeIds)));
}

function getScenario(scriptId) {
  return scenarioLibrary.find((item) => item.id === scriptId) || null;
}

function toMeta(tags) {
  return (tags || []).join(" | ");
}

function toDetail(scenario) {
  const unlockedEndingIds = getUnlockedEndingIds(
    scenario.id,
    (scenario.seed_unlocked_endings || []).slice()
  );

  return {
    id: scenario.id,
    title: scenario.title,
    category: scenario.category,
    openingLine: scenario.cover.opening_message,
    meta: toMeta(scenario.cover.tags),
    blurb: scenario.cover.subtitle,
    tags: scenario.cover.tags,
    unlockedEndingIds,
    background: scenario.background,
    scenePrompt: scenario.scene_prompt,
    availableEndingLabels: scenario.possible_endings.map((item) => item.label),
    character: {
      name: scenario.character.name,
      age: String(scenario.character.age),
      gender: scenario.character.gender,
      relationship: scenario.character.relationship,
      archetype: scenario.character.archetype,
      occupation: scenario.character.occupation,
      personalityTags: scenario.cover.tags.slice(0, 2),
      speakingStyle: scenario.character.speaking_style,
      currentAttitude: scenario.character.current_attitude
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

function getCategories() {
  return ["全部"].concat(
    Array.from(new Set(scenarioLibrary.map((item) => item.category)))
  );
}

function getScriptList(category) {
  const targetCategory = category || "全部";
  const allSummaries = scenarioLibrary.map((item) => toSummary(toDetail(item)));

  if (targetCategory === "全部") {
    return allSummaries;
  }

  return allSummaries.filter((item) => item.category === targetCategory);
}

function getScriptDetail(scriptId) {
  const scenario = getScenario(scriptId);
  return scenario ? toDetail(scenario) : null;
}

function getScriptsByIds(ids) {
  return ids
    .map((id) => getScriptDetail(id))
    .filter(Boolean)
    .map(toSummary);
}

function getEndingResult(scriptId, endingId) {
  const scenario = getScenario(scriptId);
  if (!scenario) {
    return null;
  }

  const ending = scenario.possible_endings.find((item) => item.id === endingId);
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
