"""
新机器实例初始化脚本

用法:
    python3 init-instance.py <实例名>

示例:
    python3 init-instance.py laptop
"""

import sys
from pathlib import Path

HUB_ROOT = Path(__file__).parent.parent


def init_instance(instance_name: str):
    """初始化新实例目录结构"""
    instance_dir = HUB_ROOT / "instances" / instance_name

    if instance_dir.exists():
        print(f"⚠️  实例 '{instance_name}' 已存在")
        response = input("是否覆盖? (y/N): ")
        if response.lower() != 'y':
            print("已取消")
            return False

    # 创建目录结构
    platforms = [d.name for d in (HUB_ROOT / "adapters").iterdir() if d.is_dir()]

    for platform in platforms:
        platform_dir = instance_dir / platform / "agents"
        platform_dir.mkdir(parents=True, exist_ok=True)
        print(f"  📁 创建: instances/{instance_name}/{platform}/agents/")

    # 创建 .gitkeep
    (instance_dir / ".gitkeep").touch()

    print(f"\n✅ 实例 '{instance_name}' 初始化完成")
    print(f"\n下一步:")
    print(f"  1. 在 instances/{instance_name}/ 下创建各平台配置")
    print(f"  2. 运行: make sync-instance INSTANCE_NAME={instance_name}")
    return True


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 init-instance.py <实例名>")
        print("Example: python3 init-instance.py laptop")
        sys.exit(1)

    instance_name = sys.argv[1]
    success = init_instance(instance_name)
    sys.exit(0 if success else 1)
