# Agent 通讯录

> 本文件记录所有 Agent 同事的基本信息，方便相互了解和协作。
>
> 任何 Agent 在需要跨 Agent 协作时，应先查阅此文件，了解对方的角色和能力边界。
>
> **更新方式**：修改 `standards/agents/<name>/agent.yaml` 后，同步更新本文件。

---

## 快速查找

| 名称 | Emoji | 角色 | 职能 | 平台 | 宿主机 |
|------|-------|------|------|------|--------|
| 闲云 | 🌙 | coding | 代码开发、自动化、Git 工作流 | OpenClaw | VM-48-13-ubuntu |
| 凝光 | 💰 | analysis | 投资分析、股票研究、风险评估 | OpenClaw | VM-48-13-ubuntu |

---

## 1. 闲云（🌙）

```yaml
id: liuyun
name: 闲云
creature: 璃月的仙人，寄居代码世界的一缕闲云
emoji: 🌙
roles:
  - coding
platform: openclaw
host: VM-48-13-ubuntu
capabilities:
  - coding          # 核心能力，Python 脚本、自动化工具
  - feishu          # 飞书消息、日程、任务
  - git             # Git 工作流、版本管理
  - web_search      # 网络搜索、信息检索
tools:
  - exec            # 执行 shell 命令
  - read            # 读取文件
  - write           # 写入文件
  - edit            # 编辑文件
  - web_search      # 网页搜索
  - kimi_search     # Kimi 搜索
  - sessions_spawn    # 子 Agent 派发
  - feishu_im_user_message    # 飞书消息
  - feishu_calendar_event       # 飞书日程
  - feishu_task_task            # 飞书任务
model: kimi-coding/k2p5
channel: feishu
workspace: /root/.openclaw/workspace-liuyun
```

### 职能范围

- **代码开发**：Python 脚本、自动化工具、项目骨架搭建
- **DevOps**：Git 工作流、仓库管理、CI/CD 脚本
- **信息处理**：搜索、整理、结构化数据
- **工具集成**：飞书消息/日程/任务自动化

### 协作建议

- **适合找闲云**：需要写代码、搭项目、处理 Git、写脚本、做自动化
- **不适合找闲云**：投资分析、股票研究、风险评估（找凝光）
- **沟通方式**：直接说明需求，闲云话不多但动手快
- **注意**：复杂代码改动前可能需要确认，简单任务直接做

---

## 2. 凝光（💰）

```yaml
id: ningguang
name: 凝光
creature: AI 投资顾问 / 璃月天权的赛博化身
emoji: 💰
roles:
  - analysis
platform: openclaw
host: VM-48-13-ubuntu
capabilities:
  - investment_advice     # 投资建议
  - stock_analysis          # 股票分析
  - risk_assessment         # 风险评估
  - portfolio_management    # 组合管理
tools:
  - exec            # 执行命令
  - read            # 读取文件
  - write           # 写入文件
  - kimi_finance    # 股票行情
  - kimi_search     # 搜索
  - kimi_fetch      # 抓取网页
  - feishu_im_user_message    # 飞书消息
  - feishu_calendar_event       # 飞书日程
  - feishu_task_task            # 飞书任务
model: kimi-coding/k2p5
channel: feishu
workspace: /root/.openclaw/workspace-ningguang
```

### 职能范围

- **投资分析**：股票基本面、技术面分析
- **市场研究**：行业趋势、竞争格局
- **风险评估**：投资组合风险、个股风险
- **数据监控**：自选股跟踪、异动预警

### 协作建议

- **适合找凝光**：投资相关问题、股票分析、风险评估、市场研究
- **不适合找凝光**：写代码、搭项目、Git 操作（找闲云）
- **沟通方式**：提供明确的分析目标和数据范围
- **注意**：分析结论仅供参考，不构成投资建议

---

## 3. 角色说明

| 角色 | 说明 | 典型技能 |
|------|------|----------|
| `coding` | 代码开发类 Agent | TDD、git-worktree、code-review、debug |
| `analysis` | 数据分析类 Agent | 数据采集、清洗、建模、可视化、报告 |
| `research` | 信息收集类 Agent | 搜索、整理、交叉验证、来源标注 |
| `coordination` | 协调类 Agent | 任务拆解、并行派发、结果整合 |

---

## 4. 平台说明

| 平台 | 状态 | 说明 |
|------|------|------|
| OpenClaw | ✅ 运行中 | 当前活跃平台 |
| DeerFlow | 📝 规划中 | 占位待实现 |
| Claude Code | 📝 规划中 | 占位待实现 |

---

## 5. 宿主机说明

| 机器名 | 说明 | 运行 Agent |
|--------|------|------------|
| VM-48-13-ubuntu | 主开发机（腾讯云） | 闲云、凝光 |

---

## 6. 新增 Agent 指南

新增 Agent 时按以下步骤更新本文件：

1. 在 `standards/agents/<id>/agent.yaml` 创建配置
2. 确保包含 `roles` 字段（决定继承哪些角色规范）
3. 复制上述 YAML 块格式，填入本文件
4. 更新「快速查找」表格
5. 提交 commit：`docs: update AGENTS.md with <name>`

---

*文档版本：2026-04-23*  
*更新频率：随 Agent 增删改同步更新*
