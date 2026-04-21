const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const AUDIT_CONFIRM_TOKEN = "dev-audit";
const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_SAMPLE_LIMIT = 20;

async function fetchAllDocuments(collectionName, projection, batchSize) {
  const documents = [];
  let skip = 0;

  while (true) {
    const res = await db
      .collection(collectionName)
      .field(projection)
      .skip(skip)
      .limit(batchSize)
      .get();

    const rows = res.data || [];
    documents.push(...rows);

    if (rows.length < batchSize) {
      break;
    }

    skip += rows.length;
  }

  return documents;
}

function buildDuplicateSummary(rows, buildKey, mapSample, sampleLimit) {
  const grouped = new Map();

  (rows || []).forEach((row) => {
    const key = buildKey(row);
    if (!key) {
      return;
    }

    const current = grouped.get(key) || [];
    current.push(row);
    grouped.set(key, current);
  });

  const duplicateGroups = Array.from(grouped.entries())
    .filter(([, items]) => items.length > 1)
    .sort((left, right) => right[1].length - left[1].length);

  const duplicateDocCount = duplicateGroups.reduce((sum, [, items]) => sum + items.length, 0);

  return {
    total_docs: rows.length,
    duplicate_key_count: duplicateGroups.length,
    duplicate_doc_count: duplicateDocCount,
    max_duplicate_count: duplicateGroups.length ? duplicateGroups[0][1].length : 0,
    sample_duplicates: duplicateGroups.slice(0, sampleLimit).map(([key, items]) =>
      Object.assign(
        {
          key,
          count: items.length
        },
        mapSample(items)
      )
    )
  };
}

async function auditUsers(batchSize, sampleLimit) {
  const rows = await fetchAllDocuments(
    "users",
    {
      openid: true,
      nickname: true,
      created_at: true
    },
    batchSize
  );

  return buildDuplicateSummary(
    rows,
    (row) => row.openid || "",
    (items) => ({
      openid: items[0].openid || "",
      doc_ids: items.map((item) => item._id)
    }),
    sampleLimit
  );
}

async function auditEndings(batchSize, sampleLimit) {
  const rows = await fetchAllDocuments(
    "endings",
    {
      session_id: true,
      openid: true,
      ending_id: true,
      ending_type: true,
      created_at: true
    },
    batchSize
  );

  return buildDuplicateSummary(
    rows,
    (row) => {
      if (!row.session_id || !row.openid) {
        return "";
      }

      return row.session_id + "::" + row.openid;
    },
    (items) => ({
      session_id: items[0].session_id || "",
      openid: items[0].openid || "",
      doc_ids: items.map((item) => item._id),
      ending_ids: items.map((item) => item.ending_id || ""),
      ending_types: items.map((item) => item.ending_type || "")
    }),
    sampleLimit
  );
}

exports.main = async (event = {}) => {
  const batchSize = Math.max(20, Math.min(200, Number(event.batch_size) || DEFAULT_BATCH_SIZE));
  const sampleLimit = Math.max(1, Math.min(50, Number(event.sample_limit) || DEFAULT_SAMPLE_LIMIT));
  const target = event.target || "all";

  if (event.confirm !== AUDIT_CONFIRM_TOKEN) {
    return {
      code: -1,
      message: "该函数仅供 dev 巡检使用。请传入 confirm=dev-audit 后再执行。"
    };
  }

  try {
    const result = {
      batch_size: batchSize,
      sample_limit: sampleLimit
    };

    if (target === "all" || target === "users") {
      result.users = await auditUsers(batchSize, sampleLimit);
    }

    if (target === "all" || target === "endings") {
      result.endings = await auditEndings(batchSize, sampleLimit);
    }

    return {
      code: 0,
      data: result
    };
  } catch (error) {
    console.error("[dataAudit]", error);
    return {
      code: -1,
      message: error.message || "巡检执行失败"
    };
  }
};
