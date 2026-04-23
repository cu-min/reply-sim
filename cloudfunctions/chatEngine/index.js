const https = require("https");
const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.deepseek_api_key || "";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

const USER_MESSAGE_MAX_LENGTH = 200;
const REQUEST_ID_MAX_LENGTH = 64;
const REQUEST_LOCK_WINDOW_MS = 45000;
const DEFAULT_USER_HEARTS = 5;
const DEFAULT_MIN_ENDING_ROUND = 4;
const NATURAL_ENDING_ROUND = 8;

function unwrapDocData(result) {
  const data = result && result.data;
  if (Array.isArray(data)) {
    return data[0] || null;
  }

  return data || null;
}

async function getOptionalDoc(ref) {
  try {
    return unwrapDocData(await ref.get());
  } catch (error) {
    const message = error && error.message ? String(error.message) : "";
    if (message.includes("does not exist") || message.includes("document not found")) {
      return null;
    }

    throw error;
  }
}

class ChatEngineError extends Error {
  constructor(code, message, data) {
    super(message);
    this.name = "ChatEngineError";
    this.code = code || "CHAT_ENGINE_ERROR";
    this.data = data || null;
  }
}

function parseJSON(text) {
  const cleaned = String(text || "")
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const objectStart = cleaned.indexOf("{");
    const objectEnd = cleaned.lastIndexOf("}");
    if (objectStart >= 0 && objectEnd > objectStart) {
      const jsonLike = cleaned.slice(objectStart, objectEnd + 1);
      try {
        return JSON.parse(jsonLike);
      } catch (innerError) {}
    }

    throw new ChatEngineError("AI_INVALID_JSON", "AI 返回的不是合法 JSON", {
      raw_preview: cleaned.slice(0, 200)
    });
  }
}

async function callDeepSeek(systemPrompt, userPrompt, maxTokens, label) {
  if (!DEEPSEEK_API_KEY) {
    throw new ChatEngineError("DEEPSEEK_KEY_MISSING", "缺少 DeepSeek API Key 配置");
  }

  const tag = label || "deepseek";
  const t0 = Date.now();
  console.log("[TIMING]", tag, "start", t0);

  const postData = JSON.stringify({
    model: DEEPSEEK_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.85,
    max_tokens: maxTokens || 800
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
          const elapsed = Date.now() - t0;
          console.log("[TIMING]", tag, "done", elapsed + "ms", "status=" + res.statusCode);
          try {
            const json = JSON.parse(body);

            if (res.statusCode < 200 || res.statusCode >= 300) {
              reject(
                new ChatEngineError(
                  "DEEPSEEK_REQUEST_FAILED",
                  "DeepSeek 请求失败: " + (json.error && json.error.message ? json.error.message : body.slice(0, 200))
                )
              );
              return;
            }

            if (json.choices && json.choices[0] && json.choices[0].message) {
              resolve(json.choices[0].message.content);
              return;
            }

            reject(
              new ChatEngineError(
                "DEEPSEEK_RESPONSE_INVALID",
                "DeepSeek 返回格式异常: " + body.slice(0, 200)
              )
            );
          } catch (error) {
            reject(new ChatEngineError("DEEPSEEK_JSON_PARSE_FAILED", "JSON 解析失败: " + body.slice(0, 200)));
          }
        });
      }
    );

    req.on("error", (error) => {
      const elapsed = Date.now() - t0;
      console.log("[TIMING]", tag, "error", elapsed + "ms", error.message);
      reject(new ChatEngineError("DEEPSEEK_NETWORK_ERROR", error.message || "DeepSeek 网络请求失败"));
    });

    req.setTimeout(45000, () => {
      const elapsed = Date.now() - t0;
      console.log("[TIMING]", tag, "timeout", elapsed + "ms");
      req.destroy();
      reject(new ChatEngineError("DEEPSEEK_TIMEOUT", "DeepSeek 请求超时"));
    });

    req.write(postData);
    req.end();
  });
}

function clampFavorability(value, fallback) {
  const numericValue = typeof value === "number" ? value : fallback;
  return Math.max(0, Math.min(100, Number(numericValue || 0)));
}

function normalizeUserMessage(userMessage) {
  return String(userMessage || "").trim();
}

function validateUserMessage(userMessage) {
  const normalizedMessage = normalizeUserMessage(userMessage);

  if (!normalizedMessage) {
    throw new ChatEngineError("USER_MESSAGE_REQUIRED", "缺少 user_message 参数");
  }

  if (normalizedMessage.length > USER_MESSAGE_MAX_LENGTH) {
    throw new ChatEngineError("USER_MESSAGE_TOO_LONG", "输入内容过长，请控制在 200 字以内");
  }

  return normalizedMessage;
}

function validateRequestId(requestId) {
  const normalizedRequestId = String(requestId || "").trim();

  if (!normalizedRequestId) {
    throw new ChatEngineError("REQUEST_ID_REQUIRED", "缺少 request_id 参数");
  }

  if (normalizedRequestId.length > REQUEST_ID_MAX_LENGTH) {
    throw new ChatEngineError("REQUEST_ID_INVALID", "request_id 长度超出限制");
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(normalizedRequestId)) {
    throw new ChatEngineError("REQUEST_ID_INVALID", "request_id 格式不合法");
  }

  return normalizedRequestId;
}

function getUserDocId(openid) {
  return "user_" + openid;
}

function getEndingDocId(sessionId, openid) {
  return "ending_" + sessionId + "_" + openid;
}

function getMessageRequestDocId(sessionId, requestId) {
  return "msgreq_" + sessionId + "_" + requestId;
}

function normalizeUserHearts(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return DEFAULT_USER_HEARTS;
  }

  return Math.max(0, numericValue);
}

function buildCanonicalUserRecord(openid, source) {
  const user = Object.assign({}, source || {});
  delete user._id;

  return Object.assign(user, {
    openid,
    nickname: user.nickname || "匿名旅人",
    avatar: user.avatar || "",
    hearts: normalizeUserHearts(user.hearts),
    created_at: user.created_at || db.serverDate(),
    updated_at: db.serverDate()
  });
}

async function getOrCreateUserRecordInTransaction(transaction, openid) {
  const userDocId = getUserDocId(openid);
  const userRef = transaction.collection("users").doc(userDocId);
  const existingUser = unwrapDocData(await userRef.get());

  if (existingUser) {
    return {
      user: existingUser,
      userRef
    };
  }

  const legacyUsers = await transaction.collection("users").where({ openid }).limit(1).get();
  const legacyUser = legacyUsers && legacyUsers.data ? legacyUsers.data[0] : null;
  const userRecord = buildCanonicalUserRecord(openid, legacyUser);

  await userRef.set({
    data: userRecord
  });

  return {
    user: userRecord,
    userRef
  };
}

function normalizeEndingMatch(ending, possibleEndings) {
  if (!ending) {
    return null;
  }

  const endings = possibleEndings || [];
  let matchedEnding = endings.find((item) => item.id && item.id === ending.id);

  if (!matchedEnding) {
    matchedEnding = endings.find((item) => {
      return (
        (item.label && item.label === ending.label) ||
        (item.badge_label && item.badge_label === ending.badge_label)
      );
    });
  }

  if (!matchedEnding && ending.type) {
    const typeMatches = endings.filter((item) => item.type === ending.type);
    matchedEnding = typeMatches.length === 1 ? typeMatches[0] : null;
  }

  if (!matchedEnding) {
    return null;
  }

  return {
    id: matchedEnding.id || ending.id || "",
    type: matchedEnding.type || ending.type || "unknown",
    label: matchedEnding.label || ending.label || "",
    badge_label: matchedEnding.badge_label || ending.badge_label || "",
    relationship_result: ending.relationship_result || "",
    key_behavior_feedback: ending.key_behavior_feedback || "",
    missed_branch_hint: ending.missed_branch_hint || "",
    literary_closing: ending.literary_closing || ""
  };
}

