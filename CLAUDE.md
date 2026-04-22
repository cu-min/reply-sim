# CLAUDE.md — 如果这样回

## 项目定位
情感对话模拟微信小程序。用户选剧本，AI 扮演对方回应，帮助用户找到最适合自己的表达方式。

## 技术栈
- 原生微信小程序（JavaScript）
- 微信云开发（云函数 + 云数据库）
- DeepSeek API（chatEngine 云函数调用）

## 目录结构
```
miniprogram/pages/     # 页面层
  home/                # 首页（剧本浏览）
  script-detail/       # 剧本详情
  chat/                # 聊天页（核心交互）
  ending/              # 结局页
  profile/             # 我的页面

miniprogram/services/  # 服务层（不要绕过，直接操作云函数）
cloudfunctions/        # 云函数（需在微信开发者工具手动部署）
data/scenarios/        # 剧本 JSON 唯一真源
```

## 核心链路
首页 → 剧本详情 → 聊天 → 结局 → 我的

## 开发原则
- 稳定优先，不做大范围重构
- 新功能在现有链路上小步迭代
- 云函数修改后需手动在微信开发者工具重新部署

## 云数据库集合
- `users` — 用户信息、心动值
- `scenarios` — 剧本数据（只读）
- `sessions` — 对话记录
- `endings` — 结局记录

## 迭代优先级
1. **Prompt 质量打磨** — 角色一致性 > 结局触发时机 > 策略区分度（核心体验，最高优先）
2. **等待体验优化** — 预加载、延迟策略（每轮3次 DeepSeek 调用，等待感强）
3. **真机适配与边界兜底** — 布局、白屏、异常兜底（上线硬门槛，与2并行）
4. **新增剧本内容** — 首发6个够用，先质量后扩量

## 注意事项
- DeepSeek API Key 在云函数环境变量中配置，禁止硬编码
- 剧本唯一真源是 `data/scenarios/*.json`
- `cloudfunctions/importScenarios/scenarios/` 是部署快照目录，只能由脚本生成
- `miniprogram/mock/scenarios/*.js` 是脚本生成的开发兜底，不要手工维护
- 云函数改动后需提醒用户在微信开发者工具中手动重新部署
- 详细链路见 `SCENARIO_SYNC_DESIGN.md`
