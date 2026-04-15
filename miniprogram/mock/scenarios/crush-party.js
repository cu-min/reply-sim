module.exports = {
  id: "crush-party",
  title: "朋友聚会后他单独找你说话",
  category: "暗恋",
  cover: {
    opening_message: "要不要一起走一段？",
    subtitle: "聚会散场后，他故意慢了一步。",
    tags: ["暗恋", "聚会后", "单独时刻"]
  },
  character: {
    name: "周屿",
    gender: "男",
    age: 26,
    occupation: "产品经理",
    relationship: "朋友以上未满",
    archetype: "慢热靠近型",
    personality: "理性里带一点温柔，平时不太会抢话，但一旦认真会把细节记得很牢。",
    speaking_style: "语速慢，句子不长，越认真越克制。",
    attitude_to_relationship: "对你有明显偏心，但怕太快把氛围弄坏。",
    initial_mood: "想借散场后的片刻靠近你一点。",
    initial_favorability: 58,
    current_attitude: "在试着制造一个只有你们两个人的空间。"
  },
  background: "朋友聚会刚结束，大家陆续散开。他没跟其他人一起走，而是在楼下故意慢了一步，像在等你。等到只剩你们两个时，他轻声开口。",
  scene_prompt: "这个场景的核心是散场后的单独时刻，既有暧昧，也很怕一开口就把气氛打碎。",
  ending_triggers: {
    description: "以下任意条件满足时，对话可进入结局阶段。",
    conditions: ["单独气氛已经建立", "双方试探有结果", "自然停留在留白", "轮数达到上限"]
  },
  possible_endings: [
    {
      id: "ending-crush-party-close",
      type: "warmth",
      label: "靠近了一点",
      hint: "你们终于把朋友之外的空气留住了。",
      impact_line: "你没有把这段路走快，于是他终于敢慢慢靠近你。",
      relationship_result: "这次散场没有结束在告别里，而是让你们更像在往彼此那边走。",
      key_behavior_feedback: "你没有急着给答案，而是让他的主动自然落下来。",
      missed_branch_hint: "如果第二轮你更直接一点，今晚可能会更像一次小型表白。",
      literary_closing: "有些靠近不是拥抱，是两个人都故意把脚步放慢。",
      badge_label: "靠近了一点"
    },
    {
      id: "ending-crush-party-pause",
      type: "ambiguous",
      label: "停在夜色里",
      hint: "你们都知道气氛变了，但谁都没戳破。",
      impact_line: "那段路不长，却足够让心思都变得很安静。",
      relationship_result: "你们把这次单独相处停在一种刚刚好的留白里，没有把话挑明。",
      key_behavior_feedback: "你一直给回应，却没把答案说死，气氛因此刚好停住。",
      missed_branch_hint: "如果最后一轮多一点主动，结局可能会比现在更明确。",
      literary_closing: "夜风很轻，像有人把一句话放在嘴边，最后还是没说完。",
      badge_label: "停在夜色里"
    },
    {
      id: "ending-crush-party-drift",
      type: "closure",
      label: "还是朋友",
      hint: "你们没把这次机会接成转折。",
      impact_line: "你们一起走了一段路，却还是走回了各自的位置。",
      relationship_result: "今晚的单独时刻没有变成推进关系的节点，最后仍然停在朋友边缘。",
      key_behavior_feedback: "你把气氛收得过于平稳，反而让他不敢再往前一步。",
      missed_branch_hint: "如果你少一点回避，多一点接住，他可能会继续说下去。",
      literary_closing: "灯一盏盏灭下去，夜色把心意也收进了影子里。",
      badge_label: "还是朋友"
    }
  ],
  turns: [
    {
      id: "crush-party-turn-1",
      assistant_message: "要不要一起走一段？",
      emotion_hint: "",
      strategies: [
        {
          id: "crush-party-intent-1",
          label: "自然接住",
          description: "先别让这一刻显得太特别。",
          replies: [
            { id: "crush-party-reply-1a", style_label: "顺其自然", style_description: "像朋友一样接住，但不冷。", content: "好啊，反正我也还不想那么快回去。" },
            { id: "crush-party-reply-1b", style_label: "轻轻配合", style_description: "让他知道你愿意把这段路留给他。", content: "可以啊，刚好我也想吹会儿风。" }
          ]
        },
        {
          id: "crush-party-intent-2",
          label: "带一点暧昧",
          description: "让他感受到这不是普通顺路。",
          replies: [
            { id: "crush-party-reply-1c", style_label: "轻轻点破", style_description: "让他知道你看见了他的刻意。", content: "你这句像是特地等我散场才说的。" },
            { id: "crush-party-reply-1d", style_label: "暧昧一点", style_description: "把气氛慢慢推近。", content: "可以，不过你这样单独约我走一段，还挺容易让人多想的。" }
          ]
        },
        {
          id: "crush-party-intent-3",
          label: "先试试他",
          description: "看看他到底只是客气，还是另有想法。",
          replies: [
            { id: "crush-party-reply-1e", style_label: "轻问一句", style_description: "温和确认他的来意。", content: "要一起走一段，还是你其实有话想单独跟我说？" },
            { id: "crush-party-reply-1f", style_label: "不让他糊弄", style_description: "让他没法用顺路带过去。", content: "你平时可不会特地慢下来等人，所以今晚是想聊什么？" }
          ]
        }
      ]
    },
    {
      id: "crush-party-turn-2",
      assistant_message: "也没什么，就是觉得刚才人太多了，有些话在那种场合说不太出来。",
      emotion_hint: "他在给你单独的分量",
      strategies: [
        {
          id: "crush-party-intent-4",
          label: "顺着靠近",
          description: "让他把这份认真继续说下去。",
          replies: [
            { id: "crush-party-reply-2a", style_label: "轻轻接住", style_description: "给他一个继续往下说的空间。", content: "那现在人少了，你可以慢慢说。" },
            { id: "crush-party-reply-2b", style_label: "温柔一点", style_description: "把这一刻接成只有你们知道的默契。", content: "嗯，那现在刚刚好，没人打扰。" }
          ]
        },
        {
          id: "crush-party-intent-5",
          label: "别让他太紧张",
          description: "给他一点安全感，不催着他表态。",
          replies: [
            { id: "crush-party-reply-2c", style_label: "放松他", style_description: "让他不用立刻把话说重。", content: "也不用急，你先想到哪儿就说到哪儿。" },
            { id: "crush-party-reply-2d", style_label: "稳住气氛", style_description: "把场面撑在舒服的地方。", content: "没关系，我在听，不用一下子想得太完整。" }
          ]
        },
        {
          id: "crush-party-intent-6",
          label: "轻轻反问",
          description: "看他是不是愿意更明确一点。",
          replies: [
            { id: "crush-party-reply-2e", style_label: "往前问一点", style_description: "不逼，但让他再多走一步。", content: "那种话……是只有我适合听，还是你谁都没说过？" },
            { id: "crush-party-reply-2f", style_label: "把重点拉出来", style_description: "让他面对这份单独的意味。", content: "你这么说，倒显得今晚这段路有点特别了。" }
          ]
        }
      ]
    },
    {
      id: "crush-party-turn-3",
      assistant_message: "特别一点也没什么不好，我只是觉得……有些话更想在你面前说。",
      emotion_hint: "他已经在往前迈了",
      ending_id: "ending-crush-party-close",
      ending_prompt: "这段散场后的气氛已经慢慢靠近了，要把它停在这里吗？",
      strategies: [
        {
          id: "crush-party-intent-7",
          label: "接住这份特别",
          description: "让他知道你看见了这份偏心。",
          replies: [
            { id: "crush-party-reply-3a", style_label: "柔软回应", style_description: "接住他的偏心，不把气氛吓跑。", content: "那我会认真记住你今晚这句“更想在我面前说”。" },
            { id: "crush-party-reply-3b", style_label: "靠近一点", style_description: "把这段特别轻轻落下来。", content: "那听起来，我今晚好像确实被你放在了一个不太一样的位置。" }
          ]
        },
        {
          id: "crush-party-intent-8",
          label: "留一点余地",
          description: "别让今晚的气氛太快落地。",
          replies: [
            { id: "crush-party-reply-3c", style_label: "轻轻停住", style_description: "让这份特别先停在空气里。", content: "那就先把这句话留在今晚吧，感觉已经够特别了。" },
            { id: "crush-party-reply-3d", style_label: "不说太满", style_description: "接住心意，但不把答案说完。", content: "嗯，我大概听懂了一点，不过好像还想再多留一点悬念。" }
          ]
        },
        {
          id: "crush-party-intent-9",
          label: "再推一步",
          description: "看看他愿不愿意更明确。",
          replies: [
            { id: "crush-party-reply-3e", style_label: "温柔追问", style_description: "再给他一次把话说透的机会。", content: "那你更想说给我听的，到底是哪一句？" },
            { id: "crush-party-reply-3f", style_label: "把话逼近", style_description: "轻轻把模糊的心思推近一点。", content: "你都已经说到这里了，再藏着，好像有点可惜。" }
          ]
        }
      ]
    }
  ]
};
