import os
from datetime import datetime
from dotenv import load_dotenv
from repo_shared import format_timestamp

load_dotenv()


def run_pipeline() -> None:
    env = os.getenv("PYTHON_ENV", "development")
    output_path = os.getenv("DATA_OUTPUT_PATH", "./data/output")
    
    print(f"Starting data pipeline in {env} environment")
    print(f"Output path: {output_path}")
    print(f"Timestamp: {format_timestamp(datetime.now())}")
    
    print("Pipeline execution completed successfully")


if __name__ == "__main__":
    run_pipeline()
