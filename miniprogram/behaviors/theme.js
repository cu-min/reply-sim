const { getSettings, buildThemeStyle } = require("../utils/settings");

module.exports = Behavior({
  data: {
    themeStyle: ""
  },
  methods: {
    _applyTheme() {
      this.setData({ themeStyle: buildThemeStyle(getSettings()) });
    },
    onShow() {
      this._applyTheme();
    }
  }
});
