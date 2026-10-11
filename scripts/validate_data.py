"""Validate ingested data quality.

Usage:
    python scripts/validate_data.py
"""

import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from sqlalchemy import text
from app.core.database import SessionLocal
from app.services.ingestion.validation import (
    validate_coordinates,
    validate_fraction,
    validate_non_negative,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    db = SessionLocal()
    issues = []

    try:
        result = db.execute(text("SELECT id, name, geom FROM places WHERE geom IS NULL OR ST_IsEmpty(geom)"))
        for row in result:
            issues.append(f"Place {row[1]} (id={row[0]}) has missing or empty geometry")

        result = db.execute(text("""
            SELECT id, name, ST_X(geom) as lon, ST_Y(geom) as lat FROM places
            WHERE ST_X(geom) < -180 OR ST_X(geom) > 180 OR ST_Y(geom) < -90 OR ST_Y(geom) > 90
        """))
        for row in result:
            issues.append(f"Place {row[1]} has invalid coordinates: ({row[2]}, {row[3]})")

        result = db.execute(text("""
            SELECT id, depth_m, width_m, length_m FROM drain_segments
            WHERE depth_m < 0 OR width_m < 0 OR length_m < 0
        """))
        for row in result:
            issues.append(f"Drain segment {row[0]} has negative dimensions")

        result = db.execute(text("""
            SELECT id, builtup_fraction, vegetation_fraction, water_fraction FROM landcover_features
            WHERE builtup_fraction < 0 OR builtup_fraction > 1
               OR vegetation_fraction < 0 OR vegetation_fraction > 1
               OR water_fraction < 0 OR water_fraction > 1
        """))
        for row in result:
            issues.append(f"Landcover feature {row[0]} has invalid fraction values")

        result = db.execute(text("""
            SELECT id, rainfall_mm FROM rainfall_observations WHERE rainfall_mm < 0
        """))
        for row in result:
            issues.append(f"Rainfall observation {row[0]} has negative rainfall")

        result = db.execute(text("""
            SELECT id, sha256, validation_status FROM source_files WHERE validation_status = 'quarantined'
        """))
        for row in result:
            issues.append(f"Source file {row[0]} is quarantined (sha256={row[1][:16]}...)")

    finally:
        db.close()

    report = {
        "total_issues": len(issues),
        "issues": issues,
        "status": "valid" if not issues else "issues_found",
    }

    print(json.dumps(report, indent=2))

    if issues:
        sys.exit(1)


if __name__ == "__main__":
    main()
