from dataclasses import dataclass, field
from typing import Any


@dataclass
class ValidationReport:
    source_name: str
    total_records: int = 0
    valid_records: int = 0
    invalid_records: int = 0
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    @property
    def is_valid(self) -> bool:
        return self.invalid_records == 0 and self.valid_records > 0

    @property
    def status(self) -> str:
        if self.is_valid:
            return "valid"
        return "quarantined"


def validate_geometry(geom) -> list[str]:
    errors = []
    if geom is None:
        errors.append("missing geometry")
        return errors
    try:
        from shapely import wkb
        g = wkb.loads(bytes(geom.data))
        if not g.is_valid:
            errors.append("invalid geometry")
        if g.is_empty:
            errors.append("empty geometry")
    except Exception as e:
        errors.append(f"geometry parse error: {e}")
    return errors


def validate_coordinates(lon: float | None, lat: float | None) -> list[str]:
    errors = []
    if lon is None or lat is None:
        errors.append("missing coordinates")
    else:
        if not (-180 <= lon <= 180):
            errors.append(f"longitude {lon} out of range")
        if not (-90 <= lat <= 90):
            errors.append(f"latitude {lat} out of range")
    return errors


def validate_non_negative(value: float | None, name: str) -> list[str]:
    if value is not None and value < 0:
        return [f"{name} is negative: {value}"]
    return []


def validate_fraction(value: float | None, name: str) -> list[str]:
    if value is not None and not (0 <= value <= 1):
        return [f"{name} {value} is not a valid fraction (must be 0-1)"]
    return []


def validate_record(record: dict[str, Any]) -> list[str]:
    errors = []
    for field_name in ("depth_m", "width_m", "length_m", "rainfall_mm"):
        if field_name in record:
            errors.extend(validate_non_negative(record.get(field_name), field_name))
    for field_name in ("builtup_fraction", "vegetation_fraction", "water_fraction", "runoff_coefficient"):
        if field_name in record:
            errors.extend(validate_fraction(record.get(field_name), field_name))
    if "longitude" in record or "latitude" in record:
        errors.extend(validate_coordinates(record.get("longitude"), record.get("latitude")))
    return errors
