"use strict";

const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, "data", "scenarios");
const SCHEMA_PATH = path.join(ROOT_DIR, "data", "scenario.schema.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isInteger(value) {
  return Number.isInteger(value);
}

function addError(errors, file, pathName, message) {
  errors.push({ file, path: pathName, message });
}

function ensureObject(errors, file, pathName, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    addError(errors, file, pathName, "must be an object");
    return false;
  }

  return true;
}

function validateRequiredString(errors, file, pathName, value) {
  if (!isNonEmptyString(value)) {
    addError(errors, file, pathName, "must be a non-empty string");
  }
}

function validateStringArray(errors, file, pathName, value) {
  if (!Array.isArray(value) || value.length === 0) {
    addError(errors, file, pathName, "must be a non-empty array");
    return;
  }

  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      addError(errors, file, `${pathName}[${index}]`, "must be a non-empty string");
    }
  });
}

function validateCover(errors, file, cover) {
  if (!ensureObject(errors, file, "cover", cover)) {
    return;
  }

  validateRequiredString(errors, file, "cover.opening_message", cover.opening_message);
  validateRequiredString(errors, file, "cover.subtitle", cover.subtitle);
  validateStringArray(errors, file, "cover.tags", cover.tags);
}

function validateCharacter(errors, file, character) {
  if (!ensureObject(errors, file, "character", character)) {
    return;
  }

  [
    "name",
    "gender",
    "occupation",
    "relationship",
    "archetype",
    "personality",
    "speaking_style",
    "attitude_to_relationship",
    "initial_mood",
    "current_attitude"
  ].forEach((key) => {
    validateRequiredString(errors, file, `character.${key}`, character[key]);
  });

  if (!isInteger(character.age) || character.age < 1 || character.age > 120) {
    addError(errors, file, "character.age", "must be an integer between 1 and 120");
  }

  if (
    !isInteger(character.initial_favorability) ||
    character.initial_favorability < 0 ||
    character.initial_favorability > 100
  ) {
    addError(
      errors,
      file,
      "character.initial_favorability",
      "must be an integer between 0 and 100"
    );
  }
}

function validateEndingTriggers(errors, file, endingTriggers) {
  if (!ensureObject(errors, file, "ending_triggers", endingTriggers)) {
    return;
  }

  validateRequiredString(errors, file, "ending_triggers.description", endingTriggers.description);
  validateStringArray(errors, file, "ending_triggers.conditions", endingTriggers.conditions);
}

function validatePossibleEndings(errors, file, possibleEndings, endingIds) {
  if (!Array.isArray(possibleEndings) || possibleEndings.length === 0) {
    addError(errors, file, "possible_endings", "must be a non-empty array");
    return;
  }

  possibleEndings.forEach((ending, index) => {
    const pathName = `possible_endings[${index}]`;
    if (!ensureObject(errors, file, pathName, ending)) {
      return;
    }

    [
      "id",
      "type",
      "label",
      "hint",
      "impact_line",
      "relationship_result",
      "key_behavior_feedback",
      "missed_branch_hint",
      "literary_closing",
      "badge_label"
    ].forEach((key) => {
      validateRequiredString(errors, file, `${pathName}.${key}`, ending[key]);
    });

    if (isNonEmptyString(ending.id)) {
      if (endingIds.has(ending.id)) {
        addError(errors, file, `${pathName}.id`, `duplicate ending id "${ending.id}"`);
      }
      endingIds.add(ending.id);
    }
  });
}

function validateReplies(errors, file, replies, pathName, replyIds) {
  if (!Array.isArray(replies) || replies.length === 0) {
    addError(errors, file, pathName, "must be a non-empty array");
    return;
  }

  replies.forEach((reply, index) => {
    const replyPath = `${pathName}[${index}]`;
    if (!ensureObject(errors, file, replyPath, reply)) {
      return;
    }

    ["id", "style_label", "style_description", "content"].forEach((key) => {
      validateRequiredString(errors, file, `${replyPath}.${key}`, reply[key]);
    });

    if (isNonEmptyString(reply.id)) {
      if (replyIds.has(reply.id)) {
        addError(errors, file, `${replyPath}.id`, `duplicate reply id "${reply.id}"`);
      }
      replyIds.add(reply.id);
    }
  });
}

function validateStrategies(errors, file, strategies, pathName, strategyIds, replyIds) {
  if (!Array.isArray(strategies) || strategies.length === 0) {
    addError(errors, file, pathName, "must be a non-empty array");
    return;
  }

  strategies.forEach((strategy, index) => {
    const strategyPath = `${pathName}[${index}]`;
    if (!ensureObject(errors, file, strategyPath, strategy)) {
      return;
    }

    ["id", "label", "description"].forEach((key) => {
      validateRequiredString(errors, file, `${strategyPath}.${key}`, strategy[key]);
    });

    if (isNonEmptyString(strategy.id)) {
      if (strategyIds.has(strategy.id)) {
        addError(errors, file, `${strategyPath}.id`, `duplicate strategy id "${strategy.id}"`);
      }
      strategyIds.add(strategy.id);
    }

    validateReplies(errors, file, strategy.replies, `${strategyPath}.replies`, replyIds);
  });
}

function validateTurns(errors, file, turns, endingIds) {
  if (!Array.isArray(turns) || turns.length === 0) {
    addError(errors, file, "turns", "must be a non-empty array");
    return;
  }

  const turnIds = new Set();
  const strategyIds = new Set();
  const replyIds = new Set();

  turns.forEach((turn, index) => {
    const pathName = `turns[${index}]`;
    if (!ensureObject(errors, file, pathName, turn)) {
      return;
    }

    validateRequiredString(errors, file, `${pathName}.id`, turn.id);
    validateRequiredString(errors, file, `${pathName}.assistant_message`, turn.assistant_message);

    if (typeof turn.emotion_hint !== "string") {
      addError(errors, file, `${pathName}.emotion_hint`, "must be a string");
    }

    if (isNonEmptyString(turn.id)) {
      if (turnIds.has(turn.id)) {
        addError(errors, file, `${pathName}.id`, `duplicate turn id "${turn.id}"`);
      }
      turnIds.add(turn.id);
    }

    if (turn.ending_id !== undefined) {
      validateRequiredString(errors, file, `${pathName}.ending_id`, turn.ending_id);

      if (isNonEmptyString(turn.ending_id) && !endingIds.has(turn.ending_id)) {
        addError(errors, file, `${pathName}.ending_id`, `references missing ending "${turn.ending_id}"`);
      }
    }

    if (turn.ending_prompt !== undefined) {
      validateRequiredString(errors, file, `${pathName}.ending_prompt`, turn.ending_prompt);

      if (turn.ending_id === undefined) {
        addError(errors, file, `${pathName}.ending_prompt`, "requires ending_id");
      }
    }

    validateStrategies(errors, file, turn.strategies, `${pathName}.strategies`, strategyIds, replyIds);
  });
}

function validateScenario(filePath, scenario, schema) {
  const errors = [];
  const file = path.basename(filePath);

  if (!schema || schema.type !== "object") {
    addError(errors, file, "$schema", "schema file is invalid or unsupported");
    return errors;
  }

  if (!ensureObject(errors, file, "$", scenario)) {
    return errors;
  }

  ["id", "title", "category", "background", "scene_prompt"].forEach((key) => {
    validateRequiredString(errors, file, key, scenario[key]);
  });

  validateCover(errors, file, scenario.cover);
  validateCharacter(errors, file, scenario.character);
  validateEndingTriggers(errors, file, scenario.ending_triggers);

  const endingIds = new Set();
  validatePossibleEndings(errors, file, scenario.possible_endings, endingIds);
  validateTurns(errors, file, scenario.turns, endingIds);

  return errors;
}

function main() {
  const issues = [];

  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error("Missing schema file:", SCHEMA_PATH);
    process.exit(1);
  }

  if (!fs.existsSync(DATA_DIR)) {
    console.error("Missing scenarios directory:", DATA_DIR);
    process.exit(1);
  }

  const schema = readJson(SCHEMA_PATH);
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort();

  const scenarioIds = new Set();

  files.forEach((file) => {
    const fullPath = path.join(DATA_DIR, file);
    let scenario;

    try {
      scenario = readJson(fullPath);
    } catch (error) {
      addError(issues, file, "$", `invalid JSON: ${error.message}`);
      return;
    }

    if (isNonEmptyString(scenario.id)) {
      if (scenarioIds.has(scenario.id)) {
        addError(issues, file, "id", `duplicate scenario id "${scenario.id}"`);
      }
      scenarioIds.add(scenario.id);
    }

    issues.push(...validateScenario(fullPath, scenario, schema));
  });

  if (issues.length > 0) {
    console.error(`Scenario validation failed with ${issues.length} issue(s):`);
    issues.forEach((issue) => {
      console.error(`- ${issue.file} :: ${issue.path} :: ${issue.message}`);
    });
    process.exit(1);
  }

  console.log(`Scenario validation passed for ${files.length} file(s).`);
}

main();
