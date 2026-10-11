import logging
from pathlib import Path

from app.core.database import SessionLocal
from app.services.ingestion.pipeline import (
    ingest_drain_segments_from_csv,
    ingest_flood_observations_from_csv,
    ingest_places_from_csv,
    ingest_source_file,
    update_source_file_status,
)
from app.services.ingestion.validation import ValidationReport

logger = logging.getLogger(__name__)


def run_ingestion(data_dir: str | Path = "data/raw") -> list[ValidationReport]:
    data_dir = Path(data_dir)
    reports = []

    for csv_file in sorted(data_dir.glob("*.csv")):
        logger.info("Ingesting %s", csv_file)
        db = SessionLocal()
        try:
            source, source_file, report = ingest_source_file(
                db,
                csv_file,
                source_name=csv_file.stem,
            )
            if report.status == "duplicate":
                reports.append(report)
                continue

            if "places" in csv_file.stem.lower():
                ingest_places_from_csv(db, csv_file, source_file.id, report)
            elif "drain" in csv_file.stem.lower():
                ingest_drain_segments_from_csv(db, csv_file, source_file.id, report)
            elif "flood" in csv_file.stem.lower() or "observation" in csv_file.stem.lower():
                ingest_flood_observations_from_csv(db, csv_file, report)

            update_source_file_status(db, source_file.id, report)
            reports.append(report)
        except Exception as e:
            logger.error("Ingestion failed for %s: %s", csv_file, e)
            report = ValidationReport(source_name=csv_file.stem, errors=[str(e)])
            reports.append(report)
        finally:
            db.close()

    return reports
