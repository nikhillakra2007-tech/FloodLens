from dataclasses import dataclass, field


@dataclass
class DrainageSummary:
    segment_count: int = 0
    total_length_m: float = 0.0
    inferred_count: int = 0
    open_count: int = 0
    closed_count: int = 0
    mean_depth_m: float | None = None
    mean_width_m: float | None = None
    connected_to_outfall: bool = False
    distance_to_outfall_m: float | None = None
    downstream_path_length_m: float | None = None


def effective_capacity(summary: DrainageSummary) -> float:
    if summary.segment_count == 0:
        return 0.0
    depth = summary.mean_depth_m if summary.mean_depth_m is not None else 1.0
    width = summary.mean_width_m if summary.mean_width_m is not None else 1.0
    return summary.total_length_m * depth * width


def drain_density(summary: DrainageSummary, area_km2: float) -> float:
    if area_km2 <= 0:
        return 0.0
    return summary.total_length_m / 1000.0 / area_km2


def upstream_load_proxy(summary: DrainageSummary, upstream_built_fraction: float) -> float:
    return effective_capacity(summary) * (1.0 - upstream_built_fraction)
