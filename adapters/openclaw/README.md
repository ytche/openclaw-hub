# OpenClaw 适配器

将统一格式配置转换为 OpenClaw 平台所需的文件。

## 生成的文件

| 统一格式源文件 | 生成目标 | 说明 |
|---|---|---|
| `standards/agents/<name>/agent.yaml` | `instances/<机器>/openclaw/agents/<name>/agent.md` | Agent 配置 |
| `standards/agents/<name>/soul.md` | `instances/<机器>/openclaw/agents/<name>/soul.md` | Soul 描述 |
| `standards/agents/<name>/user.yaml` | `instances/<机器>/openclaw/agents/<name>/user.md` | User 配置 |
| `standards/agents/<name>/agent.yaml` | `instances/<机器>/openclaw/agents/<name>/identity.md` | Identity（OpenClaw 特有） |

## 合并规则

1. 如果 `instances/<机器>/openclaw/agents/<name>/` 下已存在同名文件且**没有** `AUTO-GENERATED` 标记，则保留手工文件，不覆盖
2. 如果存在 `AUTO-GENERATED` 标记，则重新生成
3. instances 中的 `agent.yaml`（如果存在）会与 standards 合并，合并结果用于生成

## 扩展

如需自定义生成逻辑，修改 `adapter.py` 中的 `adapt()` 函数。
