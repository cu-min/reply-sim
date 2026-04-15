const { getUserProfile } = require("./user-service");

async function getProfile() {
  return getUserProfile();
}

module.exports = {
  getProfile
};
