module.exports = {
  id: "crush-direct",
  title: "“你是不是有话想跟我说？”",
  category: "暗恋",
  cover: {
    opening_message: "你是不是有话想跟我说？",
    subtitle: "他比平时更直接，像给了你一个窗口。",
    tags: ["暗恋", "认识半年", "主动型"]
  },
  character: {
    name: "林朝",
    gender: "男",
    age: 25,
    occupation: "插画师",
    relationship: "暧昧对象",
    archetype: "主动观察型",
    personality: "敏感、有趣、擅长捕捉情绪，对喜欢的人会带一点若有若无的主动。",
    speaking_style: "喜欢留白，偶尔用玩笑试你，认真时反而更轻声。",
    attitude_to_relationship: "对你有兴趣，但还没有彻底摊牌。",
    initial_mood: "试着把气氛往更近的地方推一点。",
    initial_favorability: 60,
    current_attitude: "对你有好奇，也在等你给更明确的信号。"
  },
  background: "你们认识半年，平时聊天不少，却始终没有把关系真正推到更靠近的位置。今晚他突然这样开口，像是在把那层窗纸轻轻挑起来。",
  scene_prompt: "这个场景的重点不是立刻表白，而是让暧昧和心动真的有节奏地升温。",
  ending_triggers: {
    description: "以下任意条件满足时，对话可进入结局阶段。",
    conditions: ["暧昧已经明显升温", "双方有明确试探结果", "自然停在留白", "轮数达到上限"]
  },
  possible_endings: [
    {
      id: "ending-crush-warmth",
      type: "warmth",
      label: "气氛升温",
      hint: "他开始认真接你的话了。",
      impact_line: "他开始认真接你的话，暧昧终于有了温度。",
      relationship_result: "你把暧昧聊出了温度，对方开始认真留意你的回应。",
      key_behavior_feedback: "你没有把话说满，却刚好给了他继续靠近的空间。",
      missed_branch_hint: "如果最后一轮再大胆一点，可能会出现更明确的心意确认。",
      literary_closing: "有些靠近不是突然发生的，是一句一句被你轻轻推近的。",
      badge_label: "气氛升温"
    },
    {
      id: "ending-crush-pause",
      type: "ambiguous",
      label: "停在心照不宣",
      hint: "你们都懂了一点，但谁都没说破。",
      impact_line: "今晚的空气已经变了，可你们都把答案留在了眼神外面。",
      relationship_result: "这段暧昧停在一种刚刚好的心照不宣里，没有彻底挑明。",
      key_behavior_feedback: "你一直在给回应，但从没把自己完全暴露出去。",
      missed_branch_hint: "如果第二轮你更主动一点，走向会更像一次真正的表态。",
      literary_closing: "像是灯光刚好落下来，谁都没有伸手去关。",
      badge_label: "心照不宣"
    },
    {
      id: "ending-crush-drift",
      type: "closure",
      label: "话题飘散",
      hint: "你们没有把这次机会接住。",
      impact_line: "那扇门开过一下，但你们都没有真的走进去。",
      relationship_result: "今晚的对话没有坏掉，只是没能把关系往前推进。",
      key_behavior_feedback: "你始终没有给出足够明确的情绪，气氛就慢慢散掉了。",
      missed_branch_hint: "如果最后一轮少一点玩笑，多一点认真，可能会完全不同。",
      literary_closing: "有些夜晚很适合心动，也很适合什么都不发生。",
      badge_label: "话题飘散"
    }
  ],
  turns: [
    {
      id: "crush-direct-turn-1",
      assistant_message: "你是不是有话想跟我说？",
      emotion_hint: "",
      strategies: [
        {
          id: "crush-direct-intent-1",
          label: "别太快承认",
          description: "先看看他是不是认真的。",
          replies: [
            { id: "crush-direct-reply-1a", style_label: "半真半假", style_description: "有心动，但不立刻交底。", content: "可能有，不过我还在想要不要现在说。" },
            { id: "crush-direct-reply-1b", style_label: "先不点头", style_description: "让他继续往前一点。", content: "你这句问得太突然了，我都不知道该不该承认。" }
          ]
        },
        {
          id: "crush-direct-intent-2",
          label: "顺势接住",
          description: "把气氛轻轻往前推一点。",
          replies: [
            { id: "crush-direct-reply-1c", style_label: "给他信号", style_description: "让他知道你不是完全没想法。", content: "如果我说有，你会认真听吗？" },
            { id: "crush-direct-reply-1d", style_label: "顺着靠近", style_description: "把问题递回去，带一点暧昧。", content: "可能有啊，就看你今晚有没有当个合格的听众了。" }
          ]
        },
        {
          id: "crush-direct-intent-3",
          label: "装作轻松",
          description: "先别把场面弄得太用力。",
          replies: [
            { id: "crush-direct-reply-1e", style_label: "轻松玩笑", style_description: "让气氛舒服，但不散掉。", content: "那得看你想听哪一种了。" },
            { id: "crush-direct-reply-1f", style_label: "自然打趣", style_description: "留一点玩笑感，让他继续试你。", content: "怎么，今天突然这么敏锐，是不是偷看我表情了？" }
          ]
        }
      ]
    },
    {
      id: "crush-direct-turn-2",
      assistant_message: "听起来像是件不太随便的话，我现在有点好奇了。",
      emotion_hint: "他开始好奇了",
      strategies: [
        {
          id: "crush-direct-intent-4",
          label: "顺着暧昧",
          description: "让他继续往这层气氛里走。",
          replies: [
            { id: "crush-direct-reply-2a", style_label: "继续升温", style_description: "把距离再轻轻拉近一点。", content: "那你可以先保持一下这份好奇，我也想看看你会不会继续追问。" },
            { id: "crush-direct-reply-2b", style_label: "往前一点", style_description: "给一点更明确的靠近感。", content: "你现在这个反应，已经让我有点想把后半句说出来了。" }
          ]
        },
        {
          id: "crush-direct-intent-5",
          label: "给他安全感",
          description: "让他知道这不是负担，是信任。",
          replies: [
            { id: "crush-direct-reply-2c", style_label: "温柔承认", style_description: "把认真感放出来一点。", content: "就是有些话，只适合在你认真一点的时候说。" },
            { id: "crush-direct-reply-2d", style_label: "慢慢放下防备", style_description: "让他知道你不是在吊着他。", content: "也不是什么让人为难的话，只是我比较想在对的时候告诉你。" }
          ]
        },
        {
          id: "crush-direct-intent-6",
          label: "继续留白",
          description: "让他主动一点，不急着给答案。",
          replies: [
            { id: "crush-direct-reply-2e", style_label: "把悬念留下", style_description: "让他继续靠近你。", content: "先别急，我还想看看你会不会自己猜到。" },
            { id: "crush-direct-reply-2f", style_label: "不说太满", style_description: "给他留一步，也给自己留一步。", content: "也许等你再认真一点，我会更想开口。" }
          ]
        }
      ]
    },
    {
      id: "crush-direct-turn-3",
      assistant_message: "那我现在算不算已经认真起来了？",
      emotion_hint: "气氛开始升温",
      ending_id: "ending-crush-warmth",
      ending_prompt: "他已经被你带进这段气氛里了，要把今晚停在这里吗？",
      strategies: [
        {
          id: "crush-direct-intent-7",
          label: "给他台阶",
          description: "让这份认真自然落下来。",
          replies: [
            { id: "crush-direct-reply-3a", style_label: "柔和回应", style_description: "既接住，也不把话说死。", content: "可能算吧，至少比平时更像是在认真听我说话了。" },
            { id: "crush-direct-reply-3b", style_label: "顺势靠近", style_description: "给他一点明确的正反馈。", content: "算啊，所以我现在开始有点想认真回答你了。" }
          ]
        },
        {
          id: "crush-direct-intent-8",
          label: "再留一点白",
          description: "别把答案一下给完。",
          replies: [
            { id: "crush-direct-reply-3c", style_label: "继续暧昧", style_description: "让这层气氛停留更久一点。", content: "如果你再认真一点，我可能就真的会说了。" },
            { id: "crush-direct-reply-3d", style_label: "故意留一点", style_description: "让他继续往前靠近。", content: "差不多了，不过还差一点点能让我彻底点头的证据。" }
          ]
        },
        {
          id: "crush-direct-intent-9",
          label: "保持轻松",
          description: "不要让这轮突然太重。",
          replies: [
            { id: "crush-direct-reply-3e", style_label: "轻松接住", style_description: "让气氛轻盈地往前走。", content: "你这样问，已经很像在给我递话筒了。" },
            { id: "crush-direct-reply-3f", style_label: "玩笑里靠近", style_description: "既不沉重，也不躲开。", content: "勉强算吧，至少已经到我愿意继续聊下去的程度了。" }
          ]
        }
      ]
    }
  ]
};
