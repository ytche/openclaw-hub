# Coding Agent 质量标准

> 代码质量底线，所有 coding Agent 的产出必须满足。

---

## 一、可读性

### 命名

- 变量/函数名见名知意，禁止拼音、缩写（除非业界通用）
- 函数名体现动作：`getXxx`、`processXxx`、`validateXxx`
- 布尔变量用 `isXxx`、`hasXxx`、`canXxx`

### 长度

- 函数不超过 50 行（不含注释和空行）
- 文件不超过 500 行（超出考虑拆分）
- 类不超过 20 个方法

### 注释

- 复杂逻辑必须注释"为什么"，而非"做什么"
- 公共 API 必须文档注释（docstring/JSDoc/GoDoc）
- 禁止注释掉的代码（用 git 历史找回）

---

## 二、测试

### 覆盖率底线

- 核心业务逻辑：≥ 80%
- 工具函数：≥ 60%
- 配置/常量：可选

### 测试类型

| 类型 | 范围 | 触发时机 |
|---|---|---|
| 单元测试 | 单个函数/类 | 每次 commit |
| 集成测试 | 模块间交互 | 提交 PR 前 |
| 端到端测试 | 完整用户流程 | 重大版本发布前 |

### 测试原则

- 一个测试只验证一个概念
- 测试名描述场景：`test_should_return_error_when_input_invalid`
- 使用 fake/mock 隔离外部依赖
- 测试也要好读，和生产代码同等重视

---

## 三、安全性

### 禁止项

- [ ] 硬编码密码、API Key、Token
- [ ] SQL 拼接（必须使用参数化查询）
- [ ] 前端直接暴露密钥
- [ ] 不验证用户输入
- [ ] 不处理敏感数据的日志打印

### 检查清单

提交前执行：

```bash
# 检查敏感信息
grep -riE 'password|secret|key|token|credential' . --exclude-dir=.git --exclude-dir=node_modules

# 检查调试代码
grep -riE 'console\.log|debugger|TODO|FIXME|HACK' . --exclude-dir=.git
```

---

## 四、性能

### 注意点

- 循环内避免重复计算
- I/O 操作批量处理
- 大数据量考虑分页/流式处理
- 外部调用加超时和重试

### 测量

- 改动前后对比基准测试
- 不猜，profile 后再优化

---

## 五、文档

### 必须更新的文档

| 改动类型 | 需更新文档 |
|---|---|
| 新增 API | API 文档、使用示例 |
| 修改配置 | 配置说明、迁移指南 |
| 变更接口 | 变更日志、兼容性说明 |
| 重构 | 架构文档（如影响） |

---

*继承自 standards/common/WORKFLOW.md*  
*适用于所有 coding 类 Agent*
