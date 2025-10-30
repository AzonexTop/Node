import pytest
from datetime import datetime, timezone, timedelta
from repo_shared.utils import format_timestamp, validate_config


class TestFormatTimestamp:
    """Test cases for the format_timestamp function."""

    def test_format_timestamp_utc(self):
        """Test formatting a UTC datetime."""
        dt = datetime(2023, 12, 1, 10, 30, 0, tzinfo=timezone.utc)
        result = format_timestamp(dt)
        assert result == "2023-12-01T10:30:00+00:00"

    def test_format_timestamp_with_timezone(self):
        """Test formatting a datetime with timezone offset."""
        tz = timezone(timedelta(hours=-5))  # EST
        dt = datetime(2023, 12, 1, 10, 30, 0, tzinfo=tz)
        result = format_timestamp(dt)
        assert result == "2023-12-01T10:30:00-05:00"

    def test_format_timestamp_naive(self):
        """Test formatting a naive datetime (no timezone)."""
        dt = datetime(2023, 12, 1, 10, 30, 0)
        result = format_timestamp(dt)
        assert result == "2023-12-01T10:30:00"

    def test_format_timestamp_with_microseconds(self):
        """Test formatting a datetime with microseconds."""
        dt = datetime(2023, 12, 1, 10, 30, 0, 123456)
        result = format_timestamp(dt)
        assert result == "2023-12-01T10:30:00.123456"


class TestValidateConfig:
    """Test cases for the validate_config function."""

    def test_validate_config_valid(self):
        """Test validation of a valid configuration."""
        config = {
            "environment": "production",
            "version": "1.0.0",
            "debug": True,
            "timeout": 30
        }
        assert validate_config(config) is True

    def test_validate_config_missing_environment(self):
        """Test validation when environment key is missing."""
        config = {
            "version": "1.0.0",
            "debug": True
        }
        assert validate_config(config) is False

    def test_validate_config_missing_version(self):
        """Test validation when version key is missing."""
        config = {
            "environment": "production",
            "debug": True
        }
        assert validate_config(config) is False

    def test_validate_config_missing_both(self):
        """Test validation when both required keys are missing."""
        config = {
            "debug": True,
            "timeout": 30
        }
        assert validate_config(config) is False

    def test_validate_config_empty_dict(self):
        """Test validation of an empty configuration."""
        config = {}
        assert validate_config(config) is False

    def test_validate_config_only_required_keys(self):
        """Test validation with only required keys present."""
        config = {
            "environment": "development",
            "version": "0.1.0"
        }
        assert validate_config(config) is True

    def test_validate_config_none_values(self):
        """Test validation with None values for required keys."""
        config = {
            "environment": None,
            "version": "1.0.0"
        }
        assert validate_config(config) is True  # Function only checks for key existence

    def test_validate_config_empty_string_values(self):
        """Test validation with empty string values."""
        config = {
            "environment": "",
            "version": ""
        }
        assert validate_config(config) is True  # Function only checks for key existence