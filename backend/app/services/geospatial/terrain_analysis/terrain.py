import math
from dataclasses import dataclass


@dataclass
class TerrainProfile:
    mean_elevation: float | None = None
    min_elevation: float | None = None
    max_elevation: float | None = None
    mean_slope: float | None = None
    hand: float | None = None
    relative_elevation: float | None = None


def compute_slope_deg(elev_a: float, elev_b: float, distance_m: float) -> float:
    if distance_m <= 0:
        return 0.0
    return math.degrees(math.atan2(abs(elev_b - elev_a), distance_m))


def normalize_elevation(elev: float, ref_min: float, ref_max: float) -> float:
    if ref_max - ref_min < 1e-9:
        return 0.5
    return (elev - ref_min) / (ref_max - ref_min)


def compute_hand(elevation: float, neighborhood_min: float) -> float | None:
    if elevation is None or neighborhood_min is None:
        return None
    return max(0.0, elevation - neighborhood_min)


def relative_elevation(elevation: float, local_mean: float) -> float:
    return elevation - local_mean

