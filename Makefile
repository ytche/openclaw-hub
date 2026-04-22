# openclaw-hub Makefile

.PHONY: all validate sync sync-openclaw sync-instance init help

# 默认目标
all: validate sync

# 验证统一格式
validate:
	@echo "🔍 Validating unified formats..."
	@python3 scripts/validate.py

# 同步所有平台
sync: validate
	@echo "🔄 Syncing all platforms..."
	@python3 scripts/sync.py

# 同步特定平台
sync-openclaw:
	@echo "🔄 Syncing OpenClaw..."
	@python3 scripts/sync.py --platform openclaw

sync-deerflow:
	@echo "🔄 Syncing DeerFlow..."
	@echo "⚠️ DeerFlow adapter not yet implemented"

sync-claude-code:
	@echo "🔄 Syncing Claude Code..."
	@echo "⚠️ Claude Code adapter not yet implemented"

# 同步特定机器实例
sync-instance:
	@if [ -z "$(INSTANCE_NAME)" ]; then \
		echo "Usage: make sync-instance INSTANCE_NAME=<机器名>"; \
		exit 1; \
	fi
	@echo "🔄 Syncing instance: $(INSTANCE_NAME)"
	@python3 scripts/sync.py --instance $(INSTANCE_NAME)

# 部署到本地 OpenClaw
deploy:
	@echo "🚀 Deploying to local OpenClaw..."
	@python3 scripts/deploy.py

deploy-dry-run:
	@echo "🔍 Preview deployment..."
	@python3 scripts/deploy.py --dry-run

deploy-agent:
	@if [ -z "$(AGENT_NAME)" ]; then \
		echo "Usage: make deploy-agent AGENT_NAME=<agent名>"; \
		exit 1; \
	fi
	@echo "🚀 Deploying agent: $(AGENT_NAME)"
	@python3 scripts/deploy.py --agent $(AGENT_NAME)

# 新机器初始化
init:
	@if [ -z "$(INSTANCE_NAME)" ]; then \
		echo "Usage: make init INSTANCE_NAME=<机器名>"; \
		exit 1; \
	fi
	@echo "🏗️ Initializing new instance: $(INSTANCE_NAME)"
	@python3 scripts/init-instance.py $(INSTANCE_NAME)

# 帮助
help:
	@echo "openclaw-hub 命令列表:"
	@echo ""
	@echo "  make validate              验证统一格式"
	@echo "  make sync                  同步所有平台"
	@echo "  make sync-openclaw         同步 OpenClaw"
	@echo "  make sync-instance         同步特定机器实例 (需 INSTANCE_NAME=xxx)"
	@echo "  make deploy                部署到本地 OpenClaw"
	@echo "  make deploy-dry-run        预览部署变更"
	@echo "  make deploy-agent          部署特定 Agent (需 AGENT_NAME=xxx)"
	@echo "  make init                  初始化新机器 (需 INSTANCE_NAME=xxx)"
	@echo ""
	@echo "示例:"
	@echo "  make sync-instance INSTANCE_NAME=laptop"
	@echo "  make init INSTANCE_NAME=desktop"
