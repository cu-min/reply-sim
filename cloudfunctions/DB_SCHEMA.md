# 云数据库集合设计

当前项目采用单云环境发布，`develop / trial / release` 共用同一套云数据库集合。

## users
- `_id`: string，规范化主键，格式为 `user_${openid}`
- `openid`: string
- `nickname`: string，默认 `"匿名旅人"`
- `avatar`: string，默认空字符串
- `hearts`: number，默认 `5`
- `created_at`: timestamp
- `updated_at`: timestamp

## scenarios
- `_id`: auto
- `id`: string，例如 `ex-midnight`
- `title`: string
- `category`: string
- `cover`: object
  - `opening_message`: string
  - `subtitle`: string
  - `tags`: string[]
- `character`: object
  - `name`: string
  - `gender`: string
  - `age`: number
  - `occupation`: string
  - `relationship`: string
  - `archetype`: string
  - `personality`: string
  - `speaking_style`: string
  - `attitude_to_relationship`: string
  - `initial_mood`: string
  - `initial_favorability`: number
  - `current_attitude`: string
- `background`: string
- `scene_prompt`: string
- `ending_triggers`: object
- `possible_endings`: array

## sessions
- `_id`: auto
- `openid`: string
- `scenario_id`: string
- `messages`: array
  - `role`: string，`user` 或 `assistant`
  - `name`: string，可选
  - `content`: string
  - `timestamp`: number
  - `request_id`: string，可选
- `current_mood`: string
- `current_favorability`: number
- `first_turn_consumed`: boolean
- `first_turn_consumed_at`: timestamp | null
- `first_turn_request_id`: string
- `status`: string，`ongoing` 或 `ended`
- `created_at`: timestamp
- `updated_at`: timestamp

## endings
- `_id`: string，规范化主键，格式为 `ending_${session_id}_${openid}`
- `openid`: string
- `scenario_id`: string
- `session_id`: string
- `ending_id`: string
- `ending_type`: string
- `ending_label`: string
- `badge_label`: string
- `ending_text`: object
  - `relationship_result`: string
  - `key_behavior_feedback`: string
  - `missed_branch_hint`: string
  - `literary_closing`: string
- `created_at`: timestamp
- `updated_at`: timestamp

## message_requests
- `_id`: string，规范化主键，格式为 `msgreq_${session_id}_${request_id}`
- `session_id`: string
- `openid`: string
- `request_id`: string
- `user_message`: string
- `status`: string，`processing` 或 `completed`
- `lock_until_ms`: number
- `processing_attempts`: number
- `consumed_first_turn`: boolean
- `response`: object，可选，缓存 `chatEngine` 完成后的结果
- `created_at`: timestamp
- `updated_at`: timestamp
- `completed_at`: timestamp，可选

## feedbacks
- `_id`: auto
- `openid`: string
- `type`: string
- `content`: string
- `contact`: string
- `created_at`: timestamp

## 说明
- `chatEngine` 的幂等、防重试和首轮扣心流程依赖 `message_requests`，不是 `requests`
- 用户反馈由 `submitFeedback` 云函数写入 `feedbacks`
