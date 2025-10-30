import os
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime

from pipeline.main import run_pipeline


class TestPipeline:
    """Test cases for the data pipeline functionality."""

    @patch('pipeline.main.format_timestamp')
    @patch('pipeline.main.datetime')
    def test_run_pipeline_development_environment(self, mock_datetime, mock_format_timestamp, capsys):
        """Test pipeline execution in development environment."""
        # Setup mocks
        mock_now = MagicMock()
        mock_now.now.return_value = datetime(2023, 12, 1, 10, 30, 0)
        mock_datetime.now = mock_now.now
        mock_format_timestamp.return_value = "2023-12-01 10:30:00"
        
        # Clear environment variables
        if 'PYTHON_ENV' in os.environ:
            del os.environ['PYTHON_ENV']
        if 'DATA_OUTPUT_PATH' in os.environ:
            del os.environ['DATA_OUTPUT_PATH']
        
        # Run pipeline
        run_pipeline()
        
        # Capture output
        captured = capsys.readouterr()
        
        # Assertions
        assert "Starting data pipeline in development environment" in captured.out
        assert "Output path: ./data/output" in captured.out
        assert "Timestamp: 2023-12-01 10:30:00" in captured.out
        assert "Pipeline execution completed successfully" in captured.out
        
        # Verify mocks were called
        mock_format_timestamp.assert_called_once()

    @patch('pipeline.main.format_timestamp')
    @patch('pipeline.main.datetime')
    def test_run_pipeline_production_environment(self, mock_datetime, mock_format_timestamp, capsys):
        """Test pipeline execution in production environment."""
        # Setup mocks
        mock_now = MagicMock()
        mock_now.now.return_value = datetime(2023, 12, 1, 10, 30, 0)
        mock_datetime.now = mock_now.now
        mock_format_timestamp.return_value = "2023-12-01 10:30:00"
        
        # Set production environment
        os.environ['PYTHON_ENV'] = 'production'
        os.environ['DATA_OUTPUT_PATH'] = '/data/production/output'
        
        try:
            # Run pipeline
            run_pipeline()
            
            # Capture output
            captured = capsys.readouterr()
            
            # Assertions
            assert "Starting data pipeline in production environment" in captured.out
            assert "Output path: /data/production/output" in captured.out
            assert "Timestamp: 2023-12-01 10:30:00" in captured.out
            assert "Pipeline execution completed successfully" in captured.out
            
        finally:
            # Cleanup environment
            if 'PYTHON_ENV' in os.environ:
                del os.environ['PYTHON_ENV']
            if 'DATA_OUTPUT_PATH' in os.environ:
                del os.environ['DATA_OUTPUT_PATH']

    def test_format_timestamp_integration(self, capsys):
        """Test pipeline with real format_timestamp function."""
        # Clear environment variables
        if 'PYTHON_ENV' in os.environ:
            del os.environ['PYTHON_ENV']
        if 'DATA_OUTPUT_PATH' in os.environ:
            del os.environ['DATA_OUTPUT_PATH']
        
        # Run pipeline with real function
        run_pipeline()
        
        # Capture output
        captured = capsys.readouterr()
        
        # Assertions
        assert "Starting data pipeline in development environment" in captured.out
        assert "Output path: ./data/output" in captured.out
        assert "Timestamp:" in captured.out
        assert "Pipeline execution completed successfully" in captured.out