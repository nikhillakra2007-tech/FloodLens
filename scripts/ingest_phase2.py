"""Ingest Phase 2 expanded Chennai datasets and compute deterministic features.

Usage:
    python scripts/ingest_phase2.py [--data-dir data/raw]
"""

import argparse
import json
import logging
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.core.database import SessionLocal
from app.services.ingestion.phase2_ingestion import run_phase2_ingestion

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Ingest Chennai Phase 2 expanded datasets")
    parser.add_argument("--data-dir", default="data/raw", help="Directory containing raw CSV files")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    if not data_dir.is_absolute():
        data_dir = Path(__file__).resolve().parent.parent / data_dir

    if not data_dir.exists():
        logger.error("Data directory not found: %s", data_dir)
        sys.exit(1)

    db = SessionLocal()
    try:
        manifest = run_phase2_ingestion(db, data_dir)
        print(json.dumps(manifest, indent=2))
        logger.info("Phase 2 data ingestion successfully executed.")
    except Exception as e:
        logger.error("Phase 2 ingestion failed: %s", e, exc_info=True)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
