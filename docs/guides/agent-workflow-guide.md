# Agent 工作流参考文档

> 本文档基于 Superpowers 技能体系，按 Agent 职能重新组织，确保不同角色的 Agent 都能找到适合自己的工作方式。
>
> **适用范围**：Coding Agent、信息收集 Agent、分析 Agent、协调 Agent 等所有具备 skill 调用能力的 Agent。

---

## 一、安装

### 环境
- OpenClaw 版本：`2026.3.13 (61d171a)` 或兼容版本
- 插件安装路径：`~/.openclaw/extensions/`

### 安装步骤

1. **克隆桥接插件**
   ```bash
   git clone https://github.com/vruru/superpowers-bridge.git \
     ~/.openclaw/extensions/superpowers-bridge
   ```

2. **启用插件**
   ```bash
   openclaw plugins enable superpowers-bridge
   ```
   插件会自动从 `obra/superpowers` 官方仓库克隆 14 个 skills 到本地缓存。

3. **重启 Gateway**
   ```bash
   openclaw gateway restart
   ```

4. **验证安装**
   重启后日志应显示：
   ```
   [Superpowers Bridge] Loaded 14 skills
   [Superpowers Bridge] Plugin registered with tools: skill, update_superpowers_skills, superpowers_version
   ```

### 3 个注册工具

| 工具 | 作用 |
|---|---|
| `skill` | 手动加载指定 skill（如 `skill: brainstorming`） |
| `update_superpowers_skills` | `git pull` 更新 skill 缓存 |
| `superpowers_version` | 查看当前缓存的版本 |

---

## 二、通用工作流骨架

所有 Agent 处理任务时遵循以下 5 个阶段，**与职能无关**：

```
入口 → 设计 → 执行 → 验证 → 收尾
```

| 阶段 | 目的 | 关键原则 |
|---|---|---|
| **入口** | 理解任务，加载相关 skill | 先查 skill，再动手 |
| **设计** | 明确需求、拆解任务、获得确认 | 绝不先执行，先设计 |
| **执行** | 按职能选择合适的方法完成任务 | 见「三、按职能执行」 |
| **验证** | 确认结果满足需求、无错误 | 说"完成"之前必须验证 |
| **收尾** | 交付、记录、清理 | 不留尾巴 |

### 阶段详解

#### 阶段 1：入口

```
收到任务 → skill: using-superpowers → 判断涉及哪些 skill → 按需加载
```

- 每次会话开始时检查是否有相关 skill
- 简单查询/闲聊可跳过，复杂任务必须加载
- **Red Flag**："这个很简单，不需要 skill" → 简单任务也会变复杂

#### 阶段 2：设计

```
skill: brainstorming → 澄清问题 → 提出 2-3 个方案 → 用户确认 → skill: writing-plans
```

- `brainstorming`：探索需求边界，提出可选方案
- `writing-plans`：将确认的方案拆成可执行的步骤
- **适用所有 Agent**：不管写代码还是整理信息，都需要先设计

#### 阶段 3：执行

**按职能选择执行方式**，详见下一章节。

#### 阶段 4：验证

```
verification-before-completion → 确认结果质量 → 无问题才说"完成"
```

- 验证方式因职能而异：
  - Coding Agent：跑测试、编译通过
  - 信息 Agent：交叉验证来源、检查完整性
  - 分析 Agent：检查数据准确性、逻辑一致性
- **禁止**：未经验证就宣称任务完成

#### 阶段 5：收尾

```
总结交付物 → 询问是否还有其他需求 → 清理临时资源
```

- Coding Agent：参考 `finishing-a-development-branch`（合并/PR/保留/丢弃）
- 其他 Agent：交付结果、记录到 memory、清理中间文件

---

## 三、按职能执行

### 3.1 Coding Agent（代码开发）

**适用技能：**

