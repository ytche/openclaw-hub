"""
openclaw-hub 统一格式验证脚本
"""

import sys
import yaml
from pathlib import Path

# 添加 lib 到路径
sys.path.insert(0, str(Path(__file__).parent / "lib"))
from config import HUB_ROOT, list_agents, load_yaml


def validate_schema_file(path: Path, schema_name: str) -> list:
    """验证单个 schema 文件是否有效 YAML"""
    errors = []
    try:
        content = load_yaml(path)
        if content is None:
            errors.append(f"❌ {schema_name}: 文件为空或解析失败")
    except yaml.YAMLError as e:
        errors.append(f"❌ {schema_name}: YAML 解析错误 - {e}")
    except Exception as e:
        errors.append(f"❌ {schema_name}: 未知错误 - {e}")
    return errors


def validate_agent_config(agent_name: str) -> list:
    """验证 Agent 配置"""
    errors = []
    agent_dir = HUB_ROOT / "standards" / "agents" / agent_name

    # 检查必需文件
    required_files = ["agent.yaml", "soul.md"]
    for req_file in required_files:
        file_path = agent_dir / req_file
        if not file_path.exists():
            errors.append(f"❌ [{agent_name}] 缺少必需文件: {req_file}")

    # 验证 agent.yaml
    agent_yaml = agent_dir / "agent.yaml"
    if agent_yaml.exists():
        try:
            config = load_yaml(agent_yaml)
            if config:
                # 检查必需字段
                for field in ["name", "creature", "emoji"]:
                    if field not in config:
                        errors.append(f"❌ [{agent_name}] agent.yaml 缺少字段: {field}")
        except Exception as e:
            errors.append(f"❌ [{agent_name}] agent.yaml 解析失败: {e}")

    return errors


def validate_all() -> bool:
    """验证所有配置"""
    print("🔍 开始验证 openclaw-hub 配置...\n")

    all_errors = []

    # 验证 schemas
    schemas_dir = HUB_ROOT / "standards" / "schemas"
    if schemas_dir.exists():
        print("📋 验证 schemas...")
        for schema_file in schemas_dir.glob("*.yaml"):
            errors = validate_schema_file(schema_file, schema_file.name)
            all_errors.extend(errors)
        if not any(s.name for s in schemas_dir.glob("*.yaml")):
            print("  ⚠️ 暂无 schema 文件")
        else:
            print("  ✅ schemas 验证通过" if not errors else f"  ❌ 发现 {len(errors)} 个问题")

    # 验证 agents
    agents = list_agents()
    if agents:
        print(f"\n🤖 验证 {len(agents)} 个 Agent...")
        for agent in agents:
            errors = validate_agent_config(agent)
            all_errors.extend(errors)
            if not errors:
                print(f"  ✅ [{agent}] 通过")
    else:
        print("\n⚠️ 暂无 Agent 配置")

    # 总结
    print(f"\n{'='*40}")
    if all_errors:
        print(f"❌ 验证失败，共 {len(all_errors)} 个问题:")
        for err in all_errors:
            print(f"  {err}")
        return False
    else:
        print("✅ 所有验证通过！")
        return True


if __name__ == "__main__":
    success = validate_all()
    sys.exit(0 if success else 1)
