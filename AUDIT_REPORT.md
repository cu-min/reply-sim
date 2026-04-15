## 审查报告

### 发现的问题

| 编号 | 文件 | 问题描述 | 严重程度 | 修复方式 | 是否已修复 |
|------|------|----------|----------|----------|------------|
| 1 | `cloudfunctions/chatEngine/index.js` | DeepSeek API Key 硬编码在代码里，存在泄漏风险 | 高 | 改为读取环境变量 `DEEPSEEK_API_KEY`，并补充缺失配置与 HTTP 状态码校验 | ✅ |
| 2 | `cloudfunctions/syncSession/index.js` `cloudfunctions/chatEngine/index.js` `cloudfunctions/saveEnding/index.js` | 只要知道 `session_id` 就能更新/读取他人会话，缺少 openid 归属校验 | 高 | 写入和读取前增加会话归属校验，拒绝跨用户访问 | ✅ |
| 3 | `cloudfunctions/chatEngine/index.js` | 结局判定提示里使用“已达到当前轮数”，会让 AI 过早结束对话 | 高 | 改为“8 轮后且自然来到收束节点才允许结束”，并保留场景触发条件 | ✅ |
| 4 | `cloudfunctions/chatEngine/index.js` `cloudfunctions/saveEnding/index.js` `cloudfunctions/getUserProfile/index.js` `miniprogram/services/chat-ai-service.js` `miniprogram/pages/ending/index.js` | 结局只保存 `type`，无法稳定回显具体结局标签，且存在重复落库风险 | 高 | 补齐 `ending_id` `ending_label` `badge_label`，按 `session_id` 去重保存 | ✅ |
| 5 | `cloudfunctions/heartManager/index.js` | 扣减心动值先读后写，连续点击可能导致多扣 | 高 | 改为带条件的更新，只在 `hearts > 0` 时允许扣减 | ✅ |
| 6 | `cloudfunctions/login/index.js` 及多个云函数 | 错误返回码混用 `1` 和 `-1`，登录 `isNew` 标记前端也拿不到 | 中 | 统一错误码为 `-1`，并把 `isNew` 放进 `data` | ✅ |
| 7 | `cloudfunctions/getScenarios/index.js` | 列表接口返回了不必要的 `character` 大字段 | 中 | 收窄字段，只返回首页列表真正需要的数据 | ✅ |
| 8 | `cloudfunctions/createSession/index.js` | 创建会话时直接读取 `scenario.character.*`，遇到字段缺失会崩 | 中 | 增加 `character` 兜底和好感度边界控制 | ✅ |
| 9 | `miniprogram/services/user-service.js` | 资料服务仍按旧版嵌套结构映射，和新的 `getUserProfile` 返回不一致 | 中 | 改为映射新的扁平结构，并统一本地兜底数据格式 | ✅ |
| 10 | `miniprogram/pages/home/index.js` | `onLoad` 和 `onShow` 首次进入会重复拉剧本列表，容易闪烁 | 中 | 首次进入跳过一次 `onShow` 刷新，后续返回首页再正常刷新 | ✅ |
| 11 | `miniprogram/pages/script-detail/index.js` `miniprogram/pages/ending/index.js` `miniprogram/pages/chat/index.js` | 页面加载时缺少参数校验和异常兜底，云端失败时会直接掉进空白态 | 中 | 为缺参和请求失败补上 toast + 错误态渲染 | ✅ |
| 12 | `miniprogram/pages/profile/index.js` | “我的”页面串行请求心动值和资料，任一失败就整页报错 | 中 | 改为 `Promise.allSettled`，分开兜底心动值和资料数据 | ✅ |
| 13 | `cloudfunctions/importScenarios/index.js` | 仍然维护一份内联剧本数据，没有直接消费 `/data/scenarios/*.json`，存在双份数据漂移风险 | 中 | 本轮先记录风险，未改动导入结构 | ❌ |

### 已自动修复的问题

- 修复了云函数返回码不统一、登录 `isNew` 丢失、剧本列表返回冗余字段的问题。
- 修复了 `syncSession`、`chatEngine`、`saveEnding` 的会话归属校验，避免跨用户更新或读取。
- 修复了聊天引擎的结局触发逻辑，避免 AI 在前几轮就错误收尾。
- 修复了结局数据链路，新增 `ending_id`、`ending_label`、`badge_label`，并在历史记录与结局页中正确回显。
- 修复了心动值扣减的并发多扣风险，并统一分享来源字段识别。
- 修复了首页首屏重复请求、详情页/聊天页/结局页缺参或云端失败时的错误兜底。
- 修复了用户资料服务与云端返回结构不一致的问题，并让“我的”页面在部分请求失败时仍能显示已有数据。

### 需要人工处理的问题

- `DeepSeek API Key` 已从代码中移除，云函数环境里需要手动配置 `DEEPSEEK_API_KEY`，否则 AI 聊天功能会返回“缺少 DeepSeek API Key 配置”。
- `importScenarios` 目前仍内置了一份剧本数据，而仓库根目录还有 `/data/scenarios/*.json`；后续最好统一为单一数据源，避免维护两份内容。

### 整体评估

项目主流程已经基本成型，但在这轮审计前，云端权限校验、结局数据一致性和 AI 安全配置这三块存在明显风险。现在高风险问题已经收紧，主流程的健壮性明显提升；剩余主要是部署配置和数据源治理问题，适合在下一轮继续收口。
