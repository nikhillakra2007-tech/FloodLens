from collections.abc import Iterable
import math

from shapely.geometry import LineString, Point, shape
from shapely.ops import unary_union


def validate_wkt(geom) -> bool:
    if geom is None:
        return False
    try:
        g = geom if hasattr(geom, "geom_type") else shape(geom)
        return g.is_valid and not g.is_empty
    except Exception:
        return False


def buffer_point(lon: float, lat: float, radius_m: float) -> float:
    import math

    return radius_m / (111320.0 * math.cos(math.radians(lat)))


def line_length_m(coords: Iterable[tuple[float, float]]) -> float:
    line = LineString(coords)
    if len(coords) < 2:
        return 0.0
    avg_lat = sum(c[1] for c in coords) / len(coords)
    m_per_deg_lat = 111320.0
    m_per_deg_lon = 111320.0 * math.cos(math.radians(avg_lat))
    total = 0.0
    coords_list = list(coords)
    for i in range(1, len(coords_list)):
        dx = (coords_list[i][0] - coords_list[i - 1][0]) * m_per_deg_lon
        dy = (coords_list[i][1] - coords_list[i - 1][1]) * m_per_deg_lat
        total += math.sqrt(dx * dx + dy * dy)
    return total


def point_distance_m(a: tuple[float, float], b: tuple[float, float]) -> float:
    avg_lat = (a[1] + b[1]) / 2.0
    m_per_deg_lat = 111320.0
    m_per_deg_lon = 111320.0 * math.cos(math.radians(avg_lat))
    dx = (a[0] - b[0]) * m_per_deg_lon
    dy = (a[1] - b[1]) * m_per_deg_lat
    return math.sqrt(dx * dx + dy * dy)


def merge_geometries(geoms):
    valid = [g for g in geoms if g is not None and not g.is_empty]
    if not valid:
        return None
    return unary_union(valid)

