const https = require("https");
const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_API_KEY = "sk-f1f632344b48447d977ca98812c43174";

function parseJSON(text) {
  const cleaned = String(text || "")
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error("AI 返回的不是合法 JSON: " + cleaned.slice(0, 200));
  }
}

async function callDeepSeek(systemPrompt, userPrompt) {
  const postData = JSON.stringify({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.85,
    max_tokens: 1500
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      DEEPSEEK_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + DEEPSEEK_API_KEY
        }
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          try {
            const json = JSON.parse(body);
            if (json.choices && json.choices[0]) {
              resolve(json.choices[0].message.content);
              return;
            }

            reject(new Error("DeepSeek 返回格式异常: " + body.slice(0, 200)));
          } catch (error) {
            reject(new Error("JSON 解析失败: " + body.slice(0, 200)));
          }
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error("DeepSeek 请求超时"));
    });
    req.write(postData);
    req.end();
  });
}

function clampFavorability(value, fallback) {
  const numericValue = typeof value === "number" ? value : fallback;
  return Math.max(0, Math.min(100, numericValue));
}

function buildSystemPrompt(character, background, currentMood, currentFavorability) {
  return `你是"如果这样回"对话模拟引擎。你的任务是扮演一个真实的人，与用户进行情感对话模拟。

## 你扮演的角色
姓名：${character.name}
性别：${character.gender || "未知"}
年龄：${character.age || "未知"}
性格：${character.personality || character.archetype || ""}
说话风格：${character.speaking_style || ""}
对这段关系的态度：${character.attitude_to_relationship || character.current_attitude || ""}
当前情绪状态：${currentMood}
当前好感度：${currentFavorability}/100

## 故事背景
${background}

## 核心规则
1. 你必须完全以角色身份说话，不能出戏，不能承认自己是 AI
2. 回复必须符合角色说话风格，用词习惯、句式长短、语气特征都一致
3. 情绪反应必须基于角色性格和当前好感度，不能无条件对用户友好
4. 每次回复只发 1-3 条消息，模拟真实微信节奏
5. 回复要像真人发微信，用短句，不要书面语
6. 好感度影响你的反应方式：
   - 0-20：冷淡、敷衍、想结束对话
   - 20-40：礼貌但有距离，不会主动延伸话题
   - 40-60：正常交流，偶尔流露真实情绪
   - 60-80：开始主动、语气变软、会追问细节
   - 80-100：明显在意、会暴露脆弱面、不想结束对话`;
}

function normalizeMessages(session) {
  const messages = Array.isArray(session.messages) ? session.messages.slice() : [];
  if (messages.length > 0) {
    return messages;
  }

  if (session.scenarioData && session.scenarioData.cover && session.scenarioData.cover.opening_message) {
    return [
      {
        role: "assistant",
        name: session.scenarioData.character && session.scenarioData.character.name,
        content: session.scenarioData.cover.opening_message,
        timestamp: Date.now()
      }
    ];
  }

  return [];
}

function compressMessages(messages) {
  if (messages.length <= 12) {
    return messages;
  }

  const firstRound = messages.slice(0, Math.min(2, messages.length));
  const recent = messages.slice(-8);
  return firstRound.concat(recent);
}

function formatHistory(messages) {
  return compressMessages(messages)
    .map((message) => {
      const role = message.role === "assistant" ? "对方" : "用户";
      return role + "：" + (message.content || "");
    })
    .join("\n");
}

function normalizeStrategy(strategy, index) {
  return {
    id: "strategy-" + (index + 1),
    label: strategy.label,
    description: strategy.description
  };
}

function normalizeReply(reply, index, strategyId) {
  return {
    id: strategyId + "-reply-" + (index + 1),
    style_label: reply.style_label,
    style_description: reply.style_description,
    content: reply.content
  };
}

