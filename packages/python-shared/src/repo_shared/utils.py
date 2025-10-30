from datetime import datetime
from typing import Dict, Any


def format_timestamp(dt: datetime) -> str:
    return dt.isoformat()


def validate_config(config: Dict[str, Any]) -> bool:
    required_keys = ["environment", "version"]
    return all(key in config for key in required_keys)
