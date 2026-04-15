# 云数据库集合设计

## users
- `openid`: string，主键
- `nickname`: string，默认 `"匿名旅人"`
- `avatar`: string，默认空字符串
- `hearts`: number，默认 `5`
- `created_at`: timestamp

## scenarios
- `id`: string，例如 `scenario_ex_midnight`
- `title`: string
- `category`: string
- `cover`: object
  - `opening_message`: string
  - `tags`: string[]
  - `subtitle`: string
- `character`: object
  - `name`: string
  - `gender`: string
  - `age`: number
  - `personality`: string
  - `speaking_style`: string
  - `attitude_to_relationship`: string
  - `initial_mood`: string
  - `initial_favorability`: number
- `background`: string
- `ending_triggers`: object
- `possible_endings`: array

## sessions
- `_id`: auto
- `openid`: string
- `scenario_id`: string
- `messages`: array
  - `role`: string
  - `name`: string，可选
  - `content`: string
  - `timestamp`: number
- `current_mood`: string
- `current_favorability`: number
- `status`: string，`ongoing` 或 `ended`
- `created_at`: timestamp
- `updated_at`: timestamp

## endings
- `_id`: auto
- `openid`: string
- `scenario_id`: string
- `session_id`: string
- `ending_type`: string
- `ending_text`: object
  - `relationship_result`: string
  - `key_behavior_feedback`: string
  - `missed_branch_hint`: string
  - `literary_closing`: string
- `created_at`: timestamp
