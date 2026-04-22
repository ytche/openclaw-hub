# Coding Agent 工作流规范

> 本规范适用于所有代码类 Agent，包括前端、后端、运维脚本、自动化工具等。
>
> 继承自 `standards/common/WORKFLOW.md` 的通用 5 阶段骨架，此处补充代码开发专属规则。

---

## 一、通用骨架回顾

所有 Agent 遵循：

```
入口 → 设计 → 执行 → 验证 → 收尾
```

本文件只覆盖 **执行** 和 **验证** 阶段的代码专属规则。

---

## 二、执行阶段

### 2.1 工作空间隔离

任何 feature/bugfix/refactor 开始前，必须使用 git worktree 隔离工作空间：

```bash
# 创建独立工作目录
git worktree add -b feature/xxx ../openclaw-hub-feature-xxx

# 完成后清理
git worktree remove ../openclaw-hub-feature-xxx
git branch -d feature/xxx
```

**禁止**：直接在主分支工作目录上修改代码。

### 2.2 执行模式选择

| 场景 | 推荐模式 | 说明 |
|---|---|---|
| 任务独立、可并行 | `subagent-driven-development` | 每个子任务派一个子 agent |
| 任务串行、强依赖 | `executing-plans` | 当前会话逐条执行 |
| 无子 agent 支持 | `executing-plans` | 唯一选择 |

### 2.3 开发纪律

#### TDD 循环（红-绿-重构）

```
1. 写失败测试（红）
2. 写最小代码通过测试（绿）
3. 重构，保持测试通过
```

**适用场景**：新功能、bugfix、重构  
**例外**：纯配置修改、文档更新、删除废弃代码

#### Systematic Debugging

遇到 bug 时按四阶段处理：

| 阶段 | 动作 | 禁止 |
|---|---|---|
| 1. 找根因 | 定位最小复现步骤 | 凭感觉猜测 |
| 2. 分析模式 | 检查类似问题是否普遍存在 | 只看表面 |
| 3. 假设验证 | 用测试/日志验证假设 | 直接改代码试错 |
| 4. 实施修复 | 修复 + 补充测试 | 修完不验证 |

#### 并行调查

当同时存在 3+ 独立失败时，使用 `dispatching-parallel-agents` 并行调查，而非串行。

---

## 三、验证阶段

### 3.1 底线验证清单

说"完成"之前必须确认：

- [ ] 编译通过 / 无语法错误
- [ ] 测试通过（至少新增/修改的测试）
- [ ] 代码风格符合项目规范
- [ ] 无敏感信息泄露（密码、key、token）
- [ ] 相关文档已更新（如有变更）

### 3.2 Code Review

每个 task 完成后主动请求 review：

```
requesting-code-review → 收到反馈 → receiving-code-review → 修改 → 再次验证
```

Review 检查点：
- 逻辑正确性
- 边界条件处理
- 性能影响
- 安全性
- 可读性/可维护性

---

## 四、收尾阶段

### 4.1 分支收尾选项

任务完成后给出 4 个选项：

1. **Merge back to `<base-branch>` locally** — 本地合并
2. **Push and create a Pull Request** — 推送到远程并创建 PR（推荐）
3. **Keep the branch as-is** — 保留分支，稍后处理
4. **Discard this work** — 丢弃修改

### 4.2 清理清单

- [ ] git commit（任何代码改动后必须 commit）
- [ ] 删除 worktree
- [ ] 清理临时文件/调试代码
- [ ] 更新相关文档/memory

---

## 五、快速参考

| 场景 | 调用链 |
|---|---|
| 新功能 | `brainstorming → writing-plans → git-worktree → TDD → verification → review → finish` |
| 修 bug | `systematic-debugging → TDD → verification → review` |
| 重构 | `git-worktree → TDD → verification → review` |
| 纯配置/文档 | `executing-plans → verification` |

---

*继承自 standards/common/WORKFLOW.md*  
*适用于所有 coding 类 Agent*
