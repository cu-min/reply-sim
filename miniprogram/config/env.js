const CLOUD_ENV_IDS = {
  dev: "ran-1g26gduhce2045d3",
  prod: "ran-1g26gduhce2045d3"
};

function getMiniProgramEnvVersion() {
  try {
    const accountInfo = wx.getAccountInfoSync();
    return (accountInfo && accountInfo.miniProgram && accountInfo.miniProgram.envVersion) || "develop";
  } catch (error) {
    return "develop";
  }
}

function resolveRuntimeEnv() {
  const envVersion = getMiniProgramEnvVersion();
  return envVersion === "trial" || envVersion === "release" ? "prod" : "dev";
}

function getCloudConfig() {
  const runtime = resolveRuntimeEnv();
  const env = CLOUD_ENV_IDS[runtime];

  if (!env) {
    throw new Error("未配置 " + runtime + " 云环境 ID，请先更新 miniprogram/config/env.js");
  }

  return {
    env,
    traceUser: true,
    runtime
  };
}

module.exports = {
  CLOUD_ENV_IDS,
  resolveRuntimeEnv,
  getCloudConfig
};
