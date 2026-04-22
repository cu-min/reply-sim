const cloud = require("wx-server-sdk");
const fs = require("fs");
const path = require("path");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 动态读取 /data/scenarios/ 目录中的所有 JSON 文件
let scenarios = [];
try {
  const scenariosDir = path.join(__dirname, "../../../data/scenarios");
  const files = fs.readdirSync(scenariosDir);
  
  files.forEach(file => {
    if (file.endsWith(".json")) {
      const filePath = path.join(scenariosDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const scenario = JSON.parse(content);
      scenarios.push(scenario);
    }
  });
  
  console.log(`[importScenarios] 动态加载了 ${scenarios.length} 个剧本`);
} catch (error) {
  console.error("[importScenarios] 动态加载剧本失败:", error.message);
  // 如果动态加载失败，降级到空数组
  scenarios = [];
}

// 备用的硬编码数据（当动态加载失败时作为降级方案，暂时移除以防冲突）
const fallbackScenarios = [
  {
    "id": "crush-direct",
    "title": "“你是不是有话想跟我说？”",
    "category": "暗恋",
    "cover": {
      "opening_message": "你是不是有话想跟我说？",
      "subtitle": "他比平时更直接，像给了你一个窗口。",
      "tags": [
        "暗恋",
        "认识半年",
        "主动型"
      ]
    },
    "character": {
      "name": "林朝",
      "gender": "男",
      "age": 25,
      "occupation": "插画师",
      "relationship": "暧昧对象",
      "archetype": "主动观察型",
      "personality": "敏感、有趣、擅长捕捉情绪，对喜欢的人会带一点若有若无的主动。",
      "speaking_style": "喜欢留白，偶尔用玩笑试你，认真时反而更轻声。",
      "attitude_to_relationship": "对你有兴趣，但还没有彻底摊牌。",
      "initial_mood": "试着把气氛往更近的地方推一点。",
      "initial_favorability": 60,
      "current_attitude": "对你有好奇，也在等你给更明确的信号。"
    },
    "background": "你们认识半年，平时聊天不少，却始终没有把关系真正推到更靠近的位置。今晚他突然这样开口，像是在把那层窗纸轻轻挑起来。",
    "scene_prompt": "这个场景的重点不是立刻表白，而是让暧昧和心动真的有节奏地升温。",
    "ending_triggers": {
      "description": "以下任意条件满足时，对话可进入结局阶段。",
      "conditions": [
        "暧昧已经明显升温",
        "双方有明确试探结果",
        "自然停在留白",
        "轮数达到上限"
      ]
    },
    "possible_endings": [
      {
        "id": "ending-crush-warmth",
        "type": "warmth",
        "label": "气氛升温",
        "hint": "他开始认真接你的话了。",
        "impact_line": "他开始认真接你的话，暧昧终于有了温度。",
        "relationship_result": "你把暧昧聊出了温度，对方开始认真留意你的回应。",
        "key_behavior_feedback": "你没有把话说满，却刚好给了他继续靠近的空间。",
        "missed_branch_hint": "如果最后一轮再大胆一点，可能会出现更明确的心意确认。",
        "literary_closing": "有些靠近不是突然发生的，是一句一句被你轻轻推近的。",
        "badge_label": "气氛升温"
      },
      {
        "id": "ending-crush-pause",
        "type": "ambiguous",
        "label": "停在心照不宣",
        "hint": "你们都懂了一点，但谁都没说破。",
        "impact_line": "今晚的空气已经变了，可你们都把答案留在了眼神外面。",
        "relationship_result": "这段暧昧停在一种刚刚好的心照不宣里，没有彻底挑明。",
        "key_behavior_feedback": "你一直在给回应，但从没把自己完全暴露出去。",
        "missed_branch_hint": "如果第二轮你更主动一点，走向会更像一次真正的表态。",
        "literary_closing": "像是灯光刚好落下来，谁都没有伸手去关。",
        "badge_label": "心照不宣"
      },
      {
        "id": "ending-crush-drift",
        "type": "closure",
        "label": "话题飘散",
        "hint": "你们没有把这次机会接住。",
        "impact_line": "那扇门开过一下，但你们都没有真的走进去。",
        "relationship_result": "今晚的对话没有坏掉，只是没能把关系往前推进。",
        "key_behavior_feedback": "你始终没有给出足够明确的情绪，气氛就慢慢散掉了。",
        "missed_branch_hint": "如果最后一轮少一点玩笑，多一点认真，可能会完全不同。",
        "literary_closing": "有些夜晚很适合心动，也很适合什么都不发生。",
        "badge_label": "话题飘散"
      }
    ],
    "turns": [
      {
        "id": "crush-direct-turn-1",
        "assistant_message": "你是不是有话想跟我说？",
        "emotion_hint": "",
        "strategies": [
          {
            "id": "crush-direct-intent-1",
            "label": "别太快承认",
            "description": "先看看他是不是认真的。",
            "replies": [
              {
                "id": "crush-direct-reply-1a",
                "style_label": "半真半假",
                "style_description": "有心动，但不立刻交底。",
                "content": "可能有，不过我还在想要不要现在说。"
              },
              {
                "id": "crush-direct-reply-1b",
                "style_label": "先不点头",
                "style_description": "让他继续往前一点。",
                "content": "你这句问得太突然了，我都不知道该不该承认。"
              }
            ]
          },
          {
            "id": "crush-direct-intent-2",
            "label": "顺势接住",
            "description": "把气氛轻轻往前推一点。",
            "replies": [
              {
                "id": "crush-direct-reply-1c",
                "style_label": "给他信号",
                "style_description": "让他知道你不是完全没想法。",
                "content": "如果我说有，你会认真听吗？"
              },
              {
                "id": "crush-direct-reply-1d",
                "style_label": "顺着靠近",
                "style_description": "把问题递回去，带一点暧昧。",
                "content": "可能有啊，就看你今晚有没有当个合格的听众了。"
              }
            ]
          },
          {
            "id": "crush-direct-intent-3",
            "label": "装作轻松",
            "description": "先别把场面弄得太用力。",
            "replies": [
              {
                "id": "crush-direct-reply-1e",
                "style_label": "轻松玩笑",
                "style_description": "让气氛舒服，但不散掉。",
                "content": "那得看你想听哪一种了。"
              },
              {
                "id": "crush-direct-reply-1f",
                "style_label": "自然打趣",
                "style_description": "留一点玩笑感，让他继续试你。",
                "content": "怎么，今天突然这么敏锐，是不是偷看我表情了？"
              }
            ]
          }
        ]
      },
      {
        "id": "crush-direct-turn-2",
        "assistant_message": "听起来像是件不太随便的话，我现在有点好奇了。",
        "emotion_hint": "他开始好奇了",
        "strategies": [
          {
            "id": "crush-direct-intent-4",
            "label": "顺着暧昧",
            "description": "让他继续往这层气氛里走。",
            "replies": [
              {
                "id": "crush-direct-reply-2a",
                "style_label": "继续升温",
                "style_description": "把距离再轻轻拉近一点。",
                "content": "那你可以先保持一下这份好奇，我也想看看你会不会继续追问。"
              },
              {
                "id": "crush-direct-reply-2b",
                "style_label": "往前一点",
                "style_description": "给一点更明确的靠近感。",
                "content": "你现在这个反应，已经让我有点想把后半句说出来了。"
              }
            ]
          },
          {
            "id": "crush-direct-intent-5",
            "label": "给他安全感",
            "description": "让他知道这不是负担，是信任。",
            "replies": [
              {
                "id": "crush-direct-reply-2c",
                "style_label": "温柔承认",
                "style_description": "把认真感放出来一点。",
                "content": "就是有些话，只适合在你认真一点的时候说。"
              },
              {
                "id": "crush-direct-reply-2d",
                "style_label": "慢慢放下防备",
                "style_description": "让他知道你不是在吊着他。",
                "content": "也不是什么让人为难的话，只是我比较想在对的时候告诉你。"
              }
            ]
          },
          {
            "id": "crush-direct-intent-6",
            "label": "继续留白",
            "description": "让他主动一点，不急着给答案。",
            "replies": [
              {
                "id": "crush-direct-reply-2e",
                "style_label": "把悬念留下",
                "style_description": "让他继续靠近你。",
                "content": "先别急，我还想看看你会不会自己猜到。"
              },
              {
                "id": "crush-direct-reply-2f",
                "style_label": "不说太满",
                "style_description": "给他留一步，也给自己留一步。",
                "content": "也许等你再认真一点，我会更想开口。"
              }
            ]
          }
        ]
      },
      {
        "id": "crush-direct-turn-3",
        "assistant_message": "那我现在算不算已经认真起来了？",
        "emotion_hint": "气氛开始升温",
        "ending_id": "ending-crush-warmth",
        "ending_prompt": "他已经被你带进这段气氛里了，要把今晚停在这里吗？",
        "strategies": [
          {
            "id": "crush-direct-intent-7",
            "label": "给他台阶",
            "description": "让这份认真自然落下来。",
            "replies": [
              {
                "id": "crush-direct-reply-3a",
                "style_label": "柔和回应",
                "style_description": "既接住，也不把话说死。",
                "content": "可能算吧，至少比平时更像是在认真听我说话了。"
              },
              {
                "id": "crush-direct-reply-3b",
                "style_label": "顺势靠近",
                "style_description": "给他一点明确的正反馈。",
                "content": "算啊，所以我现在开始有点想认真回答你了。"
              }
            ]
          },
          {
            "id": "crush-direct-intent-8",
            "label": "再留一点白",
            "description": "别把答案一下给完。",
            "replies": [
              {
                "id": "crush-direct-reply-3c",
                "style_label": "继续暧昧",
                "style_description": "让这层气氛停留更久一点。",
                "content": "如果你再认真一点，我可能就真的会说了。"
              },
              {
                "id": "crush-direct-reply-3d",
                "style_label": "故意留一点",
                "style_description": "让他继续往前靠近。",
                "content": "差不多了，不过还差一点点能让我彻底点头的证据。"
              }
            ]
          },
          {
            "id": "crush-direct-intent-9",
            "label": "保持轻松",
            "description": "不要让这轮突然太重。",
            "replies": [
              {
                "id": "crush-direct-reply-3e",
                "style_label": "轻松接住",
                "style_description": "让气氛轻盈地往前走。",
                "content": "你这样问，已经很像在给我递话筒了。"
              },
              {
                "id": "crush-direct-reply-3f",
                "style_label": "玩笑里靠近",
                "style_description": "既不沉重，也不躲开。",
                "content": "勉强算吧，至少已经到我愿意继续聊下去的程度了。"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "crush-party",
    "title": "朋友聚会后他单独找你说话",
    "category": "暗恋",
    "cover": {
      "opening_message": "要不要一起走一段？",
      "subtitle": "聚会散场后，他故意慢了一步。",
      "tags": [
        "暗恋",
        "聚会后",
        "单独时刻"
      ]
    },
    "character": {
      "name": "周屿",
      "gender": "男",
      "age": 26,
      "occupation": "产品经理",
      "relationship": "朋友以上未满",
      "archetype": "慢热靠近型",
      "personality": "理性里带一点温柔，平时不太会抢话，但一旦认真会把细节记得很牢。",
      "speaking_style": "语速慢，句子不长，越认真越克制。",
      "attitude_to_relationship": "对你有明显偏心，但怕太快把氛围弄坏。",
      "initial_mood": "想借散场后的片刻靠近你一点。",
      "initial_favorability": 58,
      "current_attitude": "在试着制造一个只有你们两个人的空间。"
    },
    "background": "朋友聚会刚结束，大家陆续散开。他没跟其他人一起走，而是在楼下故意慢了一步，像在等你。等到只剩你们两个时，他轻声开口。",
    "scene_prompt": "这个场景的核心是散场后的单独时刻，既有暧昧，也很怕一开口就把气氛打碎。",
    "ending_triggers": {
      "description": "以下任意条件满足时，对话可进入结局阶段。",
      "conditions": [
        "单独气氛已经建立",
        "双方试探有结果",
        "自然停留在留白",
        "轮数达到上限"
      ]
    },
    "possible_endings": [
      {
        "id": "ending-crush-party-close",
        "type": "warmth",
        "label": "靠近了一点",
        "hint": "你们终于把朋友之外的空气留住了。",
        "impact_line": "你没有把这段路走快，于是他终于敢慢慢靠近你。",
        "relationship_result": "这次散场没有结束在告别里，而是让你们更像在往彼此那边走。",
        "key_behavior_feedback": "你没有急着给答案，而是让他的主动自然落下来。",
        "missed_branch_hint": "如果第二轮你更直接一点，今晚可能会更像一次小型表白。",
        "literary_closing": "有些靠近不是拥抱，是两个人都故意把脚步放慢。",
        "badge_label": "靠近了一点"
      },
      {
        "id": "ending-crush-party-pause",
        "type": "ambiguous",
        "label": "停在夜色里",
        "hint": "你们都知道气氛变了，但谁都没戳破。",
        "impact_line": "那段路不长，却足够让心思都变得很安静。",
        "relationship_result": "你们把这次单独相处停在一种刚刚好的留白里，没有把话挑明。",
        "key_behavior_feedback": "你一直给回应，却没把答案说死，气氛因此刚好停住。",
        "missed_branch_hint": "如果最后一轮多一点主动，结局可能会比现在更明确。",
        "literary_closing": "夜风很轻，像有人把一句话放在嘴边，最后还是没说完。",
        "badge_label": "停在夜色里"
      },
      {
        "id": "ending-crush-party-drift",
        "type": "closure",
        "label": "还是朋友",
        "hint": "你们没把这次机会接成转折。",
        "impact_line": "你们一起走了一段路，却还是走回了各自的位置。",
        "relationship_result": "今晚的单独时刻没有变成推进关系的节点，最后仍然停在朋友边缘。",
        "key_behavior_feedback": "你把气氛收得过于平稳，反而让他不敢再往前一步。",
        "missed_branch_hint": "如果你少一点回避，多一点接住，他可能会继续说下去。",
        "literary_closing": "灯一盏盏灭下去，夜色把心意也收进了影子里。",
        "badge_label": "还是朋友"
      }
    ],
    "turns": [
      {
        "id": "crush-party-turn-1",
        "assistant_message": "要不要一起走一段？",
        "emotion_hint": "",
        "strategies": [
          {
            "id": "crush-party-intent-1",
            "label": "自然接住",
            "description": "先别让这一刻显得太特别。",
            "replies": [
              {
                "id": "crush-party-reply-1a",
                "style_label": "顺其自然",
                "style_description": "像朋友一样接住，但不冷。",
                "content": "好啊，反正我也还不想那么快回去。"
              },
              {
                "id": "crush-party-reply-1b",
                "style_label": "轻轻配合",
                "style_description": "让他知道你愿意把这段路留给他。",
                "content": "可以啊，刚好我也想吹会儿风。"
              }
            ]
          },
          {
            "id": "crush-party-intent-2",
            "label": "带一点暧昧",
            "description": "让他感受到这不是普通顺路。",
            "replies": [
              {
                "id": "crush-party-reply-1c",
                "style_label": "轻轻点破",
                "style_description": "让他知道你看见了他的刻意。",
                "content": "你这句像是特地等我散场才说的。"
              },
              {
                "id": "crush-party-reply-1d",
                "style_label": "暧昧一点",
                "style_description": "把气氛慢慢推近。",
                "content": "可以，不过你这样单独约我走一段，还挺容易让人多想的。"
              }
            ]
          },
          {
            "id": "crush-party-intent-3",
            "label": "先试试他",
            "description": "看看他到底只是客气，还是另有想法。",
            "replies": [
              {
                "id": "crush-party-reply-1e",
                "style_label": "轻问一句",
                "style_description": "温和确认他的来意。",
                "content": "要一起走一段，还是你其实有话想单独跟我说？"
              },
              {
                "id": "crush-party-reply-1f",
                "style_label": "不让他糊弄",
                "style_description": "让他没法用顺路带过去。",
                "content": "你平时可不会特地慢下来等人，所以今晚是想聊什么？"
              }
            ]
          }
        ]
      },
      {
        "id": "crush-party-turn-2",
        "assistant_message": "也没什么，就是觉得刚才人太多了，有些话在那种场合说不太出来。",
        "emotion_hint": "他在给你单独的分量",
        "strategies": [
          {
            "id": "crush-party-intent-4",
            "label": "顺着靠近",
            "description": "让他把这份认真继续说下去。",
            "replies": [
              {
                "id": "crush-party-reply-2a",
                "style_label": "轻轻接住",
                "style_description": "给他一个继续往下说的空间。",
                "content": "那现在人少了，你可以慢慢说。"
              },
              {
                "id": "crush-party-reply-2b",
                "style_label": "温柔一点",
                "style_description": "把这一刻接成只有你们知道的默契。",
                "content": "嗯，那现在刚刚好，没人打扰。"
              }
            ]
          },
          {
            "id": "crush-party-intent-5",
            "label": "别让他太紧张",
            "description": "给他一点安全感，不催着他表态。",
            "replies": [
              {
                "id": "crush-party-reply-2c",
                "style_label": "放松他",
                "style_description": "让他不用立刻把话说重。",
                "content": "也不用急，你先想到哪儿就说到哪儿。"
              },
              {
                "id": "crush-party-reply-2d",
                "style_label": "稳住气氛",
                "style_description": "把场面撑在舒服的地方。",
                "content": "没关系，我在听，不用一下子想得太完整。"
              }
            ]
          },
          {
            "id": "crush-party-intent-6",
            "label": "轻轻反问",
            "description": "看他是不是愿意更明确一点。",
            "replies": [
              {
                "id": "crush-party-reply-2e",
                "style_label": "往前问一点",
                "style_description": "不逼，但让他再多走一步。",
                "content": "那种话……是只有我适合听，还是你谁都没说过？"
              },
              {
                "id": "crush-party-reply-2f",
                "style_label": "把重点拉出来",
                "style_description": "让他面对这份单独的意味。",
                "content": "你这么说，倒显得今晚这段路有点特别了。"
              }
            ]
          }
        ]
      },
      {
        "id": "crush-party-turn-3",
        "assistant_message": "特别一点也没什么不好，我只是觉得……有些话更想在你面前说。",
        "emotion_hint": "他已经在往前迈了",
        "ending_id": "ending-crush-party-close",
        "ending_prompt": "这段散场后的气氛已经慢慢靠近了，要把它停在这里吗？",
        "strategies": [
          {
            "id": "crush-party-intent-7",
            "label": "接住这份特别",
            "description": "让他知道你看见了这份偏心。",
            "replies": [
              {
                "id": "crush-party-reply-3a",
                "style_label": "柔软回应",
                "style_description": "接住他的偏心，不把气氛吓跑。",
                "content": "那我会认真记住你今晚这句“更想在我面前说”。"
              },
              {
                "id": "crush-party-reply-3b",
                "style_label": "靠近一点",
                "style_description": "把这段特别轻轻落下来。",
                "content": "那听起来，我今晚好像确实被你放在了一个不太一样的位置。"
              }
            ]
          },
          {
            "id": "crush-party-intent-8",
            "label": "留一点余地",
            "description": "别让今晚的气氛太快落地。",
            "replies": [
              {
                "id": "crush-party-reply-3c",
                "style_label": "轻轻停住",
                "style_description": "让这份特别先停在空气里。",
                "content": "那就先把这句话留在今晚吧，感觉已经够特别了。"
              },
              {
                "id": "crush-party-reply-3d",
                "style_label": "不说太满",
                "style_description": "接住心意，但不把答案说完。",
                "content": "嗯，我大概听懂了一点，不过好像还想再多留一点悬念。"
              }
            ]
          },
          {
            "id": "crush-party-intent-9",
            "label": "再推一步",
            "description": "看看他愿不愿意更明确。",
            "replies": [
              {
                "id": "crush-party-reply-3e",
                "style_label": "温柔追问",
                "style_description": "再给他一次把话说透的机会。",
                "content": "那你更想说给我听的，到底是哪一句？"
              },
              {
                "id": "crush-party-reply-3f",
                "style_label": "把话逼近",
                "style_description": "轻轻把模糊的心思推近一点。",
                "content": "你都已经说到这里了，再藏着，好像有点可惜。"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "ex-midnight",
    "title": "深夜的那一句话",
    "category": "前任",
    "cover": {
      "opening_message": "睡了吗？",
      "subtitle": "他很久没联系你了，偏偏挑在今晚开口。",
      "tags": [
        "前任",
        "分手3个月",
        "试探型"
      ]
    },
    "character": {
      "name": "祁川",
      "gender": "男",
      "age": 27,
      "occupation": "品牌策划",
      "relationship": "前任",
      "archetype": "克制试探型",
      "personality": "表面随和但内心敏感，习惯用轻描淡写掩饰在意，不愿先示弱。",
      "speaking_style": "句子短，喜欢先探你的态度，再决定说多少。",
      "attitude_to_relationship": "嘴上说已经翻篇，心里其实还在确认你有没有走远。",
      "initial_mood": "故作平静，带一点迟到的犹豫。",
      "initial_favorability": 45,
      "current_attitude": "还在观察你是不是已经走出来。"
    },
    "background": "你们分开已经三个月，彼此没有彻底拉黑，也没有真正说清楚。直到今晚，他突然发来一句很轻的问候，像迟到很久的一次试探。",
    "scene_prompt": "这一局重点不是立刻复合，而是看你能不能在克制和情绪之间找到更稳的分寸。",
    "ending_triggers": {
      "description": "以下任意条件满足时，对话可进入结局阶段。",
      "conditions": [
        "双方明确表态",
        "情绪已经出现结果",
        "自然走向告别",
        "轮数达到上限"
      ]
    },
    "possible_endings": [
      {
        "id": "ending-ex-soft-return",
        "type": "warmth",
        "label": "重新在意",
        "hint": "你让他重新把目光停回你身上。",
        "impact_line": "你没有回头，但他重新把目光停在了你身上。",
        "relationship_result": "你稳住了情绪，也重新唤起了他对你的在意。",
        "key_behavior_feedback": "你没有急着靠近，反而让他愿意把话再多留一会儿。",
        "missed_branch_hint": "如果第二轮你更主动一点，可能会触发更直接的旧情回流。",
        "literary_closing": "你把分寸留在字句之间，于是旧情绪也悄悄亮了一下。",
        "badge_label": "重新在意"
      },
      {
        "id": "ending-ex-boundary",
        "type": "closure",
        "label": "礼貌收束",
        "hint": "你没有失态，也没有再把门打开。",
        "impact_line": "你没有给他错觉，也没有让自己失守。",
        "relationship_result": "你把这段关系停在了体面的位置，没有再往回退。",
        "key_behavior_feedback": "你始终没有顺着他的试探一路走到底，边界感很稳。",
        "missed_branch_hint": "如果最后一轮再多留一点温度，今晚的走向可能会更暧昧。",
        "literary_closing": "有些晚安不是重新开始，只是终于把一句话说完。",
        "badge_label": "礼貌收束"
      },
      {
        "id": "ending-ex-ambiguous",
        "type": "ambiguous",
        "label": "停在边界",
        "hint": "你们都没有再往前一步。",
        "impact_line": "今晚有一点回暖，但谁都没有把门真正推开。",
        "relationship_result": "这段对话停在一种微妙的边界里，留白比答案更多。",
        "key_behavior_feedback": "你把回应收得很轻，让气氛保住了温度，也保住了距离。",
        "missed_branch_hint": "如果第三轮你更直白一点，可能会迎来完全不同的答复。",
        "literary_closing": "像有人在门外停了一会儿，最后还是把脚步放轻了。",
        "badge_label": "停在边界"
      }
    ],
    "turns": [
      {
        "id": "ex-midnight-turn-1",
        "assistant_message": "睡了吗？",
        "emotion_hint": "",
        "strategies": [
          {
            "id": "ex-midnight-intent-1",
            "label": "先稳住",
            "description": "别显得你一直在等他的消息。",
            "replies": [
              {
                "id": "ex-midnight-reply-1a",
                "style_label": "平静自然",
                "style_description": "平静自然，留有余地。",
                "content": "还没，正准备睡。怎么突然想到找我？"
              },
              {
                "id": "ex-midnight-reply-1b",
                "style_label": "轻轻带过",
                "style_description": "不主动靠近，但也不冷下去。",
                "content": "还醒着，不过已经挺晚了。你怎么这个时候来找我？"
              }
            ]
          },
          {
            "id": "ex-midnight-intent-2",
            "label": "轻轻试探",
            "description": "把问题递回去，看他到底想说什么。",
            "replies": [
              {
                "id": "ex-midnight-reply-1c",
                "style_label": "反问回来",
                "style_description": "把主动权轻轻收回来。",
                "content": "还没睡。你这么晚出现，我有点好奇你是突然想起我，还是有话没说完。"
              },
              {
                "id": "ex-midnight-reply-1d",
                "style_label": "带一点试探",
                "style_description": "让他自己决定要不要继续说下去。",
                "content": "在呢。所以你这句“睡了吗”，后面是打算接什么？"
              }
            ]
          },
          {
            "id": "ex-midnight-intent-3",
            "label": "给点温度",
            "description": "承接住他，但别一下子把门推太开。",
            "replies": [
              {
                "id": "ex-midnight-reply-1e",
                "style_label": "温和接住",
                "style_description": "给一点温度，但不显得急。",
                "content": "还没，看到是你，倒是一下子清醒了点。"
              },
              {
                "id": "ex-midnight-reply-1f",
                "style_label": "留一点柔软",
                "style_description": "让他知道你并不排斥继续聊。",
                "content": "还醒着。你这么晚找我，我还是会下意识看一眼。"
              }
            ]
          }
        ]
      },
      {
        "id": "ex-midnight-turn-2",
        "assistant_message": "没什么，就是突然想起你。最近怎么样？",
        "emotion_hint": "他在试探你",
        "strategies": [
          {
            "id": "ex-midnight-intent-4",
            "label": "显得安稳",
            "description": "让他知道你已经过得不错。",
            "replies": [
              {
                "id": "ex-midnight-reply-2a",
                "style_label": "状态稳定",
                "style_description": "让他看到你已经往前走了。",
                "content": "还不错，最近忙一些新的事，整个人安静了不少。"
              },
              {
                "id": "ex-midnight-reply-2b",
                "style_label": "平稳落地",
                "style_description": "不刻意逞强，但能站稳自己。",
                "content": "挺好的，节奏慢慢稳下来了，很多事也没以前那么拧着了。"
              }
            ]
          },
          {
            "id": "ex-midnight-intent-5",
            "label": "留一点白",
            "description": "不把近况和情绪一下子全摊开。",
            "replies": [
              {
                "id": "ex-midnight-reply-2c",
                "style_label": "不说太满",
                "style_description": "给他空间，也给自己退路。",
                "content": "就那样，日子慢慢过。你忽然这么问，倒有点让我意外。"
              },
              {
                "id": "ex-midnight-reply-2d",
                "style_label": "轻轻留白",
                "style_description": "把真正的情绪藏一点在后面。",
                "content": "还行，有些事想开了，有些事就先放着。"
              }
            ]
          },
          {
            "id": "ex-midnight-intent-6",
            "label": "把话递回去",
            "description": "温和追问他的来意。",
            "replies": [
              {
                "id": "ex-midnight-reply-2e",
                "style_label": "收回主动权",
                "style_description": "让对话重心回到他身上。",
                "content": "我最近还好。你呢，怎么会突然在今天想起我？"
              },
              {
                "id": "ex-midnight-reply-2f",
                "style_label": "慢慢追问",
                "style_description": "不逼问，但让他没法糊弄过去。",
                "content": "我还行，不过我更想知道，你今晚为什么会来找我。"
              }
            ]
          }
        ]
      },
      {
        "id": "ex-midnight-turn-3",
        "assistant_message": "听起来你过得挺好的。那我就放心了。",
        "emotion_hint": "他有点动摇",
        "ending_id": "ending-ex-soft-return",
        "ending_prompt": "他今晚的态度已经有些松动，要把这段对话停在这里吗？",
        "strategies": [
          {
            "id": "ex-midnight-intent-7",
            "label": "留住余温",
            "description": "让这点温度再停留一会儿。",
            "replies": [
              {
                "id": "ex-midnight-reply-3a",
                "style_label": "温柔一点",
                "style_description": "给一点余温，不急着追问。",
                "content": "放心就好。偶尔想起从前，也没那么难受了。"
              },
              {
                "id": "ex-midnight-reply-3b",
                "style_label": "给他一个门缝",
                "style_description": "不明说，但也没把门彻底关上。",
                "content": "嗯，慢慢会好的。有些话以后有机会再说吧。"
              }
            ]
          },
          {
            "id": "ex-midnight-intent-8",
            "label": "稳稳收尾",
            "description": "把关系停在舒服的位置。",
            "replies": [
              {
                "id": "ex-midnight-reply-3c",
                "style_label": "平静收束",
                "style_description": "边界清楚，但不带刺。",
                "content": "嗯，大家都该慢慢过好自己的生活。"
              },
              {
                "id": "ex-midnight-reply-3d",
                "style_label": "体面结束",
                "style_description": "不再往回拉，但也不让气氛难看。",
                "content": "这样也挺好，至少我们都能各自往前走了。"
              }
            ]
          },
          {
            "id": "ex-midnight-intent-9",
            "label": "再探一步",
            "description": "看看他会不会继续往前走。",
            "replies": [
              {
                "id": "ex-midnight-reply-3e",
                "style_label": "轻轻追问",
                "style_description": "不逼，但让真心更靠近一点。",
                "content": "只是放心吗？我还以为你今晚想说的不止这些。"
              },
              {
                "id": "ex-midnight-reply-3f",
                "style_label": "再往前一点",
                "style_description": "把他的迟疑推到更清楚的位置。",
                "content": "你特地来找我，如果只是为了放心，好像也不太像你。"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "ex-photo",
    "title": "他发来了一张照片",
    "category": "前任",
    "cover": {
      "opening_message": "刚翻到这个。",
      "subtitle": "是一张你们以前一起去海边时拍下的照片。",
      "tags": [
        "前任",
        "旧照",
        "回忆拉扯"
      ]
    },
    "character": {
      "name": "顾衡",
      "gender": "男",
      "age": 29,
      "occupation": "摄影师",
      "relationship": "前任",
      "archetype": "借回忆靠近型",
      "personality": "念旧、感性、擅长用物件和细节表达情绪，不太会直接说想念。",
      "speaking_style": "说话不快，容易从细节切入，把真正的情绪藏在看似随意的句子里。",
      "attitude_to_relationship": "明知道关系已经散了，却还会被共同记忆牵回去。",
      "initial_mood": "假装只是分享一张照片，实际上在试你的反应。",
      "initial_favorability": 48,
      "current_attitude": "借回忆靠近你，但还没敢把来意说透。"
    },
    "background": "分开以后，你们很少提起从前。今晚他忽然发来一张旧照片，像是把那段已经沉下去的记忆轻轻拨了一下。",
    "scene_prompt": "这个场景的重点不是争论过去，而是处理“回忆突然回潮”时那种又近又远的拉扯感。",
    "ending_triggers": {
      "description": "以下任意条件满足时，对话可进入结局阶段。",
      "conditions": [
        "回忆已经被明确回应",
        "双方态度有结果",
        "自然告一段落",
        "轮数达到上限"
      ]
    },
    "possible_endings": [
      {
        "id": "ending-ex-photo-soften",
        "type": "warmth",
        "label": "旧事回潮",
        "hint": "你没有拒绝回忆，它也顺势靠近了你。",
        "impact_line": "你接住了那张照片，也接住了他没说出口的怀念。",
        "relationship_result": "今晚的对话没有把过去翻回来，却让旧情绪重新浮上了水面。",
        "key_behavior_feedback": "你没有立刻把话题挡回去，给了他继续靠近的理由。",
        "missed_branch_hint": "如果第二轮你更冷一点，今晚很可能会停在一张照片本身。",
        "literary_closing": "照片没有说话，可你们都从那一瞬间里听见了风声。",
        "badge_label": "旧事回潮"
      },
      {
        "id": "ending-ex-photo-distance",
        "type": "closure",
        "label": "回忆归档",
        "hint": "你看见了回忆，但没有让它重新占据现在。",
        "impact_line": "你承认那天很美，却没有让它替今天说话。",
        "relationship_result": "你把这份回忆收好，没有让它重新左右现在的关系。",
        "key_behavior_feedback": "你既没有否认过去，也没有顺势被拉回去，分寸很清楚。",
        "missed_branch_hint": "如果第三轮你再柔软一点，气氛可能会多出一层未完待续。",
        "literary_closing": "有些照片适合留在相册里，不一定非要回到现场。",
        "badge_label": "回忆归档"
      },
      {
        "id": "ending-ex-photo-ambiguous",
        "type": "ambiguous",
        "label": "风还没停",
        "hint": "话停下了，情绪却没完全停。",
        "impact_line": "你们谁都没提从前，可从前一直在场。",
        "relationship_result": "这段对话停在一种若有若无的余震里，没有答案，也没有彻底结束。",
        "key_behavior_feedback": "你让回应停在可进可退的位置，让他没法轻易读懂你的态度。",
        "missed_branch_hint": "如果你更直接问他来意，今晚的气氛可能会更清楚。",
        "literary_closing": "风已经过去很久了，可海面还是慢慢晃了一下。",
        "badge_label": "风还没停"
      }
    ],
    "turns": [
      {
        "id": "ex-photo-turn-1",
        "assistant_message": "刚翻到这个。",
        "emotion_hint": "",
        "strategies": [
          {
            "id": "ex-photo-intent-1",
            "label": "先看不表态",
            "description": "不急着让情绪先出来。",
            "replies": [
              {
                "id": "ex-photo-reply-1a",
                "style_label": "先接住",
                "style_description": "看见了，但不抢着解释情绪。",
                "content": "看到了。你怎么会突然翻到这张？"
              },
              {
                "id": "ex-photo-reply-1b",
                "style_label": "克制一点",
                "style_description": "先把问题放回去，看他的来意。",
                "content": "嗯，是那次海边。你怎么突然发给我？"
              }
            ]
          },
          {
            "id": "ex-photo-intent-2",
            "label": "顺着回忆",
            "description": "让气氛从照片本身慢慢打开。",
            "replies": [
              {
                "id": "ex-photo-reply-1c",
                "style_label": "轻轻带回忆",
                "style_description": "给回忆一点温度，但不陷进去。",
                "content": "居然还留着。我都快忘了那天风有多大了。"
              },
              {
                "id": "ex-photo-reply-1d",
                "style_label": "柔一点",
                "style_description": "承认那段记忆还在你心里。",
                "content": "这张我记得，那天你还嫌我站得太靠边。"
              }
            ]
          },
          {
            "id": "ex-photo-intent-3",
            "label": "轻问来意",
            "description": "不只聊照片，试探他为什么现在发来。",
            "replies": [
              {
                "id": "ex-photo-reply-1e",
                "style_label": "往前追一点",
                "style_description": "把问题指向他的真实来意。",
                "content": "照片我看到了。不过我更想知道，你今晚为什么会想到发给我。"
              },
              {
                "id": "ex-photo-reply-1f",
                "style_label": "不让他糊弄",
                "style_description": "看似平静，实际把重心拉到当下。",
                "content": "突然发旧照这件事，本身就不像只是“翻到”。你想说什么？"
              }
            ]
          }
        ]
      },
      {
        "id": "ex-photo-turn-2",
        "assistant_message": "没别的意思，就是觉得那天的光线挺好。然后顺手想到你了。",
        "emotion_hint": "他在借回忆靠近你",
        "strategies": [
          {
            "id": "ex-photo-intent-4",
            "label": "接住这份想起",
            "description": "不拆穿他，顺着一点点靠近。",
            "replies": [
              {
                "id": "ex-photo-reply-2a",
                "style_label": "轻轻接住",
                "style_description": "给他一个继续往下说的空间。",
                "content": "嗯，有些画面确实会让人一下子想起以前的人。"
              },
              {
                "id": "ex-photo-reply-2b",
                "style_label": "不戳破",
                "style_description": "懂他的来意，但不把它说得太重。",
                "content": "我懂，旧照片有时候就是会把人带回去一下。"
              }
            ]
          },
          {
            "id": "ex-photo-intent-5",
            "label": "把重心放现在",
            "description": "承认回忆，但不让现在失守。",
            "replies": [
              {
                "id": "ex-photo-reply-2c",
                "style_label": "拉回当下",
                "style_description": "不让回忆完全带走节奏。",
                "content": "照片挺好，不过现在再看，感觉和那时候已经不太一样了。"
              },
              {
                "id": "ex-photo-reply-2d",
                "style_label": "留住边界",
                "style_description": "看见过去，但站稳现在。",
                "content": "会想起归会想起，但人总还是要回到现在的。"
              }
            ]
          },
          {
            "id": "ex-photo-intent-6",
            "label": "继续问清楚",
            "description": "看看他到底是怀念照片，还是怀念你。",
            "replies": [
              {
                "id": "ex-photo-reply-2e",
                "style_label": "问得温和",
                "style_description": "让他有机会说真话。",
                "content": "只是想到那天，还是想到我这个人？"
              },
              {
                "id": "ex-photo-reply-2f",
                "style_label": "再往里问",
                "style_description": "把模糊的来意逼近一点。",
                "content": "你今晚发这张照片给我，真的是因为光线吗？"
              }
            ]
          }
        ]
      },
      {
        "id": "ex-photo-turn-3",
        "assistant_message": "你还是会记得这些细节啊。我还以为你早就都放下了。",
        "emotion_hint": "他开始认真看你的态度",
        "ending_id": "ending-ex-photo-soften",
        "ending_prompt": "这张照片已经把情绪带出来了，要把今晚停在这里吗？",
        "strategies": [
          {
            "id": "ex-photo-intent-7",
            "label": "留一点柔软",
            "description": "让他知道你不是全然无感。",
            "replies": [
              {
                "id": "ex-photo-reply-3a",
                "style_label": "温和回应",
                "style_description": "承认记得，但不把话说满。",
                "content": "有些事不会一下子忘掉，只是没必要总挂在嘴边。"
              },
              {
                "id": "ex-photo-reply-3b",
                "style_label": "轻轻松口",
                "style_description": "给回忆一点位置，也给自己留分寸。",
                "content": "记得归记得，不过也只是偶尔会想起。"
              }
            ]
          },
          {
            "id": "ex-photo-intent-8",
            "label": "把话收回来",
            "description": "别让气氛继续往旧关系里滑。",
            "replies": [
              {
                "id": "ex-photo-reply-3c",
                "style_label": "温和收束",
                "style_description": "承认过去，但不再延伸。",
                "content": "记得也正常，毕竟那时候也是真的发生过。"
              },
              {
                "id": "ex-photo-reply-3d",
                "style_label": "体面落下",
                "style_description": "不冷，却明确停在这里。",
                "content": "嗯，不过想起归想起，大家还是各自往前走比较重要。"
              }
            ]
          },
          {
            "id": "ex-photo-intent-9",
            "label": "再问一步",
            "description": "看看他会不会把话说透。",
            "replies": [
              {
                "id": "ex-photo-reply-3e",
                "style_label": "把门推开一点",
                "style_description": "让他决定要不要再向前一步。",
                "content": "那你今晚发给我，是想确认我放没放下，还是想确认你自己？"
              },
              {
                "id": "ex-photo-reply-3f",
                "style_label": "柔着追问",
                "style_description": "不带压迫地逼近真实。",
                "content": "你如果只是想分享照片，其实不用特意挑今晚。"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "social-loan",
    "title": "朋友借钱不还，你要不要开口",
    "category": "社交",
    "cover": {
      "opening_message": "那个钱，我这周可能还得缓一下。",
      "subtitle": "他先开口示弱，但你心里已经憋了很久。",
      "tags": [
        "社交",
        "借钱",
        "边界感"
      ]
    },
    "character": {
      "name": "陈泽",
      "gender": "男",
      "age": 28,
      "occupation": "自由职业",
      "relationship": "朋友",
      "archetype": "会回避的熟人型",
      "personality": "不好意思正面处理压力，一旦尴尬就会拖延或转移话题。",
      "speaking_style": "语气软，喜欢先示弱，让场面别太难看。",
      "attitude_to_relationship": "不想因为钱把关系闹僵，但也不愿意太快面对自己的失约。",
      "initial_mood": "心虚，想先用缓和语气把这件事拖过去。",
      "initial_favorability": 42,
      "current_attitude": "想保住关系，也想回避真正的压力。"
    },
    "background": "朋友之前向你借了一笔钱，说很快就还。时间已经拖了很久，你一直没好意思开口。今晚他主动发来消息，却还是在说“再缓一下”。",
    "scene_prompt": "这个场景不是教你吵架，而是练习怎么在关系和底线之间把话说清楚。",
    "ending_triggers": {
      "description": "以下任意条件满足时，对话可进入结局阶段。",
      "conditions": [
        "还款节奏说清楚",
        "边界表达明确",
        "情绪已经有结果",
        "轮数达到上限"
      ]
    },
    "possible_endings": [
      {
        "id": "ending-social-loan-clear",
        "type": "closure",
        "label": "把话说清了",
        "hint": "你没有撕破脸，但终于把底线摆到了桌面上。",
        "impact_line": "你没有发火，却让这件事第一次变得清楚起来。",
        "relationship_result": "你把一直不敢开口的那句话说了出来，关系和边界终于都落到了明处。",
        "key_behavior_feedback": "你没有绕开重点，而是把期限和感受都说得足够清楚。",
        "missed_branch_hint": "如果第二轮你继续顾全气氛，这件事可能还会被拖过去。",
        "literary_closing": "有些关系不是靠忍着维持，而是靠把难说的话说出来。",
        "badge_label": "把话说清了"
      },
      {
        "id": "ending-social-loan-soft",
        "type": "ambiguous",
        "label": "关系先保住",
        "hint": "你没把气氛弄僵，但底线也还没完全落地。",
        "impact_line": "你把锋利收住了，可那根刺还留在心里。",
        "relationship_result": "你选择先把关系放在前面，这次对话没有彻底解决问题。",
        "key_behavior_feedback": "你顾及了他的处境，却没把自己的不舒服完全说出来。",
        "missed_branch_hint": "如果最后一轮你再明确一点，这件事可能会真正往前推进。",
        "literary_closing": "有些体面来得太轻，会让委屈继续留在原地。",
        "badge_label": "关系先保住"
      },
      {
        "id": "ending-social-loan-tense",
        "type": "rupture",
        "label": "关系发紧",
        "hint": "你把忍耐一下子翻出来了，气氛也跟着绷住了。",
        "impact_line": "那句忍了很久的话终于说出口，空气一下子全变了。",
        "relationship_result": "你终于不再替这段关系消化委屈，但对方也明显开始后退。",
        "key_behavior_feedback": "你把积压太久的情绪一次性倒出来，让事情一下从拖延变成对峙。",
        "missed_branch_hint": "如果第一轮先锁时间，再谈情绪，冲突可能会小一些。",
        "literary_closing": "不是所有沉默都会换来理解，有些只会把火留得更久。",
        "badge_label": "关系发紧"
      }
    ],
    "turns": [
      {
        "id": "social-loan-turn-1",
        "assistant_message": "那个钱，我这周可能还得缓一下。",
        "emotion_hint": "",
        "strategies": [
          {
            "id": "social-loan-intent-1",
            "label": "先不翻脸",
            "description": "稳住情绪，先让事情说清楚。",
            "replies": [
              {
                "id": "social-loan-reply-1a",
                "style_label": "平静确认",
                "style_description": "先接住，再把重点带回来。",
                "content": "我知道你现在可能也有压力，但这件事我还是想跟你确认一个具体时间。"
              },
              {
                "id": "social-loan-reply-1b",
                "style_label": "稳住气氛",
                "style_description": "不发火，但不再让它糊过去。",
                "content": "可以理解，不过这笔钱已经拖了挺久了，我还是想知道你打算怎么安排。"
              }
            ]
          },
          {
            "id": "social-loan-intent-2",
            "label": "把底线说出",
            "description": "让他知道你已经不舒服了。",
            "replies": [
              {
                "id": "social-loan-reply-1c",
                "style_label": "直接一点",
                "style_description": "不再只顾全气氛。",
                "content": "我得跟你说实话，这件事一直拖着，我这边已经有点难受了。"
              },
              {
                "id": "social-loan-reply-1d",
                "style_label": "坦白感受",
                "style_description": "先说感受，再谈解决。",
                "content": "我其实一直都不太好意思催，但拖到现在，我心里已经开始别扭了。"
              }
            ]
          },
          {
            "id": "social-loan-intent-3",
            "label": "先锁时间",
            "description": "不先谈情绪，先把还款节奏说清楚。",
            "replies": [
              {
                "id": "social-loan-reply-1e",
                "style_label": "锁具体点",
                "style_description": "把模糊的“缓一下”变成时间。",
                "content": "缓一下可以，但我需要一个明确一点的时间，不想一直悬着。"
              },
              {
                "id": "social-loan-reply-1f",
                "style_label": "把话落地",
                "style_description": "先把模糊拖延收住。",
                "content": "那你给我一个具体日期吧，这样我也好心里有数。"
              }
            ]
          }
        ]
      },
      {
        "id": "social-loan-turn-2",
        "assistant_message": "我知道，主要最近手头真的有点紧。我不是不想还，就是还没缓过来。",
        "emotion_hint": "他在示弱，也在回避",
        "strategies": [
          {
            "id": "social-loan-intent-4",
            "label": "理解但不松",
            "description": "承认他的难处，但不让问题继续漂着。",
            "replies": [
              {
                "id": "social-loan-reply-2a",
                "style_label": "理解并落地",
                "style_description": "既给理解，也要结果。",
                "content": "我能理解你现在的情况，所以我更希望我们把时间说清楚，别一直拖着。"
              },
              {
                "id": "social-loan-reply-2b",
                "style_label": "温和坚持",
                "style_description": "不把气氛弄僵，但不退回模糊里。",
                "content": "我不是要逼你，可这件事总得有个明确安排，不然我这边也一直悬着。"
              }
            ]
          },
          {
            "id": "social-loan-intent-5",
            "label": "讲清影响",
            "description": "让他知道这件事对你也有实际影响。",
            "replies": [
              {
                "id": "social-loan-reply-2c",
                "style_label": "说出现实",
                "style_description": "把你的压力也摆出来。",
                "content": "我明白你不容易，但这笔钱对我来说也不是完全没有影响，所以我需要更确定一点。"
              },
              {
                "id": "social-loan-reply-2d",
                "style_label": "别再自己消化",
                "style_description": "不再只替关系兜着情绪。",
                "content": "我一直没催，是怕关系变尴尬。但一直这样拖，对我其实也不太公平。"
              }
            ]
          },
          {
            "id": "social-loan-intent-6",
            "label": "给出方案",
            "description": "如果一次还不上，就谈具体分期。",
            "replies": [
              {
                "id": "social-loan-reply-2e",
                "style_label": "把事变小",
                "style_description": "降低对方压力，也让事情往前动。",
                "content": "如果这周一次还不上，我们可以先定一个分几次还的安排。"
              },
              {
                "id": "social-loan-reply-2f",
                "style_label": "给台阶但要落地",
                "style_description": "不是放过，而是换一个能执行的办法。",
                "content": "你如果现在压力大，那我们别只说“再缓一下”，直接定个你能做到的方式。"
              }
            ]
          }
        ]
      },
      {
        "id": "social-loan-turn-3",
        "assistant_message": "那这样吧，我下周先转你一部分，剩下的月底前补齐。你看这样行吗？",
        "emotion_hint": "他终于开始正面给方案",
        "ending_id": "ending-social-loan-clear",
        "ending_prompt": "这件事终于开始往明确的方向走了，要在这里收住吗？",
        "strategies": [
          {
            "id": "social-loan-intent-7",
            "label": "明确确认",
            "description": "把这次约定落到具体上。",
            "replies": [
              {
                "id": "social-loan-reply-3a",
                "style_label": "把话钉住",
                "style_description": "确认时间，不再模糊。",
                "content": "可以，那我们就按这个来：下周先一部分，月底前补齐，别再往后拖了。"
              },
              {
                "id": "social-loan-reply-3b",
                "style_label": "平静确认",
                "style_description": "既不追着不放，也不让约定飘掉。",
                "content": "行，那就这么定。我不是想为难你，只是希望这次能按说好的来。"
              }
            ]
          },
          {
            "id": "social-loan-intent-8",
            "label": "留一点体面",
            "description": "让关系别太紧，但底线还在。",
            "replies": [
              {
                "id": "social-loan-reply-3c",
                "style_label": "关系先稳",
                "style_description": "把场面放松一点，但不撤回要求。",
                "content": "可以，至少现在终于有个明确说法了。我就按这个时间等你。"
              },
              {
                "id": "social-loan-reply-3d",
                "style_label": "不再追着压",
                "style_description": "让关系有口气，但事情仍然落地。",
                "content": "好，那就按这个安排吧。后面只要别再失约，我这边就能安心。"
              }
            ]
          },
          {
            "id": "social-loan-intent-9",
            "label": "顺手补一句",
            "description": "把你的感受也轻轻说清楚。",
            "replies": [
              {
                "id": "social-loan-reply-3e",
                "style_label": "把心里话补上",
                "style_description": "让关系以后不再靠忍着维持。",
                "content": "可以，我接受这个安排。不过以后这种事你还是早点跟我说清楚，我会轻松很多。"
              },
              {
                "id": "social-loan-reply-3f",
                "style_label": "柔着立边界",
                "style_description": "既收束事情，也不再让自己委屈。",
                "content": "那就这么定吧。其实我最在意的不是多等几天，是一直没个明确说法。"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "work-tonight",
    "title": "“这个方案今晚改出来。”",
    "category": "职场",
    "cover": {
      "opening_message": "这个方案今晚改出来。",
      "subtitle": "他把压力直接压过来，等着看你怎么接。",
      "tags": [
        "职场",
        "临时加需求",
        "强势型"
      ]
    },
    "character": {
      "name": "周岑",
      "gender": "男",
      "age": 34,
      "occupation": "项目负责人",
      "relationship": "直属领导",
      "archetype": "结果优先型",
      "personality": "强势、务实、看重结果，默认别人会配合他的节奏。",
      "speaking_style": "直接、压缩字数、几乎不留情绪缓冲。",
      "attitude_to_relationship": "默认你会配合，但也在观察你的职业成熟度。",
      "initial_mood": "着急推进项目，对你的负荷感知不高。",
      "initial_favorability": 38,
      "current_attitude": "默认你会配合，但还没意识到你也有边界。"
    },
    "background": "项目临近节点，领导在下班前突然追加了修改需求。你不想把关系聊僵，也不想默认所有临时压力都要你接住。",
    "scene_prompt": "重点不是硬碰硬，而是在尊重与边界之间找到更稳的表达方式。",
    "ending_triggers": {
      "description": "以下任意条件满足时，对话可进入结局阶段。",
      "conditions": [
        "交付节奏达成共识",
        "边界表达清楚",
        "气氛已经出现结果",
        "轮数达到上限"
      ]
    },
    "possible_endings": [
      {
        "id": "ending-work-balance",
        "type": "closure",
        "label": "稳住边界",
        "hint": "你没有硬碰硬，却把分寸留住了。",
        "impact_line": "你没有硬碰硬，却把分寸稳稳留在了自己的位置上。",
        "relationship_result": "你没有硬碰硬，但也把自己的工作边界表达清楚了。",
        "key_behavior_feedback": "你先接住了事情，再提出节奏建议，让对话留在专业里。",
        "missed_branch_hint": "如果第一轮更直接拒绝，关系可能会更紧绷，也可能更快完成协商。",
        "literary_closing": "你没有把锋芒抬高，只是把分寸放对了位置。",
        "badge_label": "稳住边界"
      },
      {
        "id": "ending-work-overtime",
        "type": "rupture",
        "label": "被动接单",
        "hint": "你保住了表面平静，但牺牲了自己的节奏。",
        "impact_line": "你把任务接住了，也把自己的疲惫一起吞了下去。",
        "relationship_result": "这轮对话没有起冲突，但你最终还是默认接受了不合理节奏。",
        "key_behavior_feedback": "你一直在顺着需求走，没有把真正的风险和边界说出来。",
        "missed_branch_hint": "如果第二轮更明确地拆解范围，结果可能不会只剩下被动接受。",
        "literary_closing": "有些沉默看起来像专业，其实只是把疲惫藏得更深。",
        "badge_label": "被动接单"
      },
      {
        "id": "ending-work-negotiate",
        "type": "warmth",
        "label": "重新协商",
        "hint": "他开始接受你的节奏，而不是只盯着结果。",
        "impact_line": "你没有顶回去，却让对方第一次认真听你的节奏。",
        "relationship_result": "你把这场压力对话慢慢谈成了更成熟的协作协商。",
        "key_behavior_feedback": "你没有陷进情绪里，而是把范围和质量风险说得足够清楚。",
        "missed_branch_hint": "如果第三轮再主动一点，后续协作关系可能会更顺。",
        "literary_closing": "真正的分寸不是拒绝一切，而是让别人看见你的边界也有道理。",
        "badge_label": "重新协商"
      }
    ],
    "turns": [
      {
        "id": "work-tonight-turn-1",
        "assistant_message": "这个方案今晚改出来。",
        "emotion_hint": "",
        "strategies": [
          {
            "id": "work-tonight-intent-1",
            "label": "先接任务",
            "description": "别让对话一开始就顶住。",
            "replies": [
              {
                "id": "work-tonight-reply-1a",
                "style_label": "职业接法",
                "style_description": "先接住，再把节奏拉回专业。",
                "content": "可以，我先确认一下优先改哪些部分，避免今晚返工。"
              },
              {
                "id": "work-tonight-reply-1b",
                "style_label": "先接后问",
                "style_description": "承接任务，再确认重点。",
                "content": "收到，我这边可以推进，不过得先对齐一下最关键的改动点。"
              }
            ]
          },
          {
            "id": "work-tonight-intent-2",
            "label": "确认范围",
            "description": "先把要改什么说清楚。",
            "replies": [
              {
                "id": "work-tonight-reply-1c",
                "style_label": "拆清重点",
                "style_description": "避免模糊执行。",
                "content": "我可以改，但需要您先明确最关键的两处修改。"
              },
              {
                "id": "work-tonight-reply-1d",
                "style_label": "锁优先级",
                "style_description": "把任务先拆成可执行的范围。",
                "content": "为了今晚能准时出版本，您先帮我锁一下这次调整的优先顺序。"
              }
            ]
          },
          {
            "id": "work-tonight-intent-3",
            "label": "稳稳设边界",
            "description": "说明节奏，但不直接对抗。",
            "replies": [
              {
                "id": "work-tonight-reply-1e",
                "style_label": "边界表达",
                "style_description": "语气稳，但分寸清楚。",
                "content": "我能继续推进，但需要先明确最关键的两处改动。"
              },
              {
                "id": "work-tonight-reply-1f",
                "style_label": "说明现实",
                "style_description": "把节奏和质量一起摆出来。",
                "content": "今晚可以做，不过如果想保证质量，我得按优先级来处理。"
              }
            ]
          }
        ]
      },
      {
        "id": "work-tonight-turn-2",
        "assistant_message": "重点你应该清楚，明早我就要看版本。",
        "emotion_hint": "他还在施压",
        "strategies": [
          {
            "id": "work-tonight-intent-4",
            "label": "推进协商",
            "description": "把任务拆成今晚可交付的节奏。",
            "replies": [
              {
                "id": "work-tonight-reply-2a",
                "style_label": "清晰拆解",
                "style_description": "给出可执行替代方案。",
                "content": "我理解时效，今晚可以先出核心版，细节优化明早补齐给您确认。"
              },
              {
                "id": "work-tonight-reply-2b",
                "style_label": "节奏协商",
                "style_description": "把任务拆成两段，稳住质量。",
                "content": "那我先把影响最大的部分今晚完成，剩下的优化项明早并进去。"
              }
            ]
          },
          {
            "id": "work-tonight-intent-5",
            "label": "争取缓冲",
            "description": "说明时间和质量之间的现实关系。",
            "replies": [
              {
                "id": "work-tonight-reply-2c",
                "style_label": "稳定协商",
                "style_description": "把风险讲清楚，不带情绪。",
                "content": "如果要保证质量，我建议先锁两项关键修改，今晚就能稳妥交付。"
              },
              {
                "id": "work-tonight-reply-2d",
                "style_label": "说明约束",
                "style_description": "让他看到临时加量的代价。",
                "content": "我可以今晚继续做，但如果范围不收住，明早版本质量会受影响。"
              }
            ]
          },
          {
            "id": "work-tonight-intent-6",
            "label": "只谈交付",
            "description": "不接情绪，只回到执行本身。",
            "replies": [
              {
                "id": "work-tonight-reply-2e",
                "style_label": "专业回应",
                "style_description": "把注意力放回目标。",
                "content": "明白，那我现在就按优先级推进，先确保明早能看到可确认版本。"
              },
              {
                "id": "work-tonight-reply-2f",
                "style_label": "冷静落回目标",
                "style_description": "不让对话被压力带跑。",
                "content": "收到，我先以结果为目标推进，过程里有变化我会及时同步。"
              }
            ]
          }
        ]
      },
      {
        "id": "work-tonight-turn-3",
        "assistant_message": "行，那你先按这个节奏推进，十一点前给我初版。",
        "emotion_hint": "他开始接受你的节奏",
        "ending_id": "ending-work-balance",
        "ending_prompt": "这轮协商已经稳住了，要把这一局收在这里吗？",
        "strategies": [
          {
            "id": "work-tonight-intent-7",
            "label": "确认交付",
            "description": "把边界正式落到执行里。",
            "replies": [
              {
                "id": "work-tonight-reply-3a",
                "style_label": "清晰收尾",
                "style_description": "边界明确，执行落地。",
                "content": "收到，我先出初版，涉及新增方向的部分我会在备注里单独标清。"
              },
              {
                "id": "work-tonight-reply-3b",
                "style_label": "交付确认",
                "style_description": "把范围和时间同时确认下来。",
                "content": "明白，我按这个范围推进，十一点前把初版和修改说明一起发您。"
              }
            ]
          },
          {
            "id": "work-tonight-intent-8",
            "label": "保持尊重",
            "description": "语气稳住，不再额外顶回去。",
            "replies": [
              {
                "id": "work-tonight-reply-3c",
                "style_label": "专业留痕",
                "style_description": "让后续协作更顺一点。",
                "content": "没问题，我按这个范围推进，十一点前把版本和修改点一并发您。"
              },
              {
                "id": "work-tonight-reply-3d",
                "style_label": "稳住语气",
                "style_description": "把执行和进度同步说清楚。",
                "content": "好的，我先推进，稍后把当前进度和十一点前可交付内容同步给您。"
              }
            ]
          },
          {
            "id": "work-tonight-intent-9",
            "label": "留一手缓冲",
            "description": "避免后面再被临时加码。",
            "replies": [
              {
                "id": "work-tonight-reply-3e",
                "style_label": "先锁范围",
                "style_description": "防止需求继续膨胀。",
                "content": "收到，我先按现在确认的内容推进，新的调整我会放到下一轮统一处理。"
              },
              {
                "id": "work-tonight-reply-3f",
                "style_label": "提前留缓冲",
                "style_description": "让后续协作不再完全被动。",
                "content": "可以，我先完成这一版初稿，后续新增项我们再单独排优先级。"
              }
            ]
          }
        ]
      }
    ]
  }
];

exports.main = async () => {
  try {
    // 动态加载所有剧本文件
    const scenarios = loadScenariosFromDirectory();
    
    if (scenarios.length === 0) {
      return {
        code: -1,
        message: "未找到任何剧本，请检查 /data/scenarios/ 目录"
      };
    }

    let imported = 0;
    let skipped = 0;
    const details = [];

    for (const scenario of scenarios) {
      try {
        const existing = await db.collection("scenarios").where({ id: scenario.id }).limit(1).get();
        if (existing.data.length) {
          skipped += 1;
          details.push({ 
            id: scenario.id, 
            title: scenario.title,
            status: "skipped" 
          });
          continue;
        }

        await db.collection("scenarios").add({ data: scenario });
        imported += 1;
        details.push({ 
          id: scenario.id, 
          title: scenario.title,
          status: "imported" 
        });
      } catch (err) {
        console.error(`[importScenarios] 导入剧本 ${scenario.id} 失败:`, err.message);
        details.push({ 
          id: scenario.id, 
          title: scenario.title,
          status: "error", 
          message: err.message 
        });
      }
    }

    return {
      code: 0,
      data: {
        imported,
        skipped,
        total: scenarios.length,
        details
      },
      message: `导入 ${imported} 个新剧本，跳过 ${skipped} 个已存在的剧本`
    };
  } catch (error) {
    console.error(`[importScenarios] 错误:`, error.message);
    return {
      code: -1,
      message: error.message || "导入失败"
    };
  }
};
