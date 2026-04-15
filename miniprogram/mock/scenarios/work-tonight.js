module.exports = {
  id: "work-tonight",
  title: "“这个方案今晚改出来。”",
  category: "职场",
  cover: {
    opening_message: "这个方案今晚改出来。",
    subtitle: "他把压力直接压过来，等着看你怎么接。",
    tags: ["职场", "临时加需求", "强势型"]
  },
  character: {
    name: "周岑",
    gender: "男",
    age: 34,
    occupation: "项目负责人",
    relationship: "直属领导",
    archetype: "结果优先型",
    personality: "强势、务实、看重结果，默认别人会配合他的节奏。",
    speaking_style: "直接、压缩字数、几乎不留情绪缓冲。",
    attitude_to_relationship: "默认你会配合，但也在观察你的职业成熟度。",
    initial_mood: "着急推进项目，对你的负荷感知不高。",
    initial_favorability: 38,
    current_attitude: "默认你会配合，但还没意识到你也有边界。"
  },
  background: "项目临近节点，领导在下班前突然追加了修改需求。你不想把关系聊僵，也不想默认所有临时压力都要你接住。",
  scene_prompt: "重点不是硬碰硬，而是在尊重与边界之间找到更稳的表达方式。",
  ending_triggers: {
    description: "以下任意条件满足时，对话可进入结局阶段。",
    conditions: ["交付节奏达成共识", "边界表达清楚", "气氛已经出现结果", "轮数达到上限"]
  },
  possible_endings: [
    {
      id: "ending-work-balance",
      type: "closure",
      label: "稳住边界",
      hint: "你没有硬碰硬，却把分寸留住了。",
      impact_line: "你没有硬碰硬，却把分寸稳稳留在了自己的位置上。",
      relationship_result: "你没有硬碰硬，但也把自己的工作边界表达清楚了。",
      key_behavior_feedback: "你先接住了事情，再提出节奏建议，让对话留在专业里。",
      missed_branch_hint: "如果第一轮更直接拒绝，关系可能会更紧绷，也可能更快完成协商。",
      literary_closing: "你没有把锋芒抬高，只是把分寸放对了位置。",
      badge_label: "稳住边界"
    },
    {
      id: "ending-work-overtime",
      type: "rupture",
      label: "被动接单",
      hint: "你保住了表面平静，但牺牲了自己的节奏。",
      impact_line: "你把任务接住了，也把自己的疲惫一起吞了下去。",
      relationship_result: "这轮对话没有起冲突，但你最终还是默认接受了不合理节奏。",
      key_behavior_feedback: "你一直在顺着需求走，没有把真正的风险和边界说出来。",
      missed_branch_hint: "如果第二轮更明确地拆解范围，结果可能不会只剩下被动接受。",
      literary_closing: "有些沉默看起来像专业，其实只是把疲惫藏得更深。",
      badge_label: "被动接单"
    },
    {
      id: "ending-work-negotiate",
      type: "warmth",
      label: "重新协商",
      hint: "他开始接受你的节奏，而不是只盯着结果。",
      impact_line: "你没有顶回去，却让对方第一次认真听你的节奏。",
      relationship_result: "你把这场压力对话慢慢谈成了更成熟的协作协商。",
      key_behavior_feedback: "你没有陷进情绪里，而是把范围和质量风险说得足够清楚。",
      missed_branch_hint: "如果第三轮再主动一点，后续协作关系可能会更顺。",
      literary_closing: "真正的分寸不是拒绝一切，而是让别人看见你的边界也有道理。",
      badge_label: "重新协商"
    }
  ],
  turns: [
    {
      id: "work-tonight-turn-1",
      assistant_message: "这个方案今晚改出来。",
      emotion_hint: "",
      strategies: [
        {
          id: "work-tonight-intent-1",
          label: "先接任务",
          description: "别让对话一开始就顶住。",
          replies: [
            { id: "work-tonight-reply-1a", style_label: "职业接法", style_description: "先接住，再把节奏拉回专业。", content: "可以，我先确认一下优先改哪些部分，避免今晚返工。" },
            { id: "work-tonight-reply-1b", style_label: "先接后问", style_description: "承接任务，再确认重点。", content: "收到，我这边可以推进，不过得先对齐一下最关键的改动点。" }
          ]
        },
        {
          id: "work-tonight-intent-2",
          label: "确认范围",
          description: "先把要改什么说清楚。",
          replies: [
            { id: "work-tonight-reply-1c", style_label: "拆清重点", style_description: "避免模糊执行。", content: "我可以改，但需要您先明确最关键的两处修改。" },
            { id: "work-tonight-reply-1d", style_label: "锁优先级", style_description: "把任务先拆成可执行的范围。", content: "为了今晚能准时出版本，您先帮我锁一下这次调整的优先顺序。" }
          ]
        },
        {
          id: "work-tonight-intent-3",
          label: "稳稳设边界",
          description: "说明节奏，但不直接对抗。",
          replies: [
            { id: "work-tonight-reply-1e", style_label: "边界表达", style_description: "语气稳，但分寸清楚。", content: "我能继续推进，但需要先明确最关键的两处改动。" },
            { id: "work-tonight-reply-1f", style_label: "说明现实", style_description: "把节奏和质量一起摆出来。", content: "今晚可以做，不过如果想保证质量，我得按优先级来处理。" }
          ]
        }
      ]
    },
    {
      id: "work-tonight-turn-2",
      assistant_message: "重点你应该清楚，明早我就要看版本。",
      emotion_hint: "他还在施压",
      strategies: [
        {
          id: "work-tonight-intent-4",
          label: "推进协商",
          description: "把任务拆成今晚可交付的节奏。",
          replies: [
            { id: "work-tonight-reply-2a", style_label: "清晰拆解", style_description: "给出可执行替代方案。", content: "我理解时效，今晚可以先出核心版，细节优化明早补齐给您确认。" },
            { id: "work-tonight-reply-2b", style_label: "节奏协商", style_description: "把任务拆成两段，稳住质量。", content: "那我先把影响最大的部分今晚完成，剩下的优化项明早并进去。" }
          ]
        },
        {
          id: "work-tonight-intent-5",
          label: "争取缓冲",
          description: "说明时间和质量之间的现实关系。",
          replies: [
            { id: "work-tonight-reply-2c", style_label: "稳定协商", style_description: "把风险讲清楚，不带情绪。", content: "如果要保证质量，我建议先锁两项关键修改，今晚就能稳妥交付。" },
            { id: "work-tonight-reply-2d", style_label: "说明约束", style_description: "让他看到临时加量的代价。", content: "我可以今晚继续做，但如果范围不收住，明早版本质量会受影响。" }
          ]
        },
        {
          id: "work-tonight-intent-6",
          label: "只谈交付",
          description: "不接情绪，只回到执行本身。",
          replies: [
            { id: "work-tonight-reply-2e", style_label: "专业回应", style_description: "把注意力放回目标。", content: "明白，那我现在就按优先级推进，先确保明早能看到可确认版本。" },
            { id: "work-tonight-reply-2f", style_label: "冷静落回目标", style_description: "不让对话被压力带跑。", content: "收到，我先以结果为目标推进，过程里有变化我会及时同步。" }
          ]
        }
      ]
    },
    {
      id: "work-tonight-turn-3",
      assistant_message: "行，那你先按这个节奏推进，十一点前给我初版。",
      emotion_hint: "他开始接受你的节奏",
      ending_id: "ending-work-balance",
      ending_prompt: "这轮协商已经稳住了，要把这一局收在这里吗？",
      strategies: [
        {
          id: "work-tonight-intent-7",
          label: "确认交付",
          description: "把边界正式落到执行里。",
          replies: [
            { id: "work-tonight-reply-3a", style_label: "清晰收尾", style_description: "边界明确，执行落地。", content: "收到，我先出初版，涉及新增方向的部分我会在备注里单独标清。" },
            { id: "work-tonight-reply-3b", style_label: "交付确认", style_description: "把范围和时间同时确认下来。", content: "明白，我按这个范围推进，十一点前把初版和修改说明一起发您。" }
          ]
        },
        {
          id: "work-tonight-intent-8",
          label: "保持尊重",
          description: "语气稳住，不再额外顶回去。",
          replies: [
            { id: "work-tonight-reply-3c", style_label: "专业留痕", style_description: "让后续协作更顺一点。", content: "没问题，我按这个范围推进，十一点前把版本和修改点一并发您。" },
            { id: "work-tonight-reply-3d", style_label: "稳住语气", style_description: "把执行和进度同步说清楚。", content: "好的，我先推进，稍后把当前进度和十一点前可交付内容同步给您。" }
          ]
        },
        {
          id: "work-tonight-intent-9",
          label: "留一手缓冲",
          description: "避免后面再被临时加码。",
          replies: [
            { id: "work-tonight-reply-3e", style_label: "先锁范围", style_description: "防止需求继续膨胀。", content: "收到，我先按现在确认的内容推进，新的调整我会放到下一轮统一处理。" },
            { id: "work-tonight-reply-3f", style_label: "提前留缓冲", style_description: "让后续协作不再完全被动。", content: "可以，我先完成这一版初稿，后续新增项我们再单独排优先级。" }
          ]
        }
      ]
    }
  ]
};
