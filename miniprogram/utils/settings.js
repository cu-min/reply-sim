const SETTINGS_KEY = "user_settings";
const DEFAULTS = { fontSize: "md", eyeCare: false };

function getSettings() {
  try {
    return Object.assign({}, DEFAULTS, wx.getStorageSync(SETTINGS_KEY) || {});
  } catch (e) {
    return Object.assign({}, DEFAULTS);
  }
}

function saveSettings(patch) {
  const current = getSettings();
  const next = Object.assign({}, current, patch);
  try {
    wx.setStorageSync(SETTINGS_KEY, next);
  } catch (e) {}
  return next;
}

const FONT_SCALES = { sm: 0.88, md: 1, lg: 1.14 };

function buildThemeStyle(settings) {
  const scale = FONT_SCALES[settings.fontSize] || 1;
  const eye = settings.eyeCare;
  const vars = [
    `--font-body: ${Math.round(30 * scale)}rpx`,
    `--font-caption: ${Math.round(24 * scale)}rpx`,
    `--font-note: ${Math.round(22 * scale)}rpx`,
    eye ? "--color-bg-page: #2e2a25"       : "--color-bg-page: #f5f0e8",
    eye ? "--color-bg-page-deep: #232019"  : "--color-bg-page-deep: #eee5da",
    eye ? "--color-bg-card: #3a342d"       : "--color-bg-card: #ffffff",
    eye ? "--color-bg-muted: #332e27"      : "--color-bg-muted: #f7f2eb",
    eye ? "--color-text-primary: #e8e0d5"  : "--color-text-primary: #2c2c2c",
    eye ? "--color-text-secondary: #b0a89e": "--color-text-secondary: #6f645d",
    eye ? "--color-text-muted: #7a7068"    : "--color-text-muted: #9a8f85",
    eye ? "--color-border-soft: #4a433b"   : "--color-border-soft: #ede8e0",
    eye ? "--color-border-strong: #5a5249" : "--color-border-strong: #d9cfc4",
  ];
  return vars.join("; ");
}

module.exports = { getSettings, saveSettings, buildThemeStyle };