function isValidEnding(ending) {
  return Boolean(
    ending &&
      ending.type &&
      ending.relationship_result &&
      ending.key_behavior_feedback &&
      ending.missed_branch_hint &&
      ending.literary_closing
  );
}

function buildCoachSystemPrompt(character, background, currentMood, currentFavorability) {
  return `你是"如果这样回"对话教练。你的任务是帮助用户找到最适合的回复方式，与 ${character.name || "对方"} 沟通。

## 对方的信息
姓名：${character.name || "对方"}
性别：${character.gender || "未知"}
性格：${character.personality || character.archetype || ""}
说话风格：${character.speaking_style || ""}
对这段关系的态度：${character.attitude_to_relationship || character.current_attitude || ""}
当前情绪状态：${currentMood}
当前好感度：${currentFavorability}/100

## 故事背景
${background}

## 你的角色
你是教练，不是 ${character.name || "对方"}。你生成的所有内容都是【用户】应该说的话，用于回应对方。`;
}

function buildSystemPrompt(character, background, currentMood, currentFavorability) {
  return `你是"如果这样回"对话模拟引擎。你的任务是扮演一个真实的人，与用户进行情感对话模拟。
## 你扮演的角色
姓名：${character.name || "对方"}
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
2. 回复必须符合角色说话风格，用词习惯、句式长短、语气特征都要一致
3. 情绪反应必须基于角色性格和当前好感度，不能无条件对用户友好
4. 每次回复只发 1-3 条消息，模拟真实微信节奏
5. 回复要像真人发微信，使用短句，不要书面语
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

function countUserMessages(messages) {
  return (messages || []).filter((item) => item && item.role === "user").length;
}

function getMinimumEndingRound(session) {
  const turns = Array.isArray(session.scenarioData && session.scenarioData.turns)
    ? session.scenarioData.turns
    : [];
  const firstEndingIndex = turns.findIndex((turn) => turn && (turn.ending_id || turn.ending_prompt));

  return firstEndingIndex >= 0 ? firstEndingIndex + 1 : DEFAULT_MIN_ENDING_ROUND;
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
    id: strategy.id || "strategy-" + (index + 1),
    label: String(strategy.label || "").trim(),
    description: String(strategy.description || "").trim()
  };
}

function normalizeReply(reply, index, strategyId) {
  return {
    id: strategyId + "-reply-" + (index + 1),
    style_label: String(reply.style_label || "").trim(),
    style_description: String(reply.style_description || "").trim(),
    content: String(reply.content || "").trim()
  };
}

async function generateStrategies(session) {
  const character = session.scenarioData.character || {};
  const background = session.scenarioData.background || "";
  const systemPrompt = buildCoachSystemPrompt(
    character,
    background,
    session.current_mood,
    session.current_favorability
  );

  const userPrompt = `## 任务
根据当前对话状态，为用户生成 3 个不同方向的【用户回复】策略。这些策略是用户接下来该怎么开口，不是对方会怎么回。
## 当前对话记录
${formatHistory(normalizeMessages(session))}

## 对方当前状态
情绪：${session.current_mood}
好感度：${session.current_favorability}/100

## 要求
1. 三个方向之间必须有明显差异
2. 每个策略用 2-4 个字的口语化标签命名（描述用户的意图，如"撒娇""直接问""冷处理"）
3. 策略必须贴合当前对话语境，不能泛泛而谈
4. 结合对方性格，策略要有"对这个人可能有效"的合理性

## 输出格式（严格 JSON，不要输出其他内容）
{
  "strategies": [
    { "label": "策略标签", "description": "一句话描述意图" },
    { "label": "策略标签", "description": "一句话描述意图" },
    { "label": "策略标签", "description": "一句话描述意图" }
  ]
}`;

  const raw = await callDeepSeek(systemPrompt, userPrompt, 400, "generateStrategies");
  const result = parseJSON(raw);
  const strategies = Array.isArray(result.strategies)
    ? result.strategies
        .filter((item) => item && String(item.label || "").trim() && String(item.description || "").trim())
        .slice(0, 3)
    : [];

  if (!strategies.length) {
    throw new ChatEngineError("AI_STRATEGIES_EMPTY", "AI 未返回策略");
  }

  return {
    strategies: strategies.map(normalizeStrategy)
  };
}

async function generateReplies(session, strategy) {
  const character = session.scenarioData.character || {};
  const background = session.scenarioData.background || "";
  const normalizedStrategy = normalizeStrategy(strategy || {}, 0);
  const systemPrompt = buildCoachSystemPrompt(
    character,
    background,
    session.current_mood,
    session.current_favorability
  );

  const userPrompt = `## 任务
用户选择了"${normalizedStrategy.label}"策略：${normalizedStrategy.description}
基于这个方向，生成 2 条风格不同的【用户回复】。这是用户要发给对方的消息，不是对方说的话。
## 当前对话记录
${formatHistory(normalizeMessages(session))}

## 要求
1. 两条都是用户视角的回复，符合选定策略方向，但风格差异明显
2. 每条附带风格标签（4-12 字）
3. 回复长度 1-2 句话，模拟真实微信聊天
4. 用词像真人发微信，不要书面语
5. 绝对不能写成对方（${character.name || "对方"}）的口吻

## 输出格式（严格 JSON，不要输出其他内容）
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

  const raw = await callDeepSeek(systemPrompt, userPrompt, 500, "generateReplies");
  const result = parseJSON(raw);
  const replies = Array.isArray(result.replies)
    ? result.replies
        .filter((item) => item && String(item.content || "").trim())
        .slice(0, 3)
    : [];

  if (!replies.length) {
    throw new ChatEngineError("AI_REPLIES_EMPTY", "AI 未返回候选回复");
  }

  return {
    replies: replies.map((reply, index) => normalizeReply(reply, index, normalizedStrategy.id || "strategy"))
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
  const historyMessages = normalizeMessages(session);
  const roundNumber = countUserMessages(historyMessages);
  const minEndingRound = getMinimumEndingRound(session);
  const canEnterEnding = roundNumber >= minEndingRound;
  const canNaturallyEnd = roundNumber >= NATURAL_ENDING_ROUND;
  const endingConditions = Array.isArray(endingTriggers.conditions)
    ? endingTriggers.conditions.map((item) => "- " + item).join("\n")
    : "- 根据对话语境判断是否已经到了适合收尾的节点";

  // 只传结局的标识字段，生成字段由 AI 自己写，避免冗余 token
  const endingOptions = possibleEndings.map((e) => ({
    id: e.id,
    type: e.type,
    label: e.label,
    badge_label: e.badge_label
  }));

  const userPrompt = `## 任务
用户刚刚发出了这条消息："${userMessage}"
请以 ${character.name || "对方"} 的身份回应，并更新对话状态。
## 当前对话记录
${formatHistory(historyMessages)}

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
如果这一轮产生了明显的关系转折，生成一句情绪提示（3-6 字）。
没有明显转折时，emotion_hint 置为空字符串。

## 结局判定
剧本最早允许进入结局的轮数：第 ${minEndingRound} 轮
当前是否允许进入结局：${canEnterEnding ? "是" : "否"}

只有“当前是否允许进入结局”为“是”时，才可以把 should_end 设为 true。
如果当前不允许进入结局，无论情绪是否激烈，都必须继续推进对话，并把 should_end 设为 false、ending 设为 null。

允许结局后，再检查是否满足以下任一条件：
${endingConditions}
- 对话轮数已达到 ${NATURAL_ENDING_ROUND} 轮，并且已经自然来到可以收束的位置
当前是否允许自然收尾：${canNaturallyEnd ? "是" : "否"}

如果满足结局条件，should_end 设为 true，并从以下结局中选择最匹配的一种：
${JSON.stringify(endingOptions)}

如果触发结局，同时生成以下结局内容：
- id：匹配的结局 id
- type：匹配的结局 type
- label：匹配的结局 label
- badge_label：匹配的结局 badge_label
- relationship_result：一句话关系结果（不超过 30 字）
- key_behavior_feedback：指出具体哪句话起了关键作用（不超过 40 字）
- missed_branch_hint：暗示另一种可能，只暗示不剧透（不超过 30 字）
- literary_closing：文艺结语用于分享（不超过 30 字）

## 输出格式（严格 JSON，不要输出其他内容）
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
  "id": "结局id",
  "type": "结局类型",
  "label": "结局标题",
  "badge_label": "结局标签",
  "relationship_result": "",
  "key_behavior_feedback": "",
  "missed_branch_hint": "",
  "literary_closing": ""
}`;

  const raw = await callDeepSeek(systemPrompt, userPrompt, 600, "generateResponse");
  const result = parseJSON(raw);

  result.reply_messages = Array.isArray(result.reply_messages)
    ? result.reply_messages.map((message) => String(message || "").trim()).filter(Boolean).slice(0, 3)
    : [];
  if (!result.reply_messages.length) {
    throw new ChatEngineError("AI_REPLY_MESSAGES_EMPTY", "AI 未返回回应消息");
  }

  result.mood_update = result.mood_update || session.current_mood || "";
  result.favorability_change = typeof result.favorability_change === "number" ? result.favorability_change : 0;
  result.new_favorability = clampFavorability(
    result.new_favorability,
    Number(session.current_favorability || 0) + Number(result.favorability_change || 0)
  );
  result.emotion_hint = result.emotion_hint || "";
  result.ending = normalizeEndingMatch(result.ending, possibleEndings);
  result.should_end = Boolean(canEnterEnding && result.should_end && isValidEnding(result.ending));

  if (!result.should_end) {
    result.ending = null;
  }

  return result;
}

async function loadSessionWithScenario(sessionId, openid) {
  const sessionRes = await db.collection("sessions").doc(sessionId).get();
  const session = unwrapDocData(sessionRes);

  if (!session) {
    throw new ChatEngineError("SESSION_NOT_FOUND", "会话不存在");
  }

  if (session.openid !== openid) {
    throw new ChatEngineError("SESSION_FORBIDDEN", "无权访问该会话");
  }

  const scenarioRes = await db.collection("scenarios").where({ id: session.scenario_id }).limit(1).get();
  if (!scenarioRes.data || scenarioRes.data.length === 0) {
    throw new ChatEngineError("SCENARIO_NOT_FOUND", "剧本不存在");
  }

  session.scenarioData = scenarioRes.data[0];
  session.messages = normalizeMessages(session);
  return session;
}

async function acceptGenerateRequest(sessionId, openid, requestId, userMessage) {
  const requestDocId = getMessageRequestDocId(sessionId, requestId);
  const now = Date.now();

  return db.runTransaction(async (transaction) => {
    const sessionRef = transaction.collection("sessions").doc(sessionId);
    const requestRef = transaction.collection("message_requests").doc(requestDocId);

    const session = unwrapDocData(await sessionRef.get());
    if (!session) {
      throw new ChatEngineError("SESSION_NOT_FOUND", "会话不存在");
    }

    if (session.openid !== openid) {
      throw new ChatEngineError("SESSION_FORBIDDEN", "无权访问该会话");
    }

    const requestRecord = await getOptionalDoc(requestRef);
    if (requestRecord) {
      if (requestRecord.openid !== openid || requestRecord.session_id !== sessionId) {
        throw new ChatEngineError("REQUEST_ID_CONFLICT", "请求标识冲突");
      }

      if (requestRecord.user_message !== userMessage) {
        throw new ChatEngineError("REQUEST_ID_REUSED", "同一个 request_id 不能复用到不同消息");
      }

      if (requestRecord.status === "completed" && requestRecord.response) {
        return {
          state: "completed",
          response: requestRecord.response
        };
      }

      if (Number(requestRecord.lock_until_ms || 0) > now) {
        return {
          state: "processing",
          retry_after_ms: Number(requestRecord.lock_until_ms || 0) - now
        };
      }

      await requestRef.update({
        data: {
          lock_until_ms: now + REQUEST_LOCK_WINDOW_MS,
          updated_at: db.serverDate(),
          processing_attempts: _.inc(1)
        }
      });

      return {
        state: "accepted",
        reused: true
      };
    }

    const sessionMessages = normalizeMessages(session);
    const isFirstUserTurn = !session.first_turn_consumed && countUserMessages(sessionMessages) === 0;
    const acceptedMessage = {
      role: "user",
      content: userMessage,
      timestamp: now,
      request_id: requestId
    };
    const updatedMessages = sessionMessages.concat([acceptedMessage]);

    if (isFirstUserTurn) {
      const { user, userRef } = await getOrCreateUserRecordInTransaction(transaction, openid);
      const currentHearts = Number(user.hearts || 0);

      if (currentHearts <= 0) {
        throw new ChatEngineError("HEARTS_NOT_ENOUGH", "心动值不足，无法开始新的对话", {
          hearts: currentHearts
        });
      }

      await userRef.update({
        data: {
          hearts: _.inc(-1),
          updated_at: db.serverDate()
        }
      });
    }

    const sessionPatch = {
      messages: updatedMessages,
      updated_at: db.serverDate()
    };

    if (isFirstUserTurn) {
      sessionPatch.first_turn_consumed = true;
      sessionPatch.first_turn_consumed_at = db.serverDate();
      sessionPatch.first_turn_request_id = requestId;
    }

    await sessionRef.update({
      data: sessionPatch
    });

    await requestRef.set({
      data: {
        session_id: sessionId,
        openid,
        request_id: requestId,
        user_message: userMessage,
        status: "processing",
        lock_until_ms: now + REQUEST_LOCK_WINDOW_MS,
        processing_attempts: 1,
        consumed_first_turn: isFirstUserTurn,
        created_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    });

    return {
      state: "accepted",
      reused: false
    };
  });
}

function buildEndingRecord(session, openid, ending) {
  return {
    openid,
    scenario_id: session.scenario_id,
    session_id: session._id,
    ending_id: ending.id || "",
    ending_type: ending.type || "unknown",
    ending_label: ending.label || ending.type || "未知结局",
    badge_label: ending.badge_label || ending.label || ending.type || "未知结局",
    ending_text: {
      relationship_result: ending.relationship_result || "",
      key_behavior_feedback: ending.key_behavior_feedback || "",
      missed_branch_hint: ending.missed_branch_hint || "",
      literary_closing: ending.literary_closing || ""
    },
    updated_at: db.serverDate()
  };
}

function buildEndingResponse(ending) {
  if (!ending) {
    return null;
  }

  return {
    id: ending.id || "",
    type: ending.type || "unknown",
    label: ending.label || "",
    badge_label: ending.badge_label || ending.label || ending.type || "",
    relationship_result: ending.relationship_result || "",
    key_behavior_feedback: ending.key_behavior_feedback || "",
    missed_branch_hint: ending.missed_branch_hint || "",
    literary_closing: ending.literary_closing || ""
  };
}

function buildGenerateResponseRecord(result) {
  const response = result || {};
  const shouldEnd = Boolean(response.should_end && response.ending);

  return {
    reply_messages: Array.isArray(response.reply_messages)
      ? response.reply_messages.slice(0, 3).map((message) => String(message || ""))
      : [],
    mood_update: response.mood_update || "",
    favorability_change: typeof response.favorability_change === "number" ? response.favorability_change : 0,
    new_favorability: clampFavorability(response.new_favorability, 0),
    emotion_hint: response.emotion_hint || "",
    should_end: shouldEnd,
    ending: shouldEnd ? buildEndingResponse(response.ending) : null
  };
}

async function finalizeGenerateRequest(session, openid, requestId, result) {
  const response = buildGenerateResponseRecord(result);
  const requestDocId = getMessageRequestDocId(session._id, requestId);
  const aiMessages = (response.reply_messages || []).map((message) => ({
    role: "assistant",
    name: session.scenarioData.character && session.scenarioData.character.name,
    content: message,
    timestamp: Date.now(),
    request_id: requestId
  }));

  return db.runTransaction(async (transaction) => {
    const sessionRef = transaction.collection("sessions").doc(session._id);
    const requestRef = transaction.collection("message_requests").doc(requestDocId);

    const requestRecord = unwrapDocData(await requestRef.get());
    if (!requestRecord) {
      throw new ChatEngineError("REQUEST_RECORD_MISSING", "请求记录不存在");
    }

    if (requestRecord.openid !== openid || requestRecord.session_id !== session._id) {
      throw new ChatEngineError("REQUEST_ID_CONFLICT", "请求标识冲突");
    }

    if (requestRecord.status === "completed" && requestRecord.response) {
      return requestRecord.response;
    }

    const currentSession = unwrapDocData(await sessionRef.get());
    if (!currentSession) {
      throw new ChatEngineError("SESSION_NOT_FOUND", "会话不存在");
    }

    if (currentSession.openid !== openid) {
      throw new ChatEngineError("SESSION_FORBIDDEN", "无权访问该会话");
    }

    const finalMessages = normalizeMessages(currentSession).concat(aiMessages);

    let endingRef = null;
    let existingEnding = null;
    let endingRecord = null;
    if (response.should_end && response.ending) {
      endingRef = transaction.collection("endings").doc(getEndingDocId(session._id, openid));
      existingEnding = await getOptionalDoc(endingRef);
      endingRecord = buildEndingRecord(session, openid, response.ending);
    }

    await sessionRef.update({
      data: {
        messages: finalMessages,
        current_mood: response.mood_update || currentSession.current_mood || "",
        current_favorability: response.new_favorability,
        status: response.should_end ? "ended" : "ongoing",
        updated_at: db.serverDate()
      }
    });

    if (endingRef && endingRecord) {
      await endingRef.set({
        data: Object.assign({}, endingRecord, {
          created_at: (existingEnding && existingEnding.created_at) || db.serverDate()
        })
      });
    }

    await requestRef.update({
      data: {
        status: "completed",
        lock_until_ms: 0,
        response,
        updated_at: db.serverDate(),
        completed_at: db.serverDate()
      }
    });

    return response;
  });
}

function buildErrorResult(error, requestAccepted) {
  const normalizedError =
    error instanceof ChatEngineError
      ? error
      : new ChatEngineError("CHAT_ENGINE_RUNTIME_ERROR", error.message || "聊天引擎异常");

  return {
    code: -1,
    error_code: requestAccepted ? "REQUEST_ACCEPTED_PENDING_RETRY" : normalizedError.code,
    message: requestAccepted ? "消息已进入服务端，回复生成中，可稍后使用同一 request_id 重试" : normalizedError.message,
    data: requestAccepted
      ? {
          original_error_code: normalizedError.code,
          original_message: normalizedError.message
        }
      : normalizedError.data || null
  };
}

exports.main = async (event = {}) => {
  const action = event.action;
  const sessionId = event.session_id;
  const strategy = event.strategy;
  const userMessage = event.user_message;
  const requestId = event.request_id;
  const wxContext = cloud.getWXContext();
  const t0 = Date.now();

  console.log("[TIMING] main start action=" + action, t0);

  if (!sessionId) {
    return {
      code: -1,
      error_code: "SESSION_ID_REQUIRED",
      message: "缺少 session_id 参数"
    };
  }

  let requestAccepted = false;
  let pendingRequestId = null;
  let pendingSessionId = null;

  try {
    switch (action) {
      case "generateStrategies": {
        console.log("[TIMING] loadSession start", Date.now() - t0 + "ms");
        const session = await loadSessionWithScenario(sessionId, wxContext.OPENID);
        console.log("[TIMING] loadSession done", Date.now() - t0 + "ms");
        const result = await generateStrategies(session);
        console.log("[TIMING] main done total=" + (Date.now() - t0) + "ms");
        return {
          code: 0,
          data: result
        };
      }

      case "generateReplies": {
        if (!strategy) {
          return {
            code: -1,
            error_code: "STRATEGY_REQUIRED",
            message: "缺少 strategy 参数"
          };
        }

        console.log("[TIMING] loadSession start", Date.now() - t0 + "ms");
        const session = await loadSessionWithScenario(sessionId, wxContext.OPENID);
        console.log("[TIMING] loadSession done", Date.now() - t0 + "ms");
        const result = await generateReplies(session, strategy);
        console.log("[TIMING] main done total=" + (Date.now() - t0) + "ms");

        return {
          code: 0,
          data: result
        };
      }

      case "generateResponse": {
        const normalizedUserMessage = validateUserMessage(userMessage);
        const normalizedRequestId = validateRequestId(requestId);

        console.log("[TIMING] acceptRequest start", Date.now() - t0 + "ms");
        const acceptance = await acceptGenerateRequest(
          sessionId,
          wxContext.OPENID,
          normalizedRequestId,
          normalizedUserMessage
        );
        console.log("[TIMING] acceptRequest done state=" + acceptance.state, Date.now() - t0 + "ms");

        if (acceptance.state === "completed") {
          return {
            code: 0,
            data: acceptance.response
          };
        }

        if (acceptance.state === "processing") {
          return {
            code: -1,
            error_code: "REQUEST_IN_PROGRESS",
            message: "该请求仍在处理中，请稍后使用同一 request_id 重试",
            data: {
              retry_after_ms: Math.max(1000, Number(acceptance.retry_after_ms || 0))
            }
          };
        }

        requestAccepted = true;
        pendingRequestId = normalizedRequestId;
        pendingSessionId = sessionId;

        console.log("[TIMING] loadSession start", Date.now() - t0 + "ms");
        const session = await loadSessionWithScenario(sessionId, wxContext.OPENID);
        console.log("[TIMING] loadSession done", Date.now() - t0 + "ms");

        const result = await generateResponse(session, normalizedUserMessage);

        console.log("[TIMING] finalize start", Date.now() - t0 + "ms");
        const persistedResult = await finalizeGenerateRequest(session, wxContext.OPENID, normalizedRequestId, result);
        console.log("[TIMING] main done total=" + (Date.now() - t0) + "ms");

        return {
          code: 0,
          data: persistedResult
        };
      }

      default:
        return {
          code: -1,
          error_code: "UNKNOWN_ACTION",
          message: "未知的 action: " + action
        };
    }
  } catch (error) {
    console.error("[chatEngine] 错误 total=" + (Date.now() - t0) + "ms:", error.message || error);
    if (requestAccepted && pendingRequestId && pendingSessionId) {
      db.collection("message_requests")
        .doc(getMessageRequestDocId(pendingSessionId, pendingRequestId))
        .update({ data: { lock_until_ms: Date.now() + 5000 } })
        .catch(() => {});
    }
    return buildErrorResult(error, requestAccepted);
  }
};
