# Coding Agent Git 规范

> 代码类 Agent 的 Git 工作流规范。

---

## 一、分支策略

### 分支命名

```
feature/<功能名>      # 新功能
type:fix/<问题描述>     # Bug 修复
refactor/<范围>        # 重构
hotfix/<问题描述>      # 紧急修复（直接切自主分支）
docs/<文档名>          # 文档更新
```

### 主分支保护

- `master` / `main` 为默认分支，禁止直接推送
- 所有改动通过 feature 分支 + PR / merge request 合并
- 紧急修复走 `hotfix/` 分支，事后补 review

---

## 二、Commit 规范

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 列表

| Type | 含义 |
|---|---|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响逻辑） |
| `refactor` | 重构 |
| `test` | 测试相关 |
| `chore` | 构建/工具/依赖更新 |
| `perf` | 性能优化 |

### 示例

```
feat(auth): add OAuth2 login support

Implement OAuth2 flow for GitHub and Google providers.
- Add OAuth2 middleware
- Update user model with provider fields
- Add login/logout handlers

Closes #123
```

---

## 三、Worktree 使用

### 创建

```bash
# 基于当前 HEAD 创建新 worktree
git worktree add -b feature/xxx ../<repo-name>-feature-xxx

cd ../<repo-name>-feature-xxx
```

### 日常操作

```bash
# 在 worktree 内正常 git 操作
git add .
git commit -m "feat: xxx"

# 推送到远程
git push -u origin feature/xxx
```

### 清理

```bash
# 返回主仓库
cd ../<repo-name>

# 移除 worktree（会自动删除目录）
git worktree remove ../<repo-name>-feature-xxx

# 删除分支（如已合并）
git branch -d feature/xxx
```

---

## 四、PR/MR 规范

### 创建前检查

- [ ] 分支已推送到远程
- [ ] 测试全部通过
- [ ] 代码已 self-review
- [ ] 无敏感信息
- [ ] 相关文档已更新

### PR 描述模板

```markdown
## 变更内容
- 

## 测试情况
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动验证通过

## 影响范围
- 

## 关联 Issue
- Closes #
```

---

*继承自 standards/common/WORKFLOW.md*  
*适用于所有 coding 类 Agent*
