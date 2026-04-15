module.exports = {
  id: "social-loan",
  title: "朋友借钱不还，你要不要开口",
  category: "社交",
  cover: {
    opening_message: "那个钱，我这周可能还得缓一下。",
    subtitle: "他先开口示弱，但你心里已经憋了很久。",
    tags: ["社交", "借钱", "边界感"]
  },
  character: {
    name: "陈泽",
    gender: "男",
    age: 28,
    occupation: "自由职业",
    relationship: "朋友",
    archetype: "会回避的熟人型",
    personality: "不好意思正面处理压力，一旦尴尬就会拖延或转移话题。",
    speaking_style: "语气软，喜欢先示弱，让场面别太难看。",
    attitude_to_relationship: "不想因为钱把关系闹僵，但也不愿意太快面对自己的失约。",
    initial_mood: "心虚，想先用缓和语气把这件事拖过去。",
    initial_favorability: 42,
    current_attitude: "想保住关系，也想回避真正的压力。"
  },
  background: "朋友之前向你借了一笔钱，说很快就还。时间已经拖了很久，你一直没好意思开口。今晚他主动发来消息，却还是在说“再缓一下”。",
  scene_prompt: "这个场景不是教你吵架，而是练习怎么在关系和底线之间把话说清楚。",
  ending_triggers: {
    description: "以下任意条件满足时，对话可进入结局阶段。",
    conditions: ["还款节奏说清楚", "边界表达明确", "情绪已经有结果", "轮数达到上限"]
  },
  possible_endings: [
    {
      id: "ending-social-loan-clear",
      type: "closure",
      label: "把话说清了",
      hint: "你没有撕破脸，但终于把底线摆到了桌面上。",
      impact_line: "你没有发火，却让这件事第一次变得清楚起来。",
      relationship_result: "你把一直不敢开口的那句话说了出来，关系和边界终于都落到了明处。",
      key_behavior_feedback: "你没有绕开重点，而是把期限和感受都说得足够清楚。",
      missed_branch_hint: "如果第二轮你继续顾全气氛，这件事可能还会被拖过去。",
      literary_closing: "有些关系不是靠忍着维持，而是靠把难说的话说出来。",
      badge_label: "把话说清了"
    },
    {
      id: "ending-social-loan-soft",
      type: "ambiguous",
      label: "关系先保住",
      hint: "你没把气氛弄僵，但底线也还没完全落地。",
      impact_line: "你把锋利收住了，可那根刺还留在心里。",
      relationship_result: "你选择先把关系放在前面，这次对话没有彻底解决问题。",
      key_behavior_feedback: "你顾及了他的处境，却没把自己的不舒服完全说出来。",
      missed_branch_hint: "如果最后一轮你再明确一点，这件事可能会真正往前推进。",
      literary_closing: "有些体面来得太轻，会让委屈继续留在原地。",
      badge_label: "关系先保住"
    },
    {
      id: "ending-social-loan-tense",
      type: "rupture",
      label: "关系发紧",
      hint: "你把忍耐一下子翻出来了，气氛也跟着绷住了。",
      impact_line: "那句忍了很久的话终于说出口，空气一下子全变了。",
      relationship_result: "你终于不再替这段关系消化委屈，但对方也明显开始后退。",
      key_behavior_feedback: "你把积压太久的情绪一次性倒出来，让事情一下从拖延变成对峙。",
      missed_branch_hint: "如果第一轮先锁时间，再谈情绪，冲突可能会小一些。",
      literary_closing: "不是所有沉默都会换来理解，有些只会把火留得更久。",
      badge_label: "关系发紧"
    }
  ],
  turns: [
    {
      id: "social-loan-turn-1",
      assistant_message: "那个钱，我这周可能还得缓一下。",
      emotion_hint: "",
      strategies: [
        {
          id: "social-loan-intent-1",
          label: "先不翻脸",
          description: "稳住情绪，先让事情说清楚。",
          replies: [
            { id: "social-loan-reply-1a", style_label: "平静确认", style_description: "先接住，再把重点带回来。", content: "我知道你现在可能也有压力，但这件事我还是想跟你确认一个具体时间。" },
            { id: "social-loan-reply-1b", style_label: "稳住气氛", style_description: "不发火，但不再让它糊过去。", content: "可以理解，不过这笔钱已经拖了挺久了，我还是想知道你打算怎么安排。" }
          ]
        },
        {
          id: "social-loan-intent-2",
          label: "把底线说出",
          description: "让他知道你已经不舒服了。",
          replies: [
            { id: "social-loan-reply-1c", style_label: "直接一点", style_description: "不再只顾全气氛。", content: "我得跟你说实话，这件事一直拖着，我这边已经有点难受了。" },
            { id: "social-loan-reply-1d", style_label: "坦白感受", style_description: "先说感受，再谈解决。", content: "我其实一直都不太好意思催，但拖到现在，我心里已经开始别扭了。" }
          ]
        },
        {
          id: "social-loan-intent-3",
          label: "先锁时间",
          description: "不先谈情绪，先把还款节奏说清楚。",
          replies: [
            { id: "social-loan-reply-1e", style_label: "锁具体点", style_description: "把模糊的“缓一下”变成时间。", content: "缓一下可以，但我需要一个明确一点的时间，不想一直悬着。" },
            { id: "social-loan-reply-1f", style_label: "把话落地", style_description: "先把模糊拖延收住。", content: "那你给我一个具体日期吧，这样我也好心里有数。" }
          ]
        }
      ]
    },
    {
      id: "social-loan-turn-2",
      assistant_message: "我知道，主要最近手头真的有点紧。我不是不想还，就是还没缓过来。",
      emotion_hint: "他在示弱，也在回避",
      strategies: [
        {
          id: "social-loan-intent-4",
          label: "理解但不松",
          description: "承认他的难处，但不让问题继续漂着。",
          replies: [
            { id: "social-loan-reply-2a", style_label: "理解并落地", style_description: "既给理解，也要结果。", content: "我能理解你现在的情况，所以我更希望我们把时间说清楚，别一直拖着。" },
            { id: "social-loan-reply-2b", style_label: "温和坚持", style_description: "不把气氛弄僵，但不退回模糊里。", content: "我不是要逼你，可这件事总得有个明确安排，不然我这边也一直悬着。" }
          ]
        },
        {
          id: "social-loan-intent-5",
          label: "讲清影响",
          description: "让他知道这件事对你也有实际影响。",
          replies: [
            { id: "social-loan-reply-2c", style_label: "说出现实", style_description: "把你的压力也摆出来。", content: "我明白你不容易，但这笔钱对我来说也不是完全没有影响，所以我需要更确定一点。" },
            { id: "social-loan-reply-2d", style_label: "别再自己消化", style_description: "不再只替关系兜着情绪。", content: "我一直没催，是怕关系变尴尬。但一直这样拖，对我其实也不太公平。" }
          ]
        },
        {
          id: "social-loan-intent-6",
          label: "给出方案",
          description: "如果一次还不上，就谈具体分期。",
          replies: [
            { id: "social-loan-reply-2e", style_label: "把事变小", style_description: "降低对方压力，也让事情往前动。", content: "如果这周一次还不上，我们可以先定一个分几次还的安排。" },
            { id: "social-loan-reply-2f", style_label: "给台阶但要落地", style_description: "不是放过，而是换一个能执行的办法。", content: "你如果现在压力大，那我们别只说“再缓一下”，直接定个你能做到的方式。" }
          ]
        }
      ]
    },
    {
      id: "social-loan-turn-3",
      assistant_message: "那这样吧，我下周先转你一部分，剩下的月底前补齐。你看这样行吗？",
      emotion_hint: "他终于开始正面给方案",
      ending_id: "ending-social-loan-clear",
      ending_prompt: "这件事终于开始往明确的方向走了，要在这里收住吗？",
      strategies: [
        {
          id: "social-loan-intent-7",
          label: "明确确认",
          description: "把这次约定落到具体上。",
          replies: [
            { id: "social-loan-reply-3a", style_label: "把话钉住", style_description: "确认时间，不再模糊。", content: "可以，那我们就按这个来：下周先一部分，月底前补齐，别再往后拖了。" },
            { id: "social-loan-reply-3b", style_label: "平静确认", style_description: "既不追着不放，也不让约定飘掉。", content: "行，那就这么定。我不是想为难你，只是希望这次能按说好的来。" }
          ]
        },
        {
          id: "social-loan-intent-8",
          label: "留一点体面",
          description: "让关系别太紧，但底线还在。",
          replies: [
            { id: "social-loan-reply-3c", style_label: "关系先稳", style_description: "把场面放松一点，但不撤回要求。", content: "可以，至少现在终于有个明确说法了。我就按这个时间等你。" },
            { id: "social-loan-reply-3d", style_label: "不再追着压", style_description: "让关系有口气，但事情仍然落地。", content: "好，那就按这个安排吧。后面只要别再失约，我这边就能安心。" }
          ]
        },
        {
          id: "social-loan-intent-9",
          label: "顺手补一句",
          description: "把你的感受也轻轻说清楚。",
          replies: [
            { id: "social-loan-reply-3e", style_label: "把心里话补上", style_description: "让关系以后不再靠忍着维持。", content: "可以，我接受这个安排。不过以后这种事你还是早点跟我说清楚，我会轻松很多。" },
            { id: "social-loan-reply-3f", style_label: "柔着立边界", style_description: "既收束事情，也不再让自己委屈。", content: "那就这么定吧。其实我最在意的不是多等几天，是一直没个明确说法。" }
          ]
        }
      ]
    }
  ]
};