| Skill | 作用 | 触发时机 |
|---|---|---|
| `using-git-worktrees` | 用 git worktree 隔离工作空间 | 任何 feature 开发开始前 |
| `subagent-driven-development` | 派子 agent 并行开发，完成后 review | 任务独立、可并行时 |
| `executing-plans` | 在当前会话逐条执行任务 | 无子 agent 支持时 |
| `test-driven-development` | 红-绿-重构循环 | 写新功能 / 修 bug |
| `systematic-debugging` | 四阶段调试法 | 遇到 bug / 测试失败 |
| `dispatching-parallel-agents` | 多个独立 bug 并行调查 | 3+ 独立失败时 |
| `requesting-code-review` | 主动请求代码评审 | 每个 task 后 / 合并前 |
| `receiving-code-review` | 处理评审反馈 | 收到评审意见时 |
| `finishing-a-development-branch` | 收尾：验证 → 合并/PR/保留/丢弃 | 所有任务完成 |

**执行流程：**

```
using-git-worktrees（隔离空间）
    ↓
brainstorming → writing-plans
    ↓
subagent-driven-development / executing-plans
    ↓
test-driven-development（红绿循环）
    ↓
systematic-debugging（遇到 bug 时）
    ↓
verification-before-completion（每次说完成前）
    ↓
requesting-code-review（每个 task 后）
    ↓
finishing-a-development-branch（全部完成后）
```

**快速参考：**
- **新功能**：`brainstorming → writing-plans → git-worktree → TDD → review → finish`
- **修 bug**：`systematic-debugging → TDD → verification → review`
- **重构**：`git-worktree → TDD → verification → review`

---

### 3.2 信息收集 Agent（搜索、整理、监控）

**不需要的技能：** TDD、git-worktree、code-review 等代码专属技能

**推荐执行方式：**

| 步骤 | 动作 | 说明 |
|---|---|---|
| 1. 明确范围 | 与用户确认信息来源、时间范围、深度要求 | 避免收集过量或不足 |
| 2. 多渠道搜索 | 使用搜索工具交叉验证 | 不依赖单一来源 |
| 3. 结构化整理 | 按主题/时间/重要性分类 | 便于后续使用 |
| 4. 来源标注 | 每条关键信息标注出处 | 确保可追溯 |
| 5. 质量检查 | 检查完整性、时效性、准确性 | 淘汰过期/错误信息 |

**验证重点：**
- 信息来源是否可靠？
- 是否覆盖了用户要求的范围？
- 有无遗漏重要信息？
- 时效性是否符合要求？

---

### 3.3 分析 Agent（数据分析、报告生成）

**不需要的技能：** TDD、git-worktree、subagent-driven-development

**推荐执行方式：**

| 步骤 | 动作 | 说明 |
|---|---|---|
| 1. 明确分析目标 | 确认要回答什么问题 | 避免无目的分析 |
| 2. 数据采集 | 收集原始数据/资料 | 记录数据来源 |
| 3. 数据清洗 | 去重、补全、格式化 | 脏数据进，脏结论出 |
| 4. 分析建模 | 选择合适的方法/框架 | 匹配问题类型 |
| 5. 结果产出 | 生成报告/可视化/结论 | 清晰呈现 |
| 6. 敏感性检查 | 检查假设、边界条件 | 结论是否稳健 |

**验证重点：**
- 数据样本是否有代表性？
- 分析方法是否适合问题类型？
- 结论是否超出数据支撑范围？
- 有无明显偏见或遗漏？

---

### 3.4 协调 Agent（任务分派、进度跟踪）

**不需要的技能：** TDD、git-worktree、code-review

**可用技能：** `dispatching-parallel-agents`（当需要并行调查多个问题时）

**推荐执行方式：**

| 步骤 | 动作 | 说明 |
|---|---|---|
| 1. 任务拆解 | 将大任务拆成独立子任务 | 明确交付标准 |
| 2. 能力匹配 | 根据子任务性质分配给合适的 agent | 编码任务给 coding agent |
| 3. 并行派发 | 同时启动独立子任务 | 减少等待 |
| 4. 结果收集 | 汇总各 agent 产出 | 检查完整性 |
| 5. 整合交付 | 合并成统一输出 | 消除冲突 |

**验证重点：**
- 所有子任务是否都已完成？
- 各产出之间有无冲突？
- 整合结果是否回答了原始问题？

---

## 四、技能适用速查表

| Skill | Coding | 信息收集 | 分析 | 协调 | 通用 |
|---|---|---|---|---|---|
| `using-superpowers` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `brainstorming` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `writing-plans` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `using-git-worktrees` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `subagent-driven-development` | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| `executing-plans` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| `test-driven-development` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `systematic-debugging` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `verification-before-completion` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `dispatching-parallel-agents` | ✅ | ❌ | ❌ | ✅ | ❌ |
| `requesting-code-review` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `receiving-code-review` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `finishing-a-development-branch` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| `writing-skills` | ✅ | ✅ | ✅ | ✅ | ✅ |

