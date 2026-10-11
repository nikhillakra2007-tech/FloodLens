"""Seed deterministic demo data for FloodLens.

Creates:
- 4 places in Chennai (2 flood-prone, 2 comparable)
- 1 flood event with observations
- Rainfall observations
- Drainage network (nodes + segments)
- Terrain and landcover features
- Data sources and source files
"""

import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.core.database import SessionLocal
from app.db.models.drainage_models import DrainNode, DrainSegment, Outfall
from app.db.models.flood_models import FloodEvent, FloodObservation, RainfallObservation
from app.db.models.location_models import LandcoverFeature, Place, TerrainFeature
from app.db.models.source_models import DataSource, SourceFile
from app.services.ingestion.provenance import compute_sha256
from geoalchemy2.elements import WKTElement


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


def seed():
    db = SessionLocal()
    try:
        # Data sources
        src_rain, _ = get_or_create(db, DataSource, name="IMD Rainfall Station Data (Demo)",
            defaults={"trust_level": "official", "license": "Open Government Data", "attribution": "India Meteorological Department"})
        src_drain, _ = get_or_create(db, DataSource, name="GCC Stormwater Drain Survey (Demo)",
            defaults={"trust_level": "official", "license": "Open Government Data", "attribution": "Greater Chennai Corporation"})
        src_dem, _ = get_or_create(db, DataSource, name="Copernicus DEM GLO-30 (Demo)",
            defaults={"trust_level": "derived", "license": "Copernicus data policy", "attribution": "European Space Agency / Copernicus"})
        src_land, _ = get_or_create(db, DataSource, name="ESA WorldCover 10m (Demo)",
            defaults={"trust_level": "research", "license": "CC-BY-4.0", "attribution": "ESA WorldCover project"})
        db.commit()

        # Places
        place_data = [
            ("Anna Nagar (Flood Location A)", "101", "Anna Nagar", "flood_location", "Research/demo dataset — flood-prone location", 80.2100, 13.0850),
            ("Velachery (Comparable B)", "102", "Velachery", "comparable", "Research/demo dataset — comparable location", 80.2200, 13.0450),
            ("Adyar (Comparable C)", "103", "Adyar", "comparable", "Research/demo dataset — comparable location", 80.2300, 13.0100),
            ("T Nagar (Flood Location D)", "104", "T Nagar", "flood_location", "Research/demo dataset — second flood location", 80.2350, 13.0400),
        ]

        places = {}
        for name, ward, zone, place_type, desc, lon, lat in place_data:
            place, _ = get_or_create(db, Place, name=name, ward=ward,
                defaults={"zone": zone, "place_type": place_type, "description": desc, "geom": wkt_point(lon, lat)})
            places[name] = place

        db.commit()

        place_a = places["Anna Nagar (Flood Location A)"]
        place_b = places["Velachery (Comparable B)"]
        place_c = places["Adyar (Comparable C)"]
        place_d = places["T Nagar (Flood Location D)"]

        # Terrain features
        terrain_data = [
            (place_a.id, 6.2, 5.1, 7.8, 0.8, 2.1, -1.5),
            (place_b.id, 8.5, 7.2, 10.1, 1.2, 4.5, 1.2),
            (place_c.id, 7.0, 6.0, 8.5, 1.0, 3.2, 0.5),
            (place_d.id, 5.8, 4.8, 7.2, 0.7, 1.8, -2.0),
        ]
        for pid, mean_elev, min_elev, max_elev, slope, hand, rel_elev in terrain_data:
            get_or_create(db, TerrainFeature, place_id=pid, computation_version="v1",
                defaults={"mean_elevation": mean_elev, "min_elevation": min_elev, "max_elevation": max_elev,
                          "mean_slope": slope, "hand": hand, "relative_elevation": rel_elev,
                          "source": "Copernicus DEM GLO-30 (Demo)"})

        # Landcover features
        lc_data = [
            (place_a.id, 0.78, 0.12, 0.03),
            (place_b.id, 0.65, 0.22, 0.05),
            (place_c.id, 0.70, 0.18, 0.04),
            (place_d.id, 0.82, 0.08, 0.02),
        ]
        for pid, builtup, veg, water in lc_data:
            get_or_create(db, LandcoverFeature, place_id=pid, computation_version="v1",
                defaults={"builtup_fraction": builtup, "vegetation_fraction": veg, "water_fraction": water,
                          "source": "ESA WorldCover 10m (Demo)"})

        db.commit()

        # Drainage nodes
        node_data = [
            ("junction", "101", "Anna Nagar", False, 80.2105, 13.0855),
            ("junction", "101", "Anna Nagar", False, 80.2110, 13.0860),
            ("outfall", "101", "Anna Nagar", True, 80.2120, 13.0870),
            ("junction", "102", "Velachery", False, 80.2205, 13.0455),
            ("outfall", "102", "Velachery", False, 80.2215, 13.0465),
        ]
        nodes = {}
        for i, (node_type, ward, zone, is_inferred, lon, lat) in enumerate(node_data, 1):
            node, _ = get_or_create(db, DrainNode, node_type=node_type, ward=ward, zone=zone,
                defaults={"is_inferred": is_inferred, "geom": wkt_point(lon, lat)})
            nodes[f"n{i}"] = node

        db.commit()

        # Drainage segments
        seg_data = [
            (nodes["n1"].id, nodes["n2"].id, "SWD", "101", "Anna Nagar", "2nd Avenue", "RCC", False, False, 1.2, 1.0, 150.0, "good",
             [(80.2105, 13.0855), (80.2110, 13.0860)]),
            (nodes["n2"].id, nodes["n3"].id, "SWD", "101", "Anna Nagar", "3rd Avenue", "RCC", False, True, 0.9, 0.8, 200.0, "unknown",
             [(80.2110, 13.0860), (80.2120, 13.0870)]),
            (nodes["n4"].id, nodes["n5"].id, "macro", "102", "Velachery", "Velachery Main Road", "RCC", True, False, 2.0, 1.8, 500.0, "good",
             [(80.2205, 13.0455), (80.2215, 13.0465)]),
        ]
        for start_id, end_id, drain_type, ward, zone, street, material, is_open, is_inferred, depth, width, length, condition, coords in seg_data:
            get_or_create(db, DrainSegment, start_node_id=start_id, end_node_id=end_id,
                defaults={"drain_type": drain_type, "ward": ward, "zone": zone, "street_name": street,
                          "material": material, "is_open": is_open, "is_inferred": is_inferred,
                          "depth_m": depth, "width_m": width, "length_m": length,
                          "condition_status": condition, "geom": wkt_line(coords)})

        db.commit()

        # Outfalls
        get_or_create(db, Outfall, name="Anna Nagar Outfall",
            defaults={"waterbody": "Adyar River", "ward": "101", "is_inferred": True, "geom": wkt_point(80.2120, 13.0870)})
        get_or_create(db, Outfall, name="Velachery Outfall",
            defaults={"waterbody": "Buckingham Canal", "ward": "102", "is_inferred": False, "geom": wkt_point(80.2215, 13.0465)})
        db.commit()

        # Flood event
        event, _ = get_or_create(db, FloodEvent, event_type="extreme_rainfall", source="IMD (Demo)",
            defaults={"started_at": datetime(2024, 11, 12, 14, 0), "ended_at": datetime(2024, 11, 13, 8, 0),
                      "description": "Research/demo dataset — synthetic extreme rainfall event", "rainfall_mm": 180.0})
        db.commit()

        # Flood observations
        get_or_create(db, FloodObservation, event_id=event.id, place_id=place_a.id,
            defaults={"ward": "101", "observed_at": datetime(2024, 11, 12, 18, 0), "severity": "high",
                      "depth_cm": 45.0, "notes": "Research/demo dataset — waterlogging observed",
                      "source": "Community observation (Demo)", "geom": wkt_point(80.2100, 13.0850)})
        get_or_create(db, FloodObservation, event_id=event.id, place_id=place_d.id,
            defaults={"ward": "104", "observed_at": datetime(2024, 11, 12, 19, 0), "severity": "medium",
                      "depth_cm": 25.0, "notes": "Research/demo dataset — minor waterlogging",
                      "source": "Community observation (Demo)", "geom": wkt_point(80.2350, 13.0400)})
        db.commit()

        # Rainfall observations
        for place in [place_a, place_b, place_c, place_d]:
            for hour in range(0, 24, 6):
                idx = [place_a.id, place_b.id, place_c.id, place_d.id].index(place.id)
                get_or_create(db, RainfallObservation, place_id=place.id, observed_at=datetime(2024, 11, 12, hour, 0), source="IMD (Demo)",
                    defaults={"ward": place.ward, "rainfall_mm": 15.0 + (hour * 2) + (5 if place.id in [place_a.id, place_d.id] else 0),
                              "duration_hours": 6.0, "geom": wkt_point(80.2100 + 0.01 * idx, 13.0850 - 0.04 * idx)})
        db.commit()

        # Source files
        get_or_create(db, SourceFile, sha256=compute_sha256(Path(__file__).resolve().parent / "seed_demo.py"),
            defaults={"source_id": src_rain.id, "file_path": "data/seed/demo_data.csv",
                      "file_size_bytes": Path(__file__).stat().st_size, "format": "py", "record_count": 4,
                      "ingested_at": datetime.now(timezone.utc), "validation_status": "valid"})
        db.commit()

        print("Demo seed complete.")
        print(f"  Places: 4 (A={place_a.id}, B={place_b.id})")
        print(f"  Flood event: {event.id}")
        print(f"  Drainage segments: 3")
        print(f"  Rainfall observations: 16")

    finally:
        db.close()


if __name__ == "__main__":
    seed()