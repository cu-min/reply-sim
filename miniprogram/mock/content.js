const scriptDetails = [
  {
    id: "ex-midnight",
    title: "深夜的那一句话",
    category: "前任",
    openingLine: "睡了吗？",
    meta: "前任｜分手3个月｜试探型",
    blurb: "他很久没联系你了，偏偏挑在今晚开口。",
    tags: ["旧情回流", "边界感"],
    unlockedEndingIds: [],
    background:
      "你们分开已经三个月，彼此没有彻底拉黑，也没有真正说清楚。今晚这句突如其来的问候，不像寒暄，更像一次迟到的试探。",
    scenePrompt: "你可以稳住局面，也可以把情绪留白，不必急着给这段关系下结论。",
    availableEndingLabels: ["重新在意", "礼貌收束", "停在边界"],
    character: {
      name: "祁川",
      age: "27",
      gender: "男",
      relationship: "前任",
      archetype: "克制试探型",
      occupation: "品牌策划",
      personalityTags: ["克制", "慢热", "不愿示弱"],
      speakingStyle: "句子短，喜欢先探你的态度，再决定说多少。",
      currentAttitude: "还在观察你是否已经走出来。"
    }
  },
  {
    id: "crush-direct",
    title: "没说出口的那句",
    category: "恋爱",
    openingLine: "你是不是有话想跟我说？",
    meta: "暗恋｜认识半年｜主动型",
    blurb: "他忽然比平时更直接，像给了你一个窗口。",
    tags: ["暧昧试探", "轻轻推进"],
    unlockedEndingIds: [],
    background:
      "你们认识了半年，平时聊天不算少，但从没把话题真正推到更靠近的位置。今晚他突然这样问，像是在给你递一盏灯。",
    scenePrompt: "首版先体验轻推进的暧昧张力，重点不是表白，而是试试你会不会把气氛聊活。",
    availableEndingLabels: ["气氛升温", "留白继续", "话题飘散"],
    character: {
      name: "林屿",
      age: "25",
      gender: "男",
      relationship: "暧昧对象",
      archetype: "主动观察型",
      occupation: "插画师",
      personalityTags: ["敏感", "有趣", "善于捕捉情绪"],
      speakingStyle: "话里有留白，喜欢用轻松口吻确认你的心意。",
      currentAttitude: "对你有兴趣，但还没有完全摊牌。"
    }
  },
  {
    id: "work-tonight",
    title: "今晚改出来",
    category: "职场",
    openingLine: "这个方案今晚改出来。",
    meta: "领导｜临时加需求｜强势型",
    blurb: "他把压力直接压过来，等着看你怎么接。",
    tags: ["职场回合", "边界表达"],
    unlockedEndingIds: ["ending-work-balance"],
    background:
      "项目快到节点，领导在临下班前又追加了改动。你想守住边界，但也不想把关系聊僵。",
    scenePrompt: "这一局重点不在硬碰硬，而在如何在尊重与边界之间找到更稳的表达。",
    availableEndingLabels: ["稳住边界", "被动接单", "重新协商"],
    character: {
      name: "周总",
      age: "34",
      gender: "男",
      relationship: "直属领导",
      archetype: "结果优先型",
      occupation: "项目负责人",
      personalityTags: ["强势", "务实", "重结果"],
      speakingStyle: "直接、压缩字数、几乎不给情绪缓冲。",
      currentAttitude: "默认你会配合，但也在观察你的职业成熟度。"
    }
  }
];

