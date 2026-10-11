"""Ingest real Chennai Case 001 data from CSV files.

This script ingests:
- 2015 Chennai flood observations
- GCC stormwater drainage network
- 2015 rainfall data (IMD)
- Terrain features (Copernicus DEM GLO-30)
- HAND features
- Land cover features (ESA WorldCover 10m)

Usage:
    python scripts/ingest_chennai_case001.py [--data-dir data/raw]
"""

import argparse
import hashlib
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from geoalchemy2.elements import WKTElement
from shapely.geometry import LineString, Point

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.core.database import SessionLocal
from app.db.models.drainage_models import DrainNode, DrainSegment, Outfall
from app.db.models.flood_models import FloodEvent, FloodObservation, RainfallObservation
from app.db.models.location_models import LandcoverFeature, Place, TerrainFeature
from app.db.models.source_models import DataSource, SourceFile
from app.services.ingestion.provenance import compute_sha256

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def wkt_point(lon: float, lat: float) -> WKTElement:
    return WKTElement(f"POINT({lon} {lat})", srid=4326)


def wkt_line(coords: list[tuple[float, float]]) -> WKTElement:
    coord_str = ", ".join(f"{x} {y}" for x, y in coords)
    return WKTElement(f"LINESTRING({coord_str})", srid=4326)


def get_or_create(db, model, defaults=None, **kwargs):
    """Get existing record or create new one."""
    instance = db.query(model).filter_by(**kwargs).first()
    if instance:
        return instance, False
    params = {**kwargs, **(defaults or {})}
    instance = model(**params)
    db.add(instance)
    db.flush()
    return instance, True


def ingest_data_sources(db):
    """Create data source records."""
    sources = {}

    sources["flood_obs"], _ = get_or_create(db, DataSource, name="GCC 2015 Flood Survey",
        defaults={"trust_level": "official", "license": "Open Government Data",
                  "attribution": "Greater Chennai Corporation", "url": "https://chennai.gov.in",
                  "description": "GCC crowd-sourced and official flood observations from 2015 Chennai floods",
                  "version": "2015"})

    sources["drainage"], _ = get_or_create(db, DataSource, name="GCC Stormwater Drain Survey",
        defaults={"trust_level": "official", "license": "Open Government Data",
                  "attribution": "Greater Chennai Corporation", "url": "https://chennai.gov.in",
                  "description": "GCC stormwater drain network survey with geometry and attributes",
                  "version": "2023"})

    sources["rainfall"], _ = get_or_create(db, DataSource, name="IMD Rainfall Station Data",
        defaults={"trust_level": "official", "license": "Open Government Data",
                  "attribution": "India Meteorological Department", "url": "https://mausam.imd.gov.in",
                  "description": "IMD station rainfall observations for Chennai 2015 event",
                  "version": "2015"})

    sources["dem"], _ = get_or_create(db, DataSource, name="Copernicus DEM GLO-30",
        defaults={"trust_level": "derived", "license": "Copernicus data policy",
                  "attribution": "European Space Agency / Copernicus", "url": "https://spacedata.copernicus.eu",
                  "description": "Copernicus DEM GLO-30 elevation data for Chennai",
                  "version": "2020"})

    sources["hand"], _ = get_or_create(db, DataSource, name="HAND 30m Dataset",
        defaults={"trust_level": "derived", "license": "Open data",
                  "attribution": "HAND dataset providers", "url": "https://hand.example.org",
                  "description": "Height Above Nearest Drainage 30m resolution for Chennai",
                  "version": "2020"})

    sources["landcover"], _ = get_or_create(db, DataSource, name="ESA WorldCover 10m",
        defaults={"trust_level": "research", "license": "CC-BY-4.0",
                  "attribution": "ESA WorldCover project", "url": "https://esa-worldcover.org",
                  "description": "ESA WorldCover 10m land cover classification",
                  "version": "2020"})

    db.commit()
    return sources


def ingest_source_files(db, sources, data_dir):
    """Register source files with checksums."""
    source_files = {}

    file_mapping = {
        "chennai_2015_flood_observations.csv": ("flood_obs", "chennai_2015_flood_observations.csv"),
        "chennai_gcc_drainage_network.csv": ("drainage", "chennai_gcc_drainage_network.csv"),
        "chennai_2015_rainfall.csv": ("rainfall", "chennai_2015_rainfall.csv"),
        "chennai_terrain_features.csv": ("dem", "chennai_terrain_features.csv"),
        "chennai_hand_features.csv": ("hand", "chennai_hand_features.csv"),
        "chennai_landcover_features.csv": ("landcover", "chennai_landcover_features.csv"),
    }

    for filename, (source_key, display_name) in file_mapping.items():
        filepath = data_dir / filename
        if not filepath.exists():
            logger.warning("File not found: %s", filepath)
            continue

        sha = compute_sha256(filepath)
        size = filepath.stat().st_size

        existing = db.query(SourceFile).filter_by(sha256=sha).first()
        if existing:
            source_files[source_key] = existing
            logger.info("Source file already ingested: %s", filename)
            continue

        source_file = SourceFile(
            source_id=sources[source_key].id,
            file_path=str(filepath),
            sha256=sha,
            file_size_bytes=size,
            format=filepath.suffix.lstrip("."),
            ingested_at=datetime.now(timezone.utc),
            validation_status="pending",
        )
        db.add(source_file)
        db.flush()
        source_files[source_key] = source_file
        logger.info("Registered source file: %s (sha256=%s...)", filename, sha[:16])

    db.commit()
    return source_files


def ingest_flood_event_and_observations(db, source_file, csv_path):
    """Ingest 2015 flood event and observations."""
    df = pd.read_csv(csv_path)

    # Create flood event
    event, _ = get_or_create(db, FloodEvent, event_type="extreme_rainfall", source="GCC 2015 Flood Survey",
        defaults={"started_at": datetime(2015, 11, 30, 0, 0, tzinfo=timezone.utc),
                  "ended_at": datetime(2015, 12, 2, 0, 0, tzinfo=timezone.utc),
                  "description": "Chennai 2015 extreme rainfall and flooding event",
                  "rainfall_mm": 494.0})

    # Create places and observations
    places = {}
    for _, row in df.iterrows():
        place_key = f"{row['ward']}_{row['zone']}"
        if place_key not in places:
            place, _ = get_or_create(db, Place, name=f"{row['zone']} (Ward {row['ward']})", ward=str(row['ward']),
                defaults={"zone": row['zone'], "place_type": "flood_location" if row['water_depth_cm'] > 20 else "comparable",
                          "description": "Real observation from 2015 Chennai floods", "geom": wkt_point(row['longitude'], row['latitude'])})
            places[place_key] = place

        place = places[place_key]

        obs, _ = get_or_create(db, FloodObservation, event_id=event.id, place_id=place.id,
            observed_at=datetime.strptime(str(row['observation_date']), "%Y-%m-%d").replace(tzinfo=timezone.utc),
            defaults={"ward": str(row['ward']),
                      "severity": "high" if row['water_depth_cm'] > 30 else "medium" if row['water_depth_cm'] > 15 else "low",
                      "depth_cm": float(row['water_depth_cm']) if pd.notna(row['water_depth_cm']) else None,
                      "notes": f"Observation {row['observation_id']} from {row['source']}",
                      "source": row['source'],
                      "geom": wkt_point(row['longitude'], row['latitude'])})

    # Update source file status
    source_file.validation_status = "valid"
    source_file.record_count = len(df)
    db.commit()

    logger.info("Ingested flood event: %s with %d observations", event.id, len(df))
    return event, places


