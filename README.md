# 如果这样回

> 有些话说出口就后悔，有些话没说出口更后悔。

情感对话模拟小程序。选一段关系、选一个场景，AI 扮演对方真实回应，每句话都会带来不同走向。反复斟酌，择善而从——找到真实压力下最适合你的那种表达。

---

## 产品形态

- 微信小程序，轻量化，随用随走
- 情感模拟娱乐产品，不是实时聊天辅助工具
- 用户在产品内完成全程闭环模拟

## 技术栈

- 原生微信小程序（JavaScript）
- 微信云开发（云函数 + 云数据库）
- DeepSeek API（对话生成引擎）

当前版本采用单云环境发布，`develop / trial / release` 共用同一套云开发环境，不做环境隔离。

---

## 目录结构

```
如果这样回/
├── miniprogram/                  # 小程序主体
│   ├── assets/                   # 静态资源
│   │   ├── icons/                # 图标资源
│   │   └── tabbar/               # 底部导航图标
│   ├── components/               # 公共组件
│   │   ├── chat-message/         # 聊天消息气泡
│   │   ├── intent-chip/          # 意图策略按钮
│   │   └── reply-option/         # 候选回复卡片
│   ├── config/                   # 运行时配置
│   │   └── env.js                # 云环境 ID（当前单环境发布）
│   ├── mock/                     # 本地 mock 数据（脚本生成的开发兜底）
│   │   └── scenarios/            # 剧本运行层适配
│   ├── pages/
│   │   ├── home/                 # 首页（剧本浏览）
│   │   ├── script-detail/        # 剧本详情页
│   │   ├── chat/                 # 聊天页（核心交互）
│   │   ├── ending/               # 结局页
│   │   └── profile/              # 我的页面
│   ├── services/                 # 服务层
│   │   ├── cloud-service.js      # 云函数调用封装
│   │   ├── script-service.js     # 剧本数据服务
│   │   ├── session-service.js    # 会话管理服务
│   │   ├── user-service.js       # 用户登录服务
│   │   ├── heart-service.js      # 心动值服务
│   │   ├── chat-ai-service.js    # AI 对话服务
│   │   └── profile-service.js    # 用户资料服务
│   ├── styles/                   # 全局样式与设计 token
│   ├── utils/                    # 工具函数
│   ├── app.js                    # 应用入口
│   ├── app.json                  # 应用配置
│   └── app.wxss                  # 全局样式
├── cloudfunctions/               # 云函数
│   ├── login/                    # 微信静默登录
│   ├── getScenarios/             # 获取剧本列表
│   ├── getScenarioDetail/        # 获取剧本详情
│   ├── createSession/            # 创建对话会话
│   ├── syncSession/              # 同步对话记录
│   ├── saveEnding/               # 保存结局数据
│   ├── getUserProfile/           # 获取用户统计
│   ├── heartManager/             # 心动值管理
│   ├── chatEngine/               # DeepSeek 对话引擎
│   ├── importScenarios/          # 剧本数据同步（读取部署快照）
│   ├── submitFeedback/           # 用户反馈提交
│   ├── dataAudit/                # 线上数据核查（开发工具）
│   └── DB_SCHEMA.md              # 数据库集合设计文档
├── data/
│   └── scenarios/                # 标准剧本 JSON（唯一真源）
├── AUDIT_REPORT.md               # 全量审计报告
└── README.md                     # 本文件
```

---

## 核心功能

### 对话流程
用户选择剧本进入对话后，每轮交互分三步：
1. **选策略** — AI 根据当前对话状态生成 3 个不同方向的回复策略
2. **选回复** — 基于选定策略生成 2 条风格不同的候选回复
3. **微调发送** — 选中的回复自动填入输入框，可手动修改后发送

每轮调用 DeepSeek 3 次（策略生成 → 候选回复 → 对方回应），对方回应时同步更新情绪状态和好感度。

### AI 角色系统
- 底层人物档案（固定）：性格、说话风格、对关系的态度
- 表层情绪状态（动态）：好感度 0-100 驱动反应方式变化
- 情绪提示：关键转折时在消息上方显示（"他有点动摇""他放松下来了"）

### 结局系统
- AI 自动判断结局触发条件（关系明确、情绪爆发、自然告别、轮数上限）
- 结局四层内容：关系结果 → 关键行为反馈 → 错过的分支暗示 → 文艺结语
- 同一剧本支持多种结局走向

### 心动值系统
- 新用户赠送 5 点心动值
- 每局对话开始时消耗 1 点（首轮发送时在服务端扣减）
- 分享奖励功能暂未开放（待接入可核验凭证后启用）

---

## 云数据库集合

| 集合 | 用途 | 权限 |
|------|------|------|
| `users` | 用户信息、心动值 | 仅创建者可读写 |
| `scenarios` | 剧本数据 | 所有用户可读 |
| `sessions` | 对话会话记录 | 仅创建者可读写 |
| `endings` | 结局记录 | 仅创建者可读写 |
| `message_requests` | `chatEngine` 幂等、防重与响应缓存 | 仅创建者可读写 |
| `feedbacks` | 用户反馈 | 仅创建者可读写 |

---

## 云函数列表

