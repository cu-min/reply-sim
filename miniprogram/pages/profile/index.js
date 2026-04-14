const { getProfile } = require("../../services/profile-service");
const { getScriptsByIds } = require("../../services/script-service");

Page({
  data: {
    profile: null,
    favoriteScripts: [],
    loadState: "loading"
  },

  onLoad() {
    this.loadProfile();
  },

  onShow() {
    this.loadProfile();
  },

  loadProfile() {
    const profile = getProfile();
    const favoriteScripts = getScriptsByIds(profile.favoriteScriptIds);

    this.setData({
      profile,
      favoriteScripts,
      loadState: "ready"
    });
  }
});