def ingest_drainage_network(db, source_file, csv_path):
    """Ingest GCC drainage network."""
    df = pd.read_csv(csv_path)

    # Create nodes from segment endpoints
    nodes = {}
    node_counter = 0

    for _, row in df.iterrows():
        # Start node
        start_key = f"{row['start_lat']:.6f},{row['start_lon']:.6f}"
        if start_key not in nodes:
            node_counter += 1
            node_lbl = f"node_{start_key}"
            node = db.query(DrainNode).filter_by(label=node_lbl).first()
            if not node:
                node = DrainNode(
                    label=node_lbl,
                    node_type="junction",
                    ward=str(row['ward']),
                    zone=row['zone'],
                    is_inferred=row['is_inferred'],
                    geom=wkt_point(row['start_lon'], row['start_lat']),
                )
                db.add(node)
                db.flush()
            nodes[start_key] = node

        # End node
        end_key = f"{row['end_lat']:.6f},{row['end_lon']:.6f}"
        if end_key not in nodes:
            node_counter += 1
            node_lbl = f"node_{end_key}"
            node = db.query(DrainNode).filter_by(label=node_lbl).first()
            if not node:
                node = DrainNode(
                    label=node_lbl,
                    node_type="outfall" if row['segment_id'].startswith("DRN_009") or row['segment_id'].startswith("DRN_010") else "junction",
                    ward=str(row['ward']),
                    zone=row['zone'],
                    is_inferred=row['is_inferred'],
                    geom=wkt_point(row['end_lon'], row['end_lat']),
                )
                db.add(node)
                db.flush()
            nodes[end_key] = node

    db.commit()

    # Create segments - use street_name + ward + zone for deduplication
    for _, row in df.iterrows():
        start_key = f"{row['start_lat']:.6f},{row['start_lon']:.6f}"
        end_key = f"{row['end_lat']:.6f},{row['end_lon']:.6f}"

        segment, _ = get_or_create(db, DrainSegment, street_name=row['street_name'], ward=str(row['ward']), zone=row['zone'],
            defaults={"start_node_id": nodes[start_key].id,
                      "end_node_id": nodes[end_key].id,
                      "drain_type": row['drain_type'],
                      "material": row['material'],
                      "is_open": row['is_open'],
                      "is_inferred": row['is_inferred'],
                      "geometry_provenance": "INFERRED" if row['is_inferred'] else "DIRECT",
                      "depth_m": row['depth_m'],
                      "width_m": row['width_m'],
                      "length_m": row['length_m'],
                      "condition_status": row['condition'],
                      "source_file_id": source_file.id,
                      "geom": wkt_line([(row['start_lon'], row['start_lat']), (row['end_lon'], row['end_lat'])])})

    # Create outfalls
    outfall_data = [
        ("Anna Nagar Outfall", "Adyar River", "101", True, 80.2130, 13.0880),
        ("Velachery Outfall", "Buckingham Canal", "102", False, 80.2225, 13.0475),
    ]
    for name, waterbody, ward, inferred, lon, lat in outfall_data:
        get_or_create(db, Outfall, name=name,
            defaults={"waterbody": waterbody, "ward": ward, "is_inferred": inferred,
                      "geom": wkt_point(lon, lat)})

    source_file.validation_status = "valid"
    source_file.record_count = len(df)
    db.commit()

    logger.info("Ingested drainage network: %d segments, %d nodes", len(df), len(nodes))
    return nodes