const endings = [
  {
    id: "ending-ex-soft-return",
    scriptId: "ex-midnight",
    title: "重新在意",
    impactLine: "你没有回头，但他重新把目光停在了你身上。",
    relationSummary: "你稳住了情绪，也重新唤起了他对你的在意。",
    keyFeedback: "你没有急着靠近，反而让他愿意把话再多留一会儿。",
    missedBranchHint: "如果第二轮你更主动一点，可能会触发更直接的旧情回流。",
    closingLine: "你把分寸留在字句之间，于是旧情绪也悄悄亮了一下。",
    badgeLabel: "重新在意"
  },
  {
    id: "ending-crush-warmth",
    scriptId: "crush-direct",
    title: "气氛升温",
    impactLine: "他开始认真接你的话，暧昧终于有了温度。",
    relationSummary: "你把暧昧聊出了温度，对方开始认真留意你的回应。",
    keyFeedback: "你没有把话说满，却刚好给了他继续靠近的空间。",
    missedBranchHint: "如果最后一轮再大胆一点，可能会出现更明确的心意确认。",
    closingLine: "有些靠近不是突然发生的，是一句一句被你轻轻推近的。",
    badgeLabel: "气氛升温"
  },
  {
    id: "ending-work-balance",
    scriptId: "work-tonight",
    title: "稳住边界",
    impactLine: "你没有硬碰硬，却把分寸稳稳留在了自己的位置上。",
    relationSummary: "你没有硬碰硬，但也把自己的工作边界表达清楚了。",
    keyFeedback: "你先接住了事情，再提出节奏建议，让对话留在专业里。",
    missedBranchHint: "如果第一轮更直接拒绝，关系可能会更紧绷，也可能更快完成协商。",
    closingLine: "你没有把锋芒抬高，只是把分寸放对了位置。",
    badgeLabel: "稳住边界"
  }
];

const scenarios = {
  "ex-midnight": [
    {
      id: "ex-turn-1",
      assistantMessage: { id: "ex-a-1", role: "assistant", text: "睡了吗？" },
      intentOptions: [
        { id: "ex-i-1", label: "先稳住", description: "别显得你一直在等他的消息" },
        { id: "ex-i-2", label: "轻轻试探", description: "把话题轻轻推回去，看他到底想聊什么" },
        { id: "ex-i-3", label: "主动拉近", description: "给他一点继续聊下去的信号" }
      ],
      replyOptionsByIntent: {
        "ex-i-1": [
          { id: "ex-r-1a", label: "平静自然", text: "还没，正准备睡。怎么突然想到找我？", tone: "平静自然，留有余地" },
          { id: "ex-r-1b", label: "稳一点", text: "还醒着，不过已经有点晚了。你怎么这时候来找我？", tone: "语气稳定，不显得期待" }
        ],
        "ex-i-2": [
          { id: "ex-r-1c", label: "轻轻反问", text: "还没睡。你这么晚出现，我有点好奇你想说什么。", tone: "轻轻反问，把球推回去" },
          { id: "ex-r-1d", label: "试探一下", text: "还在呢，所以你是突然想起我，还是有话没说完？", tone: "带一点试探，不算太近" }
        ],
        "ex-i-3": [
          { id: "ex-r-1e", label: "给点温度", text: "还没睡，看到是你，倒是一下子清醒了。", tone: "给一点温度，但不太满" },
          { id: "ex-r-1f", label: "主动接住", text: "还醒着。你这么晚来找我，我还挺想听听你要说什么。", tone: "主动接住，让气氛靠近一点" }
        ]
      }
    },
    {
      id: "ex-turn-2",
      assistantMessage: { id: "ex-a-2", role: "assistant", text: "没什么，就是突然想起你。最近怎么样？", emotionHint: "他在试探你" },
      intentOptions: [
        { id: "ex-i-4", label: "显得充实", description: "让他感觉你现在过得挺稳" },
        { id: "ex-i-5", label: "留一点白", description: "不要把情绪一下子摊开" },
        { id: "ex-i-6", label: "把问题还给他", description: "把主动权轻轻拿回来一点" }
      ],
      replyOptionsByIntent: {
        "ex-i-4": [
          { id: "ex-r-2a", label: "温和克制", text: "还不错，最近忙一些新的事，整个人安静了不少。", tone: "温和克制，不急着解释" },
          { id: "ex-r-2b", label: "状态稳定", text: "挺好的，节奏比之前稳多了，也慢慢习惯现在的生活了。", tone: "显得稳定，让他看到你在往前走" }
        ],
        "ex-i-5": [
          { id: "ex-r-2c", label: "轻轻带过", text: "就那样，日子慢慢过。你忽然这么问，倒有点意外。", tone: "带过近况，把情绪留白" },
          { id: "ex-r-2d", label: "不说太满", text: "还行，有些事想开了，有些事也就先放着。", tone: "不说太满，让他自己去想" }
        ],
        "ex-i-6": [
          { id: "ex-r-2e", label: "反问回来", text: "我最近还好。你呢，怎么会突然在今天想到我？", tone: "把问题送回去，试探他的来意" },
          { id: "ex-r-2f", label: "收回主动权", text: "还不错，不过我更想知道，你今晚为什么会来找我。", tone: "温和追问，把节奏拿回来" }
        ]
      }
    },
    {
      id: "ex-turn-3",
      assistantMessage: { id: "ex-a-3", role: "assistant", text: "听起来你过得挺好的。那我就放心了。", emotionHint: "他有点动摇" },
      intentOptions: [
        { id: "ex-i-7", label: "留住余温", description: "不要太快把这点温度掐断" },
        { id: "ex-i-8", label: "稳稳收尾", description: "把关系停在舒服的位置" },
        { id: "ex-i-9", label: "再试探一下", description: "看看他会不会继续往前走" }
      ],
      replyOptionsByIntent: {
        "ex-i-7": [
          { id: "ex-r-3a", label: "温柔一点", text: "放心就好。偶尔想起从前，也没那么难受了。", tone: "温柔松动，给一点余温" },
          { id: "ex-r-3b", label: "留一点门", text: "嗯，慢慢会好的。有些话以后有机会再说吧。", tone: "留一点门，但不主动贴近" }
        ],
        "ex-i-8": [
          { id: "ex-r-3c", label: "留白收束", text: "嗯，大家都该慢慢过好自己的生活。", tone: "留白收束，边界清楚" },
          { id: "ex-r-3d", label: "停在这里", text: "这样也挺好，至少我们都能各自往前走了。", tone: "平静收尾，不再往回拉" }
        ],
        "ex-i-9": [
          { id: "ex-r-3e", label: "轻轻追问", text: "只是放心吗？我还以为你今晚想说的不止这些。", tone: "轻轻追问，看看他会不会继续" },
          { id: "ex-r-3f", label: "再探一步", text: "你特地来找我，如果只是为了放心，好像也不太像你。", tone: "再探一步，把真实来意逼近一点" }
        ]
      },
      endingId: "ending-ex-soft-return",
      endingPrompt: "他今晚的态度已经有些松动，要把这段对话停在这里吗？"
    }
  ],
  "crush-direct": [
    {
      id: "crush-turn-1",
      assistantMessage: { id: "crush-a-1", role: "assistant", text: "你是不是有话想跟我说？" },
      intentOptions: [
        { id: "crush-i-1", label: "别太快承认", description: "先探探他是不是认真的" },
        { id: "crush-i-2", label: "顺势接住", description: "把气氛轻轻往前推一点" },
        { id: "crush-i-3", label: "装作轻松", description: "让场面自然一点，不一下子太满" }
      ],
      replyOptionsByIntent: {
        "crush-i-1": [
          { id: "crush-r-1a", label: "半真半假", text: "可能有，但我还在想要不要说。", tone: "半真半假，气氛柔软" },
          { id: "crush-r-1b", label: "先不承认", text: "你这句话问得很突然，我都不知道该不该点头。", tone: "不直接承认，让他再往前一点" }
        ],
        "crush-i-2": [
          { id: "crush-r-1c", label: "顺着往前", text: "如果我说有，你会认真听吗？", tone: "顺势推进，把球轻轻抛给他" },
          { id: "crush-r-1d", label: "给他信号", text: "可能有啊，就看你今晚想不想当个合格的听众。", tone: "给信号，但还是留点玩笑感" }
        ],
        "crush-i-3": [
          { id: "crush-r-1e", label: "轻松玩笑", text: "那得看你想听哪一种了。", tone: "轻松玩笑，留一点悬念" },
          { id: "crush-r-1f", label: "自然一点", text: "怎么，突然这么敏锐，是不是偷看我表情了？", tone: "自然打趣，让场子松一点" }
        ]
      }
    },
    {
      id: "crush-turn-2",
      assistantMessage: { id: "crush-a-2", role: "assistant", text: "听起来像是件不太随便的话，我现在有点好奇了。", emotionHint: "他开始好奇了" },
      intentOptions: [
        { id: "crush-i-4", label: "顺着暧昧", description: "让他继续往这层气氛里走" },
        { id: "crush-i-5", label: "给点安全感", description: "让他知道你不是在吊着他" },
        { id: "crush-i-6", label: "保留分寸", description: "继续有留白，不一次把话说满" }
      ],
      replyOptionsByIntent: {
        "crush-i-4": [
          { id: "crush-r-2a", label: "轻轻推进", text: "那你可以先保持一下这份好奇，我也想看看你会不会追问。", tone: "轻轻推进，带一点互动感" },
          { id: "crush-r-2b", label: "继续升温", text: "你现在这个反应，已经让我有点想把后半句说出来了。", tone: "顺着暧昧，把距离拉近一点" }
        ],
        "crush-i-5": [
          { id: "crush-r-2c", label: "温柔承认", text: "就是有些话，只适合在你认真一点的时候说。", tone: "温柔承认，暧昧升温" },
          { id: "crush-r-2d", label: "让他安心", text: "也不算什么负担人的话，只是我比较想在对的时候告诉你。", tone: "给安全感，不让他有压力" }
        ],
        "crush-i-6": [
          { id: "crush-r-2e", label: "留着一点", text: "先别急，我还想再看看你会不会自己猜到。", tone: "继续留白，让他主动一点" },
          { id: "crush-r-2f", label: "不说太满", text: "也许等你再认真一点，我会更想开口。", tone: "保留分寸，不一下子交底" }
        ]
      }
    },
    {
      id: "crush-turn-3",
      assistantMessage: { id: "crush-a-3", role: "assistant", text: "那我现在算不算已经认真起来了？", emotionHint: "气氛开始升温" },
      intentOptions: [
        { id: "crush-i-7", label: "给他台阶", description: "让气氛顺着走下去" },
        { id: "crush-i-8", label: "留一点空白", description: "别把答案给得太完整" },
        { id: "crush-i-9", label: "保持轻松", description: "不要让场面突然太用力" }
      ],
      replyOptionsByIntent: {
        "crush-i-7": [
          { id: "crush-r-3a", label: "柔和回应", text: "可能吧，至少比平时更像是在认真听我说话了。", tone: "柔和回应，不把话说死" },
          { id: "crush-r-3b", label: "顺着给台阶", text: "算啊，所以我现在开始有点想认真回答你了。", tone: "给他台阶，让气氛继续向前" }
        ],
        "crush-i-8": [
          { id: "crush-r-3c", label: "暧昧一点", text: "如果你再认真一点，我可能就真的会说了。", tone: "暧昧挑逗，往前一步" },
          { id: "crush-r-3d", label: "继续留白", text: "差不多了，不过还差一点点让我心动的证据。", tone: "留一点空白，让他继续靠近" }
        ],
        "crush-i-9": [
          { id: "crush-r-3e", label: "轻松接住", text: "你这样问，已经很像在给我递话筒了。", tone: "轻松接住，不让气氛太重" },
          { id: "crush-r-3f", label: "玩笑里靠近", text: "勉强算吧，至少已经到我愿意继续聊下去的程度了。", tone: "玩笑里靠近，保留轻盈感" }
        ]
      },
      endingId: "ending-crush-warmth",
      endingPrompt: "他已经被你带进这段气氛里了，要把今晚停在这里吗？"
    }
  ],
  "work-tonight": [
    {
      id: "work-turn-1",
      assistantMessage: { id: "work-a-1", role: "assistant", text: "这个方案今晚改出来。" },
      intentOptions: [
        { id: "work-i-1", label: "先接住任务", description: "别让对话一开始就变硬" },
        { id: "work-i-2", label: "确认范围", description: "先把具体需求说清楚" },
        { id: "work-i-3", label: "稳稳设边界", description: "说明节奏，但不直接顶回去" }
      ],
      replyOptionsByIntent: {
        "work-i-1": [
          { id: "work-r-1a", label: "职业接法", text: "可以，我先确认一下优先改哪些部分，避免今晚返工。", tone: "职业接法，先接住再收口" },
          { id: "work-r-1b", label: "先接后问", text: "收到，我这边可以推进，不过得先对齐一下最关键的改动点。", tone: "先接住任务，再把节奏拉回专业" }
        ],
        "work-i-2": [
          { id: "work-r-1c", label: "确认重点", text: "我可以改，但需要您先明确最关键的两处修改。", tone: "直接确认范围，避免模糊执行" },
          { id: "work-r-1d", label: "拆清需求", text: "为了今晚能准时出版本，您先帮我锁一下这次调整的优先顺序。", tone: "把需求拆清楚，减少来回" }
        ],
        "work-i-3": [
          { id: "work-r-1e", label: "边界表达", text: "我能继续推进，但需要先明确最关键的两处改动。", tone: "边界表达，语气稳定" },
          { id: "work-r-1f", label: "稳稳说明", text: "今晚可以做，不过如果要保证质量，我得先按优先级来处理。", tone: "设边界，但不直接对抗" }
        ]
      }
    },
    {
      id: "work-turn-2",
      assistantMessage: { id: "work-a-2", role: "assistant", text: "重点你应该清楚，明早我就要看版本。", emotionHint: "他还在施压" },
      intentOptions: [
        { id: "work-i-4", label: "推进协商", description: "把需求拆成可执行的节奏" },
        { id: "work-i-5", label: "争取缓冲", description: "说明现实时间和质量成本" },
        { id: "work-i-6", label: "保持专业", description: "不接情绪，只回到交付本身" }
      ],
      replyOptionsByIntent: {
        "work-i-4": [
          { id: "work-r-2a", label: "清晰拆解", text: "我理解时效，今晚可以先出核心版，细节优化明早补齐给您确认。", tone: "清晰拆解，给出替代方案" },
          { id: "work-r-2b", label: "节奏协商", text: "那我先把影响最大的部分今晚完成，剩下优化项明早一起并进去。", tone: "推进协商，把任务拆成两段" }
        ],
        "work-i-5": [
          { id: "work-r-2c", label: "稳定协商", text: "如果要保证质量，我建议先锁两项关键修改，今晚就能稳妥交付。", tone: "稳定协商，把主动权拉回专业" },
          { id: "work-r-2d", label: "争取缓冲", text: "我可以今晚继续做，但如果范围不收住，明早版本质量会受影响。", tone: "说明现实约束，争取缓冲空间" }
        ],
        "work-i-6": [
          { id: "work-r-2e", label: "专业回应", text: "明白，我现在就按优先级推进，先确保明早能看到可确认版本。", tone: "不接压迫感，只回交付目标" },
          { id: "work-r-2f", label: "冷静回到事", text: "收到，那我先以结果为目标推进，过程里有变动我会及时同步。", tone: "保持专业，不让情绪扩散" }
        ]
      }
    },
    {
      id: "work-turn-3",
      assistantMessage: { id: "work-a-3", role: "assistant", text: "行，那你先按这个节奏推进，十一点前给我初版。", emotionHint: "他开始接受你的节奏" },
      intentOptions: [
        { id: "work-i-7", label: "确认交付", description: "把边界正式落到执行里" },
        { id: "work-i-8", label: "保持尊重", description: "语气稳住，不再额外顶回去" },
        { id: "work-i-9", label: "留一手缓冲", description: "避免后面再被临时加码" }
      ],
      replyOptionsByIntent: {
        "work-i-7": [
          { id: "work-r-3a", label: "清楚收尾", text: "收到，我先出初版，涉及新增方向的部分我会在备注里单独标清。", tone: "清楚收尾，边界明确" },
          { id: "work-r-3b", label: "交付确认", text: "明白，我按这个范围推进，十一点前把初版和修改说明一起发您。", tone: "把边界落到可执行交付里" }
        ],
        "work-i-8": [
          { id: "work-r-3c", label: "专业留痕", text: "没问题，我按这个范围推进，十一点前把版本和修改点一起发您。", tone: "专业留痕，后续好协同" },
          { id: "work-r-3d", label: "稳住语气", text: "好的，我先推进，稍后把当前进度和十一点前可交付内容同步给您。", tone: "保持尊重，沟通稳定" }
        ],
        "work-i-9": [
          { id: "work-r-3e", label: "先锁范围", text: "收到，我先按现在确认的内容推进，新的调整我会放到下一轮统一处理。", tone: "预防临时加码，范围说清楚" },
          { id: "work-r-3f", label: "留出缓冲", text: "可以，我先完成这版初稿，后续新增项我们再单独排优先级。", tone: "提前留缓冲，避免继续被压" }
        ]
      },
      endingId: "ending-work-balance",
      endingPrompt: "这轮协商已经稳住了，要把这一局收在这里吗？"
    }
  ]
};

const profileSeed = {
  id: "guest-user",
  nickname: "还没想好怎么说",
  signature: "有些话，先在这里试着说。",
  heartBalance: 88,
  favoriteScriptIds: ["ex-midnight", "crush-direct"],
  seedHistory: [
    {
      id: "seed-history-work",
      sessionId: "seed-work-session",
      scriptId: "work-tonight",
      scriptTitle: "今晚改出来",
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
  scriptDetails,
  endings,
  scenarios,
  profileSeed
};
