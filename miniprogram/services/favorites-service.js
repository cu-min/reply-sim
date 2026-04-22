const STORAGE_KEY = "profile_favorites";

function getFavorites() {
  try {
    return wx.getStorageSync(STORAGE_KEY) || [];
  } catch (e) {
    return [];
  }
}

function getFavoritedIds() {
  const favs = getFavorites();
  const map = {};
  favs.forEach(f => { map[f.id] = true; });
  return map;
}

function isFavorited(scriptId) {
  return Boolean(getFavoritedIds()[scriptId]);
}

function toggleFavorite(script) {
  const favs = getFavorites();
  const idx = favs.findIndex(f => f.id === script.id);
  let nowFavorited;
  if (idx >= 0) {
    favs.splice(idx, 1);
    nowFavorited = false;
  } else {
    favs.unshift({
      id: script.id,
      title: script.title || script.id,
      category: script.category || "",
      openingLine: script.openingLine || "",
      blurb: script.blurb || "",
      savedAt: Date.now()
    });
    nowFavorited = true;
  }
  try {
    wx.setStorageSync(STORAGE_KEY, favs);
  } catch (e) {}
  return nowFavorited;
}

module.exports = { getFavorites, getFavoritedIds, isFavorited, toggleFavorite };
