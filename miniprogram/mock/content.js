const crushDirect = require("./scenarios/crush-direct");
const crushParty = require("./scenarios/crush-party");
const exMidnight = require("./scenarios/ex-midnight");
const exPhoto = require("./scenarios/ex-photo");
const familyRegretFather = require("./scenarios/family-regret-father");
const familyResistanceStudy = require("./scenarios/family-resistance-study");
const socialLoan = require("./scenarios/social-loan");
const workTonight = require("./scenarios/work-tonight");

const scenarioLibrary = [
  crushDirect,
  crushParty,
  exMidnight,
  exPhoto,
  familyRegretFather,
  familyResistanceStudy,
  socialLoan,
  workTonight
];

const profileSeed = {
  id: "guest-user",
  nickname: "还没想好怎么说",
  signature: "有些话，先在这里试着说。",
  heartBalance: 88,
  favoriteScriptIds: ["ex-midnight", "crush-party"],
  seedHistory: [
    {
      id: "seed-history-work",
      sessionId: "seed-work-session",
      scriptId: "work-tonight",
      scriptTitle: "“这个方案今晚改出来。”",
      endingId: "ending-work-balance",
      endingTitle: "稳住边界",
      endingSummary: "你没有硬碰硬，但也把边界留在了专业表达里。",
      badgeLabel: "稳住边界",
      playedAt: "04-10 21:36",
      playedAtTs: 1775856960000,
      turnCount: 3
    }
  ]
};

module.exports = {
  scenarioLibrary,
  profileSeed
};
