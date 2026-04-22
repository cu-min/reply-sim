"use strict";

const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.cwd();
const SOURCE_DIR = path.join(ROOT_DIR, "data", "scenarios");
const TARGET_DIR = path.join(ROOT_DIR, "cloudfunctions", "importScenarios", "scenarios");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyJsonFiles(sourceDir, targetDir) {
  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  files.forEach((file) => {
    fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
  });

  return files;
}

function removeStaleJsonFiles(targetDir, files) {
  const expectedFiles = new Set(files);

  fs.readdirSync(targetDir)
    .filter((file) => file.endsWith(".json") && !expectedFiles.has(file))
    .forEach((file) => {
      fs.unlinkSync(path.join(targetDir, file));
    });
}

function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error("Missing source scenarios directory:", SOURCE_DIR);
    process.exit(1);
  }

  ensureDir(TARGET_DIR);
  const files = copyJsonFiles(SOURCE_DIR, TARGET_DIR);
  removeStaleJsonFiles(TARGET_DIR, files);

  console.log(`Prepared ${files.length} scenario snapshot file(s) for importScenarios.`);
}

main();
