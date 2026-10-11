"""Ingest Chennai drainage and flood data.

Usage:
    python scripts/ingest_chennai.py [--data-dir data/raw]

Reads CSV files from data/raw and ingests them into PostgreSQL/PostGIS.
"""

import argparse
import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.workers.ingestion_worker import run_ingestion

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Ingest Chennai flood data")
    parser.add_argument("--data-dir", default="data/raw", help="Directory containing raw CSV files")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    if not data_dir.exists():
        logger.error("Data directory not found: %s", data_dir)
        sys.exit(1)

    reports = run_ingestion(data_dir)

    total_valid = sum(r.valid_records for r in reports)
    total_invalid = sum(r.invalid_records for r in reports)
    total_errors = sum(len(r.errors) for r in reports)

    summary = {
        "files_processed": len(reports),
        "total_valid_records": total_valid,
        "total_invalid_records": total_invalid,
        "total_errors": total_errors,
        "reports": [
            {
                "source": r.source_name,
                "status": r.status,
                "valid": r.valid_records,
                "invalid": r.invalid_records,
                "errors": r.errors[:10],
            }
            for r in reports
        ],
    }

    print(json.dumps(summary, indent=2))

    if total_invalid > 0:
        logger.warning("%d records quarantined", total_invalid)


if __name__ == "__main__":
    main()