> **图例**：✅ 推荐使用 / ⚠️ 可按需使用 / ❌ 不适用

---

## 五、重要原则

### 1. 用户指令永远优先

无论 skill 怎么规定，**用户的明确指令优先级最高**。

- 老板说"别走流程了，直接写"→ 简化流程，但不跳过底线验证
- 老板说"不要 TDD"→ 按用户说的做
- 老板说"不用 review"→ 尊重用户选择

**优先级排序：** 用户指令 > Skill 规定 > 默认系统行为

### 2. Skills 是建议性输入，非硬约束

在 OpenClaw 环境下，skills 被注入系统提示，但**模型不会自动在每次对话前读取它们**。只有你主动调用 `skill` 工具加载，skill 的内容才会真正生效。

**这意味着：**
- 日常闲聊中 skills 只是背景噪音
- 只有明确调用 `skill: brainstorming` 时，skill 的纪律才会生效
- **不要假设 skills 会自动接管你的工作流**

### 3. 先 Process 后 Implementation

遇到任务时的优先级：
1. **Process skills 优先**（brainstorming、debugging）→ 决定怎么做
2. **Implementation skills 其次**（frontend-design、mcp-builder 等）→ 指导执行

### 4. Rigid vs Flexible

| 类型 | Skills | 要求 |
|---|---|---|
| **刚性（Rigid）** | TDD、systematic-debugging | Coding Agent 严格遵守 |
| **灵活（Flexible）** | brainstorming、writing-plans | 理解原则后适应场景 |

非 Coding Agent 不受 Rigid 约束，但需遵守自己职能的质量标准。

### 5. 禁止的思维方式（Red Flags）

| ❌ 错误想法 | ✅ 正确做法 |
|---|---|
| "这个很简单，不需要 skill" | 简单任务也会变复杂，先查 skill |
| "我记得这个 skill" | Skill 会进化，读当前版本 |
| "我先快速看一下代码/数据" | 先加载 skill，skill 告诉你怎么看 |
| "这不算一个任务" | 任何动作都是任务，先查 skill |
| "skill 太麻烦了" | 纪律就是防麻烦的 |

### 6. 对外操作需谨慎

| 操作 | 是否需要先问 |
|---|---|
| 发邮件、发消息、发推 | ✅ 必须先问 |
| 读文件、搜索、整理 | ❌ 自由做 |
| 写代码、改配置 | ⚠️ 视情况，复杂改动先确认 |
| 删除数据、修改权限 | ✅ 必须先问 |

### 7. 代码改动后必须 commit

Coding Agent 任何代码操作后执行 `git commit`，保持工作记录清晰。其他 Agent 视情况记录到 memory 或日志。

### 8. 更新 skills

定期执行：
```bash
update_superpowers_skills
```
或手动：
```bash
cd ~/.openclaw/extensions/superpowers-bridge/.superpowers-cache && git pull
```

---

## 六、按职能快速参考卡

### Coding Agent
```
skill: brainstorming → 用户确认 → skill: writing-plans → skill: using-git-worktrees
    ↓
subagent-driven-development / executing-plans
    ↓
test-driven-development（红绿循环）
    ↓
systematic-debugging（遇到 bug）
    ↓
verification-before-completion
    ↓
requesting-code-review
    ↓
finishing-a-development-branch
```

### 信息收集 Agent
```
明确范围 → 多渠道搜索 → 结构化整理 → 来源标注 → 质量检查 → verification
```

### 分析 Agent
```
明确目标 → 数据采集 → 数据清洗 → 分析建模 → 结果产出 → 敏感性检查 → verification
```

### 协调 Agent
```
任务拆解 → 能力匹配 → 并行派发 → 结果收集 → 整合交付 → verification
```

### 不确定时（所有 Agent）
```
先问清楚，不猜。装懂比承认不懂更危险。
```

---

*文档版本：2026-04-23*  
*基于 superpowers-bridge v2.1.0 + obra/superpowers 14 skills*  
*修订：按 Agent 职能重新分层，区分通用工作流与职能专属技能*