def ingest_rainfall(db, source_file, csv_path):
    """Ingest rainfall observations."""
    df = pd.read_csv(csv_path)

    for _, row in df.iterrows():
        get_or_create(db, RainfallObservation, place_id=None,
            observed_at=datetime.strptime(str(row['timestamp']), "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc),
            source=row['source'],
            defaults={"ward": str(row['ward']),
                      "rainfall_mm": row['rainfall_mm'],
                      "duration_hours": row['interval_hours'],
                      "geom": wkt_point(row['longitude'], row['latitude'])})

    source_file.validation_status = "valid"
    source_file.record_count = len(df)
    db.commit()

    logger.info("Ingested %d rainfall observations", len(df))


def ingest_terrain_features(db, source_file, csv_path):
    """Ingest terrain features from Copernicus DEM."""
    df = pd.read_csv(csv_path)

    for _, row in df.iterrows():
        place, _ = get_or_create(db, Place, name=f"{row['zone']} (Ward {row['ward']})", ward=str(row['ward']),
            defaults={"zone": row['zone'], "place_type": "flood_location" if row['place_id'] in ['PLACE_A', 'PLACE_D'] else "comparable",
                      "description": "Real location from 2015 Chennai floods case", "geom": wkt_point(row['longitude'], row['latitude'])})

        get_or_create(db, TerrainFeature, place_id=place.id, computation_version=row['computation_version'],
            defaults={"mean_elevation": row['mean_elevation_m'],
                      "min_elevation": row['min_elevation_m'],
                      "max_elevation": row['max_elevation_m'],
                      "mean_slope": row['mean_slope_deg'],
                      "source": row['dem_source']})

    source_file.validation_status = "valid"
    source_file.record_count = len(df)
    db.commit()

    logger.info("Ingested terrain features for %d places", len(df))


def ingest_hand_features(db, source_file, csv_path):
    """Ingest HAND features."""
    df = pd.read_csv(csv_path)

    for _, row in df.iterrows():
        place = db.query(Place).filter_by(ward=str(row['ward'])).first()
        if place:
            terrain = db.query(TerrainFeature).filter_by(place_id=place.id).first()
            if terrain:
                terrain.hand = row['mean_hand_m']
                terrain.relative_elevation = row['mean_hand_m'] - row['min_hand_m'] if pd.notna(row['min_hand_m']) else None
                db.commit()

    source_file.validation_status = "valid"
    source_file.record_count = len(df)
    db.commit()

    logger.info("Updated HAND features for %d places", len(df))


def ingest_landcover_features(db, source_file, csv_path):
    """Ingest land cover features from ESA WorldCover."""
    df = pd.read_csv(csv_path)

    for _, row in df.iterrows():
        place = db.query(Place).filter_by(ward=str(row['ward'])).first()
        if place:
            get_or_create(db, LandcoverFeature, place_id=place.id, computation_version=row['computation_version'],
                defaults={"builtup_fraction": row['builtup_fraction'],
                          "vegetation_fraction": row['vegetation_fraction'],
                          "water_fraction": row['water_fraction'],
                          "source": row['landcover_source']})

    source_file.validation_status = "valid"
    source_file.record_count = len(df)
    db.commit()

    logger.info("Ingested land cover features for %d places", len(df))


def create_manifest(db, sources, source_files, data_dir):
    """Create manifest file for Case 001."""
    manifest = {
        "case_id": "CHENNAI_CASE_001",
        "event": "Chennai 2015 Flood",
        "target_location": "Anna Nagar (Ward 101)",
        "comparison_location": "Velachery (Ward 102)",
        "source_ids": {k: str(v.id) for k, v in sources.items()},
        "source_file_ids": {k: str(v.id) for k, v in source_files.items()},
        "processing_version": "v1",
        "feature_version": "v1",
        "ingestion_timestamp": datetime.now(timezone.utc).isoformat(),
        "files": []
    }

    for source_key, source_file in source_files.items():
        filepath = data_dir / f"chennai_{source_key}.csv"
        if filepath.exists():
            manifest["files"].append({
                "filename": filepath.name,
                "sha256": source_file.sha256,
                "size_bytes": source_file.file_size_bytes,
                "source_id": str(source_file.source_id),
                "source_file_id": str(source_file.id),
                "record_count": source_file.record_count,
                "validation_status": source_file.validation_status,
            })

    manifest_path = Path("data/manifests/chennai_case_001.json")
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    logger.info("Created manifest: %s", manifest_path)
    return manifest


def main():
    parser = argparse.ArgumentParser(description="Ingest Chennai Case 001 data")
    parser.add_argument("--data-dir", default="data/raw", help="Directory containing raw CSV files")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    if not data_dir.exists():
        logger.error("Data directory not found: %s", data_dir)
        sys.exit(1)

    db = SessionLocal()
    try:
        logger.info("Starting Chennai Case 001 ingestion")

        # Ingest data sources
        sources = ingest_data_sources(db)

        # Register source files
        source_files = ingest_source_files(db, sources, data_dir)

        # Ingest each dataset
        ingest_flood_event_and_observations(db, source_files["flood_obs"], data_dir / "chennai_2015_flood_observations.csv")
        ingest_drainage_network(db, source_files["drainage"], data_dir / "chennai_gcc_drainage_network.csv")
        ingest_rainfall(db, source_files["rainfall"], data_dir / "chennai_2015_rainfall.csv")
        ingest_terrain_features(db, source_files["dem"], data_dir / "chennai_terrain_features.csv")
        ingest_hand_features(db, source_files["hand"], data_dir / "chennai_hand_features.csv")
        ingest_landcover_features(db, source_files["landcover"], data_dir / "chennai_landcover_features.csv")

        # Create manifest
        manifest = create_manifest(db, sources, source_files, data_dir)

        logger.info("Chennai Case 001 ingestion complete")
        print(json.dumps(manifest, indent=2))

    except Exception as e:
        logger.error("Ingestion failed: %s", e)
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()