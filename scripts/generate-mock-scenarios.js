"use strict";

const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.cwd();
const SOURCE_DIR = path.join(ROOT_DIR, "data", "scenarios");
const TARGET_DIR = path.join(ROOT_DIR, "miniprogram", "mock", "scenarios");
const CONTENT_PATH = path.join(ROOT_DIR, "miniprogram", "mock", "content.js");
const PROFILE_SEED_MARKER = "const profileSeed = ";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toCamelCase(fileBaseName) {
  return fileBaseName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function readScenarioFiles(sourceDir) {
  return fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({
      file,
      baseName: path.basename(file, ".json"),
      content: fs.readFileSync(path.join(sourceDir, file), "utf8").trim()
    }));
}

function writeScenarioMocks(targetDir, scenarios) {
  scenarios.forEach((scenario) => {
    const output = `module.exports = ${scenario.content};\n`;
    fs.writeFileSync(path.join(targetDir, `${scenario.baseName}.js`), output, "utf8");
  });
}

function removeStaleScenarioMocks(targetDir, scenarios) {
  const expectedFiles = new Set(scenarios.map((scenario) => `${scenario.baseName}.js`));

  fs.readdirSync(targetDir)
    .filter((file) => file.endsWith(".js") && !expectedFiles.has(file))
    .forEach((file) => {
      fs.unlinkSync(path.join(targetDir, file));
    });
}

function buildContentFile(existingContent, scenarios) {
  const markerIndex = existingContent.indexOf(PROFILE_SEED_MARKER);

  if (markerIndex === -1) {
    throw new Error("miniprogram/mock/content.js 缺少 profileSeed 标记，无法安全保留用户 seed 数据");
  }

  const imports = scenarios
    .map((scenario) => {
      const importName = toCamelCase(scenario.baseName);
      return `const ${importName} = require("./scenarios/${scenario.baseName}");`;
    })
    .join("\n");

  const libraryItems = scenarios
    .map((scenario) => `  ${toCamelCase(scenario.baseName)}`)
    .join(",\n");

  const preservedTail = existingContent.slice(markerIndex).trimStart();

  return `${imports}\n\nconst scenarioLibrary = [\n${libraryItems}\n];\n\n${preservedTail}`;
}

function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error("Missing source scenarios directory:", SOURCE_DIR);
    process.exit(1);
  }

  if (!fs.existsSync(CONTENT_PATH)) {
    console.error("Missing content.js file:", CONTENT_PATH);
    process.exit(1);
  }

  ensureDir(TARGET_DIR);

  const scenarios = readScenarioFiles(SOURCE_DIR);
  writeScenarioMocks(TARGET_DIR, scenarios);
  removeStaleScenarioMocks(TARGET_DIR, scenarios);

  const existingContent = fs.readFileSync(CONTENT_PATH, "utf8");
  const nextContent = buildContentFile(existingContent, scenarios);
  fs.writeFileSync(CONTENT_PATH, nextContent, "utf8");

  console.log(`Generated ${scenarios.length} mock scenario file(s) and refreshed content.js.`);
}

main();