async function generateStrategies(session) {
  const character = session.scenarioData.character || {};
  const background = session.scenarioData.background || "";
  const systemPrompt = buildSystemPrompt(
    character,
    background,
    session.current_mood,
    session.current_favorability
  );

  const userPrompt = `## 任务
根据当前对话状态，为用户生成 3 个不同方向的回复策略。

## 当前对话记录
${formatHistory(normalizeMessages(session))}

## 对方当前状态
情绪：${session.current_mood}
好感度：${session.current_favorability}/100

## 要求
1. 三个方向之间必须有明显差异（如：防御型 vs 进攻型 vs 观望型）
2. 每个策略用 2-4 个字的口语化标签命名
3. 策略必须贴合当前对话语境，不能泛泛而谈
4. 考虑角色性格，策略要有“对这个人可能有效”的合理性

## 输出格式（严格 JSON，不要输出其他任何内容）
{
  "strategies": [
    {"label": "策略标签", "description": "一句话描述意图"},
    {"label": "策略标签", "description": "一句话描述意图"},
    {"label": "策略标签", "description": "一句话描述意图"}
  ]
}`;

  const raw = await callDeepSeek(systemPrompt, userPrompt);
  const result = parseJSON(raw);
  const strategies = Array.isArray(result.strategies) ? result.strategies.slice(0, 3) : [];

  return {
    strategies: strategies.map(normalizeStrategy)
  };
}

async function generateReplies(session, strategy) {
  const character = session.scenarioData.character || {};
  const background = session.scenarioData.background || "";
  const systemPrompt = buildSystemPrompt(
    character,
    background,
    session.current_mood,
    session.current_favorability
  );

  const userPrompt = `## 任务
用户选择了「${strategy.label}」策略：${strategy.description}
基于这个方向，生成 2 条风格不同的具体回复。

## 当前对话记录
${formatHistory(normalizeMessages(session))}

## 要求
1. 两条都符合选定策略方向，但风格差异明显
2. 每条附带风格标签（6-12 字）
3. 回复长度 1-2 句话，模拟真实微信聊天篇幅
4. 用词像真人发微信，不要书面语

## 输出格式（严格 JSON，不要输出其他任何内容）
{
  "replies": [
    {
      "style_label": "风格标签",
      "style_description": "一句话解释效果",
      "content": "具体回复内容"
    },
    {
      "style_label": "风格标签",
      "style_description": "一句话解释效果",
      "content": "具体回复内容"
    }
  ]
}`;

  const raw = await callDeepSeek(systemPrompt, userPrompt);
  const result = parseJSON(raw);
  const replies = Array.isArray(result.replies) ? result.replies.slice(0, 3) : [];

  return {
    replies: replies.map((reply, index) => normalizeReply(reply, index, strategy.id || "strategy"))
  };
}

async function generateResponse(session, userMessage) {
  const character = session.scenarioData.character || {};
  const background = session.scenarioData.background || "";
  const endingTriggers = session.scenarioData.ending_triggers || {};
  const possibleEndings = session.scenarioData.possible_endings || [];
  const systemPrompt = buildSystemPrompt(
    character,
    background,
    session.current_mood,
    session.current_favorability
  );
  const roundNumber = Math.floor(normalizeMessages(session).length / 2) + 1;
  const endingConditions = Array.isArray(endingTriggers.conditions)
    ? endingTriggers.conditions.map((item) => "- " + item).join("\n")
    : "- 根据对话语境判断是否已到合适收尾节点";

  const userPrompt = `## 任务
用户刚刚发出了这条消息："${userMessage}"
请以 ${character.name} 的身份回应，并更新对话状态。

## 当前对话记录
${formatHistory(normalizeMessages(session))}

## 当前状态
- 情绪：${session.current_mood}
- 好感度：${session.current_favorability}/100
- 当前轮数：第 ${roundNumber} 轮

## 回应要求
1. 以角色身份回复，严格符合说话风格和当前情绪状态
2. 回复 1-3 条消息
3. 根据用户这条消息判断好感度变化（-15 到 +15 之间）
4. 更新情绪状态（3-6 字自然描述）

## 情绪提示判定
如果这一轮产生了明显的关系转折，生成一句情绪提示（3-6字）。
没有明显转折则 emotion_hint 为空字符串。

## 结局判定
检查是否满足以下任一条件：
${endingConditions}
- 对话轮数已达到 ${roundNumber} 轮（正常节奏下 8-12 轮结束）

如果满足结局条件，should_end 设为 true，并从以下结局中选择最匹配的：
${JSON.stringify(possibleEndings)}

如果触发结局，同时生成结局内容，包括：
- relationship_result：一句话关系结果
- key_behavior_feedback：指出具体哪句话起了关键作用
- missed_branch_hint：暗示另一种可能（只暗示不剧透）
- literary_closing：文艺结语（用于分享）

## 输出格式（严格 JSON，不要输出其他任何内容）
{
  "reply_messages": ["消息1"],
  "mood_update": "新情绪状态",
  "favorability_change": 5,
  "new_favorability": ${session.current_favorability},
  "emotion_hint": "",
  "should_end": false,
  "ending": null
}

如果 should_end 为 true，ending 格式为：
{
  "type": "结局类型id",
  "relationship_result": "",
  "key_behavior_feedback": "",
  "missed_branch_hint": "",
  "literary_closing": ""
}`;

  const raw = await callDeepSeek(systemPrompt, userPrompt);
  const result = parseJSON(raw);
  result.reply_messages = Array.isArray(result.reply_messages) ? result.reply_messages.slice(0, 3) : [];
  result.mood_update = result.mood_update || session.current_mood || "";
  result.favorability_change = typeof result.favorability_change === "number" ? result.favorability_change : 0;
  result.new_favorability = clampFavorability(result.new_favorability, session.current_favorability);
  result.emotion_hint = result.emotion_hint || "";
  result.should_end = Boolean(result.should_end && result.ending);
  if (!result.should_end) {
    result.ending = null;
  }
  return result;
}