| 云函数 | 功能 |
|--------|------|
| `login` | 微信静默登录 + 新用户创建 |
| `getScenarios` | 获取剧本列表（支持分类筛选） |
| `getScenarioDetail` | 获取单个剧本完整数据 |
| `createSession` | 创建新对话会话 |
| `syncSession` | 同步对话记录到云端 |
| `saveEnding` | 保存结局数据（按 session_id 去重） |
| `getUserProfile` | 获取用户统计和历史记录 |
| `heartManager` | 心动值查询 |
| `chatEngine` | DeepSeek 对话引擎（策略 / 候选 / 回应），含首轮心动值扣减 |
| `importScenarios` | 按剧本真源快照同步到 `scenarios` 集合 |
| `submitFeedback` | 提交用户反馈到 `feedbacks` 集合 |
| `dataAudit` | 线上数据核查（开发工具，不对用户开放） |

---

## 首批剧本

| 分类 | 剧本 | 开场消息 |
|------|------|----------|
| 前任 | 深夜的那一句话 | "睡了吗？" |
| 前任 | 他发来了一张照片 | "翻到了这个。" |
| 暗恋 | 你是不是有话想跟我说？ | "你是不是有话想跟我说？" |
| 暗恋 | 朋友聚会后他单独找你说话 | "要不要一起走一段？" |
| 职场 | 这个方案今晚改出来 | "这个方案今晚改出来。" |
| 社交 | 朋友借钱不还，你要不要开口 | "那个钱，我这周回不了。" |

---

## 本地开发

### 环境要求
- 微信开发者工具
- 已开通微信云开发

### 运行步骤
1. 用微信开发者工具打开项目根目录
2. 确认 `project.config.json` 中的 `appid` 为你的小程序 AppID
3. 在 `miniprogram/config/env.js` 中填写你的云开发环境 ID（当前 `dev / prod` 指向同一个环境，用于单环境发布）
4. 在云开发控制台创建 6 个集合：`users`、`scenarios`、`sessions`、`endings`、`message_requests`、`feedbacks`
5. 逐个部署 `cloudfunctions/` 下的所有云函数（右键 → 上传并部署：云端安装依赖）
6. 在云函数 `chatEngine` 的环境变量中配置 `DEEPSEEK_API_KEY`
7. 修改剧本时只编辑 `data/scenarios/*.json`
8. 本地执行 `npm run scenarios:validate`
9. 本地执行 `npm run scenarios:prepare-import`
10. 如需刷新开发兜底 mock，执行 `npm run scenarios:generate-mock`
11. 重新部署 `cloudfunctions/importScenarios`
12. 执行一次 `importScenarios` 云函数，将部署快照同步到数据库
13. 编译运行

### 更新剧本流程（命令行）

只修改 `data/scenarios/*.json`，然后按下面顺序执行：

```bash
npm run scenarios:validate
npm run scenarios:prepare-import
```

如果还需要刷新本地开发兜底 mock，再执行：

```bash
npm run scenarios:generate-mock
```

然后：

1. 在微信开发者工具里重新部署 `cloudfunctions/importScenarios`
2. 手动执行一次 `importScenarios` 云函数

返回结果说明：

- `imported`：新增剧本数量
- `updated`：更新剧本数量
- `unchanged`：未变化剧本数量
- `failed`：失败数量

如果重复导入同一批未改动剧本，返回 `unchanged` 是正常的，不会重复新增。

### 提交规范
使用 [Conventional Commits](https://www.conventionalcommits.org/)：
- `feat:` 新功能
- `fix:` 修复
- `chore:` 工程维护
- `refactor:` 重构

---

## 开发历程

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | 工程收口 + 剧本数据结构 + 首批 6 个剧本 | ✅ 完成 |
| Phase 2 | 微信登录 + 云开发基础设施 + 数据云端化 | ✅ 完成 |
| Phase 3 | DeepSeek 接入 + Prompt 三段式架构 + 聊天引擎 | ✅ 完成 |
| Phase 4 | 分享闭环 + 心动值系统 + 体验打磨 + 我的页面改版 | ✅ 完成 |
| 全量审计 | 安全校验 + 数据一致性 + 异常兜底 + 13 项修复 | ✅ 完成 |
| Phase 5 | 用户文档统一 ID + 越权防护 + 幂等扣心 + 结局字段补全 + 环境配置分离 | ✅ 完成 |

---

## 已知待处理

- 剧本真源固定为 `data/scenarios/*.json`，不要再手工修改 `miniprogram/mock/scenarios/*.js` 或 `importScenarios/index.js` 中的剧本正文
- `cloudfunctions/importScenarios/scenarios/` 是部署快照目录，由 `npm run scenarios:prepare-import` 生成，不直接手工维护
- `miniprogram/mock/scenarios/*.js` 由 `npm run scenarios:generate-mock` 自动生成，作为开发兜底
- 当前发布策略为单云环境发布，`develop / trial / release` 共用同一个云环境
- tabbar 和分享图标目前为占位资源，需按 `assets/tabbar/ICON_SPEC.md` 规格替换正式图标
- DeepSeek API Key 需通过云函数环境变量配置，不要硬编码到代码中
