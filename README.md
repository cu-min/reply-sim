# 如果这样回 · 微信小程序 MVP

《如果这样回》是一款情感模拟娱乐产品，不是实时聊天辅助工具。当前仓库已经收口为原生微信小程序本地 `mock` MVP，重点验证“选场景 → 模拟对话 → 进入结局 → 回看沉淀”这条完整体验链路。

## 当前完成
- 5 个核心页面已落地：`首页`、`剧本详情页`、`聊天页`、`结局页`、`我的页`
- 主链路已跑通：`首页 → 剧本详情 → 聊天页 → 结局页 → 我的`
- 聊天页当前是分层表达流程：先选策略，再选当前策略下候选回复，最后微调发送
- 结局页已改为连续内容流，重点表达关系结果和体验总结
- 本地 `mock` 数据、基础 `service` 分层、本地会话恢复和历史沉淀已具备

## 当前未接入
- 微信登录
- 云函数 / 云数据库
- 云端同步
- 真实模型接口
- 真实分享能力
- 支付与心动值真实消耗

## 目录结构
```text
.
├─ data/
│  ├─ scenario.schema.json
│  └─ scenarios/
├─ miniprogram/
│  ├─ assets/
│  ├─ components/
│  ├─ mock/
│  ├─ pages/
│  ├─ services/
│  ├─ styles/
│  └─ utils/
├─ PROJECT_CHECKLIST.md
├─ README.md
└─ project.config.json
```

### 目录职责
- `data/scenarios/`：首批剧本标准 JSON 数据，一剧本一个文件
- `data/scenario.schema.json`：剧本标准数据结构模板
- `miniprogram/pages/`：页面层
- `miniprogram/components/`：基础展示组件
- `miniprogram/services/`：页面与数据源之间的服务层
- `miniprogram/mock/`：当前本地运行使用的 mock 适配层
- `miniprogram/styles/`：全局设计 token 与公共样式
- `miniprogram/utils/`：本地缓存等工具函数

## 本地运行
1. 使用微信开发者工具打开仓库根目录。
2. `project.config.json` 中的 `miniprogramRoot` 已指向 `miniprogram/`。
3. 直接编译即可查看当前 MVP。

## 开发约定
- 当前运行基线以微信开发者工具可直接编译的 `JS / WXML / WXSS / JSON` 文件为准
- 根目录 `data/scenarios/` 是标准剧本源数据，后续真实模型和云端结构都以它为基础演进
- `project.private.config.json` 视为本地私有配置，不进入版本库

## 提交规范
- `feat:` 新功能或完整模块能力
- `fix:` 问题修复或兼容性修正
- `chore:` 工程整理、依赖、结构清理、文档维护

## 项目清单
- 详细清单见 [PROJECT_CHECKLIST.md](./PROJECT_CHECKLIST.md)
