"""
openclaw-hub 部署脚本

将 instances/ 中生成的配置部署到本地 OpenClaw 实际运行目录。

用法:
    python3 deploy.py                          # 部署当前机器所有 Agent
    python3 deploy.py --agent liuyun           # 只部署 liuyun
    python3 deploy.py --dry-run                  # 预览变更，不实际执行
    python3 deploy.py --openclaw-root ~/.openclaw  # 指定 OpenClaw 根目录

部署映射（OpenClaw 平台）:
    instances/<机器>/openclaw/agents/<agent>/agent.md   → ~/.openclaw/workspace-<agent>/AGENTS.md
    instances/<机器>/openclaw/agents/<agent>/soul.md    → ~/.openclaw/workspace-<agent>/SOUL.md
    instances/<机器>/openclaw/agents/<agent>/user.md    → ~/.openclaw/workspace-<agent>/USER.md
    instances/<机器>/openclaw/agents/<agent>/identity.md → ~/.openclaw/workspace-<agent>/IDENTITY.md
"""

import sys
import argparse
import shutil
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "lib"))
from config import HUB_ROOT, list_agents, get_instance_agent_dir


def get_workspace_path(agent_name: str, openclaw_root: Path) -> Path:
    """获取 Agent 的 workspace 路径"""
    # 默认命名规则: workspace-<agent_name>
    return openclaw_root / f"workspace-{agent_name}"


def deploy_agent(agent_name: str, instance: str, platform: str, openclaw_root: Path, dry_run: bool) -> bool:
    """
    部署单个 Agent 的配置到 OpenClaw 目录
    """
    source_dir = get_instance_agent_dir(instance, platform, agent_name)
    if not source_dir.exists():
        print(f"  ⚠️  [{agent_name}] 实例配置不存在，跳过")
        return False

    workspace = get_workspace_path(agent_name, openclaw_root)

    # 映射表: 源文件 → 目标文件
    mappings = {
        "agent.md": workspace / "AGENTS.md",
        "soul.md": workspace / "SOUL.md",
        "user.md": workspace / "USER.md",
        "identity.md": workspace / "IDENTITY.md",
    }

    deployed = 0
    for src_name, dst_path in mappings.items():
        src_path = source_dir / src_name
        if not src_path.exists():
            continue

        if dry_run:
            print(f"  📋 [{agent_name}] {src_name} → {dst_path}")
            deployed += 1
            continue

        # 确保目标目录存在
        dst_path.parent.mkdir(parents=True, exist_ok=True)

        # 备份旧文件（如果存在且内容不同）
        if dst_path.exists():
            with open(src_path, 'r') as f1, open(dst_path, 'r') as f2:
                if f1.read() == f2.read():
                    continue  # 内容相同，跳过
            backup = dst_path.with_suffix(dst_path.suffix + ".bak")
            shutil.copy2(dst_path, backup)
            print(f"  💾 [{agent_name}] 备份旧文件: {backup}")

        shutil.copy2(src_path, dst_path)
        print(f"  ✅ [{agent_name}] 部署 {src_name}")
        deployed += 1

    if deployed == 0:
        print(f"  ⚠️  [{agent_name}] 无文件需要部署")
        return False

    return True


def main():
    parser = argparse.ArgumentParser(description="部署 openclaw-hub 配置到本地 OpenClaw")
    parser.add_argument("--agent", help="指定 Agent，如 liuyun")
    parser.add_argument("--instance", help="指定实例，默认使用 hostname")
    parser.add_argument("--platform", default="openclaw", help="指定平台，默认 openclaw")
    parser.add_argument("--openclaw-root", default="~/.openclaw", help="OpenClaw 根目录")
    parser.add_argument("--dry-run", action="store_true", help="预览变更，不实际执行")

    args = parser.parse_args()

    # 解析路径
    openclaw_root = Path(args.openclaw_root).expanduser().resolve()
    instance = args.instance or Path("/proc/sys/kernel/hostname").read_text().strip()

    print(f"🚀 部署 openclaw-hub 配置")
    print(f"   实例: {instance}")
    print(f"   平台: {args.platform}")
    print(f"   目标: {openclaw_root}")
    if args.dry_run:
        print(f"   模式: 🔍 预览（不实际写入）")
    print()

    agents = [args.agent] if args.agent else list_agents()
    if not agents:
        print("⚠️  没有可部署的 Agent")
        return False

    success = 0
    for agent in agents:
        if deploy_agent(agent, instance, args.platform, openclaw_root, args.dry_run):
            success += 1

    print(f"\n{'='*40}")
    print(f"部署完成: {success}/{len(agents)} 个 Agent")
    if args.dry_run:
        print("💡 去掉 --dry-run 以实际执行部署")
    return success == len(agents)


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
