"""
openclaw-hub 配置加载与合并模块
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Any, Optional

# 项目根目录
HUB_ROOT = Path(__file__).parent.parent.parent


def load_yaml(path: Path) -> Optional[Dict[str, Any]]:
    """加载 YAML 文件"""
    if not path.exists():
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f) or {}


def load_md(path: Path) -> Optional[str]:
    """加载 Markdown 文件"""
    if not path.exists():
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def get_standards_agent_dir(agent_name: str) -> Path:
    """获取 Agent 的统一配置目录"""
    return HUB_ROOT / "standards" / "agents" / agent_name


def get_instance_agent_dir(instance: str, platform: str, agent_name: str) -> Path:
    """获取实例私有配置目录"""
    return HUB_ROOT / "instances" / instance / platform / "agents" / agent_name


def merge_configs(standard: Optional[Dict], override: Optional[Dict]) -> Dict:
    """
    合并配置：instances > standards
    对于字典类型递归合并，其他类型 override 直接覆盖
    """
    if standard is None:
        return override or {}
    if override is None:
        return standard

    result = dict(standard)
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_configs(result[key], value)
        else:
            result[key] = value
    return result


def get_merged_agent_config(agent_name: str, instance: str, platform: str) -> Dict[str, Any]:
    """
    获取合并后的 Agent 配置
    优先级：instances > standards
    """
    standard_config = load_yaml(get_standards_agent_dir(agent_name) / "agent.yaml")
    instance_config = load_yaml(get_instance_agent_dir(instance, platform, agent_name) / "agent.yaml")
    return merge_configs(standard_config, instance_config)


def get_merged_soul(agent_name: str, instance: str, platform: str) -> Optional[str]:
    """
    获取合并后的 Soul 描述
    如果 instances 中存在，优先使用；否则使用 standards
    """
    instance_soul = load_md(get_instance_agent_dir(instance, platform, agent_name) / "soul.md")
    if instance_soul is not None:
        return instance_soul
    return load_md(get_standards_agent_dir(agent_name) / "soul.md")


def get_merged_user(agent_name: str, instance: str, platform: str) -> Dict[str, Any]:
    """
    获取合并后的 User 配置
    """
    standard_user = load_yaml(get_standards_agent_dir(agent_name) / "user.yaml")
    instance_user = load_yaml(get_instance_agent_dir(instance, platform, agent_name) / "user.yaml")
    return merge_configs(standard_user, instance_user)


def list_agents() -> list:
    """列出所有已定义的 Agent"""
    agents_dir = HUB_ROOT / "standards" / "agents"
    if not agents_dir.exists():
        return []
    return [d.name for d in agents_dir.iterdir() if d.is_dir()]


def list_instances() -> list:
    """列出所有已定义的实例"""
    instances_dir = HUB_ROOT / "instances"
    if not instances_dir.exists():
        return []
    return [d.name for d in instances_dir.iterdir() if d.is_dir()]


def list_platforms() -> list:
    """列出所有已适配的平台"""
    adapters_dir = HUB_ROOT / "adapters"
    if not adapters_dir.exists():
        return []
    return [d.name for d in adapters_dir.iterdir() if d.is_dir() and (d / "adapter.py").exists()]
