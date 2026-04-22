# 通用工作流规范

## Superpowers 工作流（强制）

所有编码任务必须遵循 Superpowers 工作流：

1. **using-superpowers** — 先查 skill，禁止先动后想
2. **brainstorming** — 探索需求 → 澄清 → 方案 → 确认
3. **writing-plans** — 拆成 bite-sized 任务
4. **using-git-worktrees** — 用 git worktree 隔离工作空间
5. **subagent-driven-development / executing-plans** — 执行
6. **test-driven-development** — 红→绿→重构
7. **systematic-debugging** — 四阶段法（禁止猜测）
8. **verification-before-completion** — 验证通过才算完成
9. **requesting-code-review** — 两轮 review
10. **finishing-a-development-branch** — 收尾

## 关键规则

- Brainstorming is mandatory for new features
- TDD is mandatory: Red → Green → Refactor
- Systematic debugging for all bugs
- Verification before claiming done
- Git worktree for isolation, never work directly on main

## 优先级

1. 用户显式指令（AGENTS.md, 直接请求）
2. Superpowers skills
3. 默认系统行为