async function loadSessionWithScenario(sessionId) {
  const sessionDoc = await db.collection("sessions").doc(sessionId).get();
  const session = sessionDoc.data;
  const scenarioRes = await db.collection("scenarios").where({ id: session.scenario_id }).limit(1).get();

  if (!scenarioRes.data || scenarioRes.data.length === 0) {
    throw new Error("剧本不存在");
  }

  session.scenarioData = scenarioRes.data[0];
  session.messages = normalizeMessages(session);
  return session;
}

exports.main = async (event = {}) => {
  const action = event.action;
  const sessionId = event.session_id;
  const strategy = event.strategy;
  const userMessage = event.user_message;
  const wxContext = cloud.getWXContext();

  if (!sessionId) {
    return { code: -1, message: "缺少 session_id 参数" };
  }

  try {
    const session = await loadSessionWithScenario(sessionId);
    let result;

    switch (action) {
      case "generateStrategies":
        result = await generateStrategies(session);
        break;

      case "generateReplies":
        if (!strategy) {
          return { code: -1, message: "缺少 strategy 参数" };
        }
        result = await generateReplies(session, strategy);
        break;

      case "generateResponse": {
        if (!userMessage) {
          return { code: -1, message: "缺少 user_message 参数" };
        }

        const updatedMessages = session.messages.concat([
          {
            role: "user",
            content: userMessage,
            timestamp: Date.now()
          }
        ]);

        session.messages = updatedMessages;
        result = await generateResponse(session, userMessage);

        const aiMessages = (result.reply_messages || []).map((message) => ({
          role: "assistant",
          name: session.scenarioData.character.name,
          content: message,
          timestamp: Date.now()
        }));
        const finalMessages = updatedMessages.concat(aiMessages);

        await db.collection("sessions").doc(sessionId).update({
          data: {
            messages: finalMessages,
            current_mood: result.mood_update || session.current_mood,
            current_favorability: result.new_favorability,
            updated_at: db.serverDate()
          }
        });

        if (result.should_end && result.ending) {
          await db.collection("endings").add({
            data: {
              openid: wxContext.OPENID,
              scenario_id: session.scenario_id,
              session_id: sessionId,
              ending_type: result.ending.type || "unknown",
              ending_text: {
                relationship_result: result.ending.relationship_result || "",
                key_behavior_feedback: result.ending.key_behavior_feedback || "",
                missed_branch_hint: result.ending.missed_branch_hint || "",
                literary_closing: result.ending.literary_closing || ""
              },
              created_at: db.serverDate()
            }
          });

          await db.collection("sessions").doc(sessionId).update({
            data: {
              status: "ended",
              updated_at: db.serverDate()
            }
          });
        }
        break;
      }

      default:
        return { code: -1, message: "未知的 action: " + action };
    }

    return {
      code: 0,
      data: result
    };
  } catch (error) {
    console.error("[chatEngine] 错误:", error);
    if (error.message && error.message.includes("DeepSeek")) {
      console.log("[chatEngine] DeepSeek 调用失败，等待前端兜底");
    }
    return {
      code: -1,
      message: error.message || "聊天引擎异常"
    };
  }
};
