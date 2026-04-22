const cloud = require("wx-server-sdk");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const SCENARIOS_COLLECTION = "scenarios";
const SCENARIOS_DIR = path.join(__dirname, "scenarios");

function listScenarioFiles() {
  if (!fs.existsSync(SCENARIOS_DIR)) {
    throw new Error("未找到导入快照目录，请先生成 cloudfunctions/importScenarios/scenarios");
  }

  return fs
    .readdirSync(SCENARIOS_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort();
}

function readScenarioFile(fileName) {
  const filePath = path.join(SCENARIOS_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const scenario = JSON.parse(raw);

  if (!scenario || typeof scenario !== "object" || Array.isArray(scenario)) {
    throw new Error("剧本内容必须是对象");
  }

  if (!scenario.id || typeof scenario.id !== "string") {
    throw new Error("缺少合法的 id");
  }

  if (!scenario.title || typeof scenario.title !== "string") {
    throw new Error("缺少合法的 title");
  }

  if (!scenario.category || typeof scenario.category !== "string") {
    throw new Error("缺少合法的 category");
  }

  const sourceHash = crypto.createHash("sha1").update(raw).digest("hex");

  return {
    fileName,
    sourceHash,
    scenario
  };
}

function buildScenarioDocument(record, importedAt) {
  return {
    ...record.scenario,
    _meta: {
      source_file: record.fileName,
      source_hash: record.sourceHash,
      imported_at: importedAt
    }
  };
}

async function syncScenario(record, importedAt) {
  const document = buildScenarioDocument(record, importedAt);
  const existing = await db
    .collection(SCENARIOS_COLLECTION)
    .where({ id: record.scenario.id })
    .limit(1)
    .get();

  if (!existing.data.length) {
    await db.collection(SCENARIOS_COLLECTION).add({ data: document });
    return {
      id: record.scenario.id,
      title: record.scenario.title,
      status: "imported"
    };
  }

  const current = existing.data[0];
  const currentHash = current._meta && current._meta.source_hash;

  if (currentHash === record.sourceHash) {
    return {
      id: record.scenario.id,
      title: record.scenario.title,
      status: "unchanged"
    };
  }

  await db.collection(SCENARIOS_COLLECTION).doc(current._id).set({ data: document });
  return {
    id: record.scenario.id,
    title: record.scenario.title,
    status: "updated"
  };
}

exports.main = async () => {
  try {
    const files = listScenarioFiles();

    if (!files.length) {
      return {
        code: -1,
        message: "导入快照目录中没有任何剧本 JSON，请先生成 scenarios 快照"
      };
    }

    const importedAt = new Date().toISOString();
    const details = [];
    let imported = 0;
    let updated = 0;
    let unchanged = 0;
    let failed = 0;

    for (const fileName of files) {
      try {
        const record = readScenarioFile(fileName);
        const result = await syncScenario(record, importedAt);
        details.push(result);

        if (result.status === "imported") {
          imported += 1;
        } else if (result.status === "updated") {
          updated += 1;
        } else if (result.status === "unchanged") {
          unchanged += 1;
        }
      } catch (error) {
        failed += 1;
        details.push({
          file: fileName,
          status: "error",
          message: error.message || "导入失败"
        });
        console.error(`[importScenarios] ${fileName} 导入失败:`, error);
      }
    }

    return {
      code: failed > 0 ? -1 : 0,
      data: {
        total: files.length,
        imported,
        updated,
        unchanged,
        failed,
        details
      },
      message: failed > 0
        ? `剧本同步完成，但有 ${failed} 个文件失败`
        : `剧本同步完成：新增 ${imported}，更新 ${updated}，未变化 ${unchanged}`
    };
  } catch (error) {
    console.error("[importScenarios] 同步失败:", error);
    return {
      code: -1,
      message: error.message || "剧本同步失败"
    };
  }
};
