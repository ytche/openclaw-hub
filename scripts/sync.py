"""
openclaw-hub 核心同步脚本

用法:
    python3 sync.py                          # 同步所有平台所有实例
    python3 sync.py --platform openclaw      # 只同步 OpenClaw
    python3 sync.py --instance laptop        # 只同步 laptop 实例
    python3 sync.py --agent liuyun           # 只同步 liuyun agent
"""

import sys
import argparse
from pathlib import Path

# 添加 lib 到路径
sys.path.insert(0, str(Path(__file__).parent / "lib"))
from config import (
    HUB_ROOT, list_agents, list_instances, list_platforms,
    get_merged_agent_config, get_merged_soul, get_merged_user,
    get_instance_agent_dir
)


def run_adapter(platform: str, instance: str, agent: str) -> bool:
    """
    运行指定平台的适配器，生成实例配置
    """
    adapter_path = HUB_ROOT / "adapters" / platform / "adapter.py"
    if not adapter_path.exists():
        print(f"⚠️  [{platform}] 适配器不存在，跳过")
        return False

    # 动态导入适配器
    import importlib.util
    spec = importlib.util.spec_from_file_location(f"{platform}_adapter", adapter_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    if not hasattr(module, 'adapt'):
        print(f"❌  [{platform}] 适配器缺少 adapt() 函数")
        return False

    # 获取合并后的配置
    agent_config = get_merged_agent_config(agent, instance, platform)
    soul_content = get_merged_soul(agent, instance, platform)
    user_config = get_merged_user(agent, instance, platform)

    # 确定输出目录
    output_dir = get_instance_agent_dir(instance, platform, agent)
    output_dir.mkdir(parents=True, exist_ok=True)

    # 调用适配器
    try:
        module.adapt(
            agent_name=agent,
            agent_config=agent_config,
            soul_content=soul_content,
            user_config=user_config,
            output_dir=output_dir,
            hub_root=HUB_ROOT
        )
        print(f"  ✅ [{platform}/{instance}/{agent}] 同步完成")
        return True
    except Exception as e:
        print(f"  ❌ [{platform}/{instance}/{agent}] 同步失败: {e}")
        return False


def sync_all(args) -> bool:
    """同步所有内容"""
    platforms = [args.platform] if args.platform else list_platforms()
    instances = [args.instance] if args.instance else list_instances()
    agents = [args.agent] if args.agent else list_agents()

    if not platforms:
        print("⚠️  没有可用的平台适配器")
        return False
    if not agents:
        print("⚠️  没有定义 Agent")
        return False

    total = 0
    success = 0

    for platform in platforms:
        print(f"\n🔄 平台: {platform}")
        target_instances = instances if instances else ["default"]

        for instance in target_instances:
            # 如果实例目录不存在，跳过
            instance_dir = HUB_ROOT / "instances" / instance
            if not instance_dir.exists() and instance != "default":
                print(f"  ⚠️ 实例 '{instance}' 不存在，跳过")
                continue

            for agent in agents:
                total += 1
                if run_adapter(platform, instance, agent):
                    success += 1

    print(f"\n{'='*40}")
    print(f"同步完成: {success}/{total} 成功")
    return success == total


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="openclaw-hub 同步脚本")
    parser.add_argument("--platform", help="指定平台，如 openclaw")
    parser.add_argument("--instance", help="指定实例，如 laptop")
    parser.add_argument("--agent", help="指定 Agent，如 liuyun")

    args = parser.parse_args()
    success = sync_all(args)
    sys.exit(0 if success else 1)
