module.exports = {
  id: "ex-midnight",
  title: "深夜的那一句话",
  category: "前任",
  cover: {
    opening_message: "睡了吗？",
    subtitle: "他很久没联系你了，偏偏挑在今晚开口。",
    tags: ["前任", "分手3个月", "试探型"]
  },
  character: {
    name: "祁川",
    gender: "男",
    age: 27,
    occupation: "品牌策划",
    relationship: "前任",
    archetype: "克制试探型",
    personality: "表面随和但内心敏感，习惯用轻描淡写掩饰在意，不愿先示弱。",
    speaking_style: "句子短，喜欢先探你的态度，再决定说多少。",
    attitude_to_relationship: "嘴上说已经翻篇，心里其实还在确认你有没有走远。",
    initial_mood: "故作平静，带一点迟到的犹豫。",
    initial_favorability: 45,
    current_attitude: "还在观察你是不是已经走出来。"
  },
  background: "你们分开已经三个月，彼此没有彻底拉黑，也没有真正说清楚。直到今晚，他突然发来一句很轻的问候，像迟到很久的一次试探。",
  scene_prompt: "这一局重点不是立刻复合，而是看你能不能在克制和情绪之间找到更稳的分寸。",
  ending_triggers: {
    description: "以下任意条件满足时，对话可进入结局阶段。",
    conditions: ["双方明确表态", "情绪已经出现结果", "自然走向告别", "轮数达到上限"]
  },
  possible_endings: [
    {
      id: "ending-ex-soft-return",
      type: "warmth",
      label: "重新在意",
      hint: "你让他重新把目光停回你身上。",
      impact_line: "你没有回头，但他重新把目光停在了你身上。",
      relationship_result: "你稳住了情绪，也重新唤起了他对你的在意。",
      key_behavior_feedback: "你没有急着靠近，反而让他愿意把话再多留一会儿。",
      missed_branch_hint: "如果第二轮你更主动一点，可能会触发更直接的旧情回流。",
      literary_closing: "你把分寸留在字句之间，于是旧情绪也悄悄亮了一下。",
      badge_label: "重新在意"
    },
    {
      id: "ending-ex-boundary",
      type: "closure",
      label: "礼貌收束",
      hint: "你没有失态，也没有再把门打开。",
      impact_line: "你没有给他错觉，也没有让自己失守。",
      relationship_result: "你把这段关系停在了体面的位置，没有再往回退。",
      key_behavior_feedback: "你始终没有顺着他的试探一路走到底，边界感很稳。",
      missed_branch_hint: "如果最后一轮再多留一点温度，今晚的走向可能会更暧昧。",
      literary_closing: "有些晚安不是重新开始，只是终于把一句话说完。",
      badge_label: "礼貌收束"
    },
    {
      id: "ending-ex-ambiguous",
      type: "ambiguous",
      label: "停在边界",
      hint: "你们都没有再往前一步。",
      impact_line: "今晚有一点回暖，但谁都没有把门真正推开。",
      relationship_result: "这段对话停在一种微妙的边界里，留白比答案更多。",
      key_behavior_feedback: "你把回应收得很轻，让气氛保住了温度，也保住了距离。",
      missed_branch_hint: "如果第三轮你更直白一点，可能会迎来完全不同的答复。",
      literary_closing: "像有人在门外停了一会儿，最后还是把脚步放轻了。",
      badge_label: "停在边界"
    }
  ],
  turns: [
    {
      id: "ex-midnight-turn-1",
      assistant_message: "睡了吗？",
      emotion_hint: "",
      strategies: [
        {
          id: "ex-midnight-intent-1",
          label: "先稳住",
          description: "别显得你一直在等他的消息。",
          replies: [
            { id: "ex-midnight-reply-1a", style_label: "平静自然", style_description: "平静自然，留有余地。", content: "还没，正准备睡。怎么突然想到找我？" },
            { id: "ex-midnight-reply-1b", style_label: "轻轻带过", style_description: "不主动靠近，但也不冷下去。", content: "还醒着，不过已经挺晚了。你怎么这个时候来找我？" }
          ]
        },
        {
          id: "ex-midnight-intent-2",
          label: "轻轻试探",
          description: "把问题递回去，看他到底想说什么。",
          replies: [
            { id: "ex-midnight-reply-1c", style_label: "反问回来", style_description: "把主动权轻轻收回来。", content: "还没睡。你这么晚出现，我有点好奇你是突然想起我，还是有话没说完。" },
            { id: "ex-midnight-reply-1d", style_label: "带一点试探", style_description: "让他自己决定要不要继续说下去。", content: "在呢。所以你这句“睡了吗”，后面是打算接什么？" }
          ]
        },
        {
          id: "ex-midnight-intent-3",
          label: "给点温度",
          description: "承接住他，但别一下子把门推太开。",
          replies: [
            { id: "ex-midnight-reply-1e", style_label: "温和接住", style_description: "给一点温度，但不显得急。", content: "还没，看到是你，倒是一下子清醒了点。" },
            { id: "ex-midnight-reply-1f", style_label: "留一点柔软", style_description: "让他知道你并不排斥继续聊。", content: "还醒着。你这么晚找我，我还是会下意识看一眼。" }
          ]
        }
      ]
    },
    {
      id: "ex-midnight-turn-2",
      assistant_message: "没什么，就是突然想起你。最近怎么样？",
      emotion_hint: "他在试探你",
      strategies: [
        {
          id: "ex-midnight-intent-4",
          label: "显得安稳",
          description: "让他知道你已经过得不错。",
          replies: [
            { id: "ex-midnight-reply-2a", style_label: "状态稳定", style_description: "让他看到你已经往前走了。", content: "还不错，最近忙一些新的事，整个人安静了不少。" },
            { id: "ex-midnight-reply-2b", style_label: "平稳落地", style_description: "不刻意逞强，但能站稳自己。", content: "挺好的，节奏慢慢稳下来了，很多事也没以前那么拧着了。" }
          ]
        },
        {
          id: "ex-midnight-intent-5",
          label: "留一点白",
          description: "不把近况和情绪一下子全摊开。",
          replies: [
            { id: "ex-midnight-reply-2c", style_label: "不说太满", style_description: "给他空间，也给自己退路。", content: "就那样，日子慢慢过。你忽然这么问，倒有点让我意外。" },
            { id: "ex-midnight-reply-2d", style_label: "轻轻留白", style_description: "把真正的情绪藏一点在后面。", content: "还行，有些事想开了，有些事就先放着。" }
          ]
        },
        {
          id: "ex-midnight-intent-6",
          label: "把话递回去",
          description: "温和追问他的来意。",
          replies: [
            { id: "ex-midnight-reply-2e", style_label: "收回主动权", style_description: "让对话重心回到他身上。", content: "我最近还好。你呢，怎么会突然在今天想起我？" },
            { id: "ex-midnight-reply-2f", style_label: "慢慢追问", style_description: "不逼问，但让他没法糊弄过去。", content: "我还行，不过我更想知道，你今晚为什么会来找我。" }
          ]
        }
      ]
    },
    {
      id: "ex-midnight-turn-3",
      assistant_message: "听起来你过得挺好的。那我就放心了。",
      emotion_hint: "他有点动摇",
      ending_id: "ending-ex-soft-return",
      ending_prompt: "他今晚的态度已经有些松动，要把这段对话停在这里吗？",
      strategies: [
        {
          id: "ex-midnight-intent-7",
          label: "留住余温",
          description: "让这点温度再停留一会儿。",
          replies: [
            { id: "ex-midnight-reply-3a", style_label: "温柔一点", style_description: "给一点余温，不急着追问。", content: "放心就好。偶尔想起从前，也没那么难受了。" },
            { id: "ex-midnight-reply-3b", style_label: "给他一个门缝", style_description: "不明说，但也没把门彻底关上。", content: "嗯，慢慢会好的。有些话以后有机会再说吧。" }
          ]
        },
        {
          id: "ex-midnight-intent-8",
          label: "稳稳收尾",
          description: "把关系停在舒服的位置。",
          replies: [
            { id: "ex-midnight-reply-3c", style_label: "平静收束", style_description: "边界清楚，但不带刺。", content: "嗯，大家都该慢慢过好自己的生活。" },
            { id: "ex-midnight-reply-3d", style_label: "体面结束", style_description: "不再往回拉，但也不让气氛难看。", content: "这样也挺好，至少我们都能各自往前走了。" }
          ]
        },
        {
          id: "ex-midnight-intent-9",
          label: "再探一步",
          description: "看看他会不会继续往前走。",
          replies: [
            { id: "ex-midnight-reply-3e", style_label: "轻轻追问", style_description: "不逼，但让真心更靠近一点。", content: "只是放心吗？我还以为你今晚想说的不止这些。" },
            { id: "ex-midnight-reply-3f", style_label: "再往前一点", style_description: "把他的迟疑推到更清楚的位置。", content: "你特地来找我，如果只是为了放心，好像也不太像你。" }
          ]
        }
      ]
    }
  ]
};
