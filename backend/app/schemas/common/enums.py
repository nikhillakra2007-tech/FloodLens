"""Canonical scientific status enums for FloodLens backend API contract."""

from enum import Enum


class CertaintyLevel(str, Enum):
    """Certainty level of a scientific claim or evidence item."""
    FACT = "FACT"
    SUPPORTED = "SUPPORTED"
    HYPOTHESIS = "HYPOTHESIS"
    UNKNOWN = "UNKNOWN"


class ValidationStatus(str, Enum):
    """Multi-event historical validation outcome."""
    STRONG_SUPPORT = "STRONG_SUPPORT"
    MODERATE_SUPPORT = "MODERATE_SUPPORT"
    WEAK_SUPPORT = "WEAK_SUPPORT"
    MIXED = "MIXED"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class RainfallComparabilityStatus(str, Enum):
    """Event-level rainfall comparability between two locations."""
    COMPARABLE = "COMPARABLE"
    PARTIALLY_COMPARABLE = "PARTIALLY_COMPARABLE"
    UNKNOWN = "UNKNOWN"


class DrainageAlignmentStatus(str, Enum):
    """Drainage network survey alignment relative to flood event epoch."""
    EVENT_ALIGNED = "EVENT_ALIGNED"
    TEMPORALLY_MISMATCHED = "TEMPORALLY_MISMATCHED"
    UNKNOWN = "UNKNOWN"


class GeometryProvenance(str, Enum):
    """Data provenance source of spatial geometry."""
    DIRECT = "DIRECT"
    DERIVED = "DERIVED"
    INFERRED = "INFERRED"
    UNKNOWN = "UNKNOWN"


class DefensibilityVerdict(str, Enum):
    """Scientific defensibility assessment verdict."""
    DEFENSIBLE = "DEFENSIBLE"
    DEFENSIBLE_WITH_MATERIAL_LIMITATIONS = "DEFENSIBLE_WITH_MATERIAL_LIMITATIONS"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


class GateStatus(str, Enum):
    """Scientific defensibility gate evaluation status."""
    PASS = "PASS"
    FAIL = "FAIL"
    CONDITIONAL = "CONDITIONAL"
    UNKNOWN = "UNKNOWN"


class LimitationSeverity(str, Enum):
    """Severity tier for scientific and empirical limitations."""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class InvestigationStatus(str, Enum):
    """Execution status of an automated investigation."""
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class SourceIndependenceType(str, Enum):
    """Source dependency tier to prevent double counting."""
    INDEPENDENT_SOURCE = "INDEPENDENT_SOURCE"
    DEPENDENT_DERIVATION = "DEPENDENT_DERIVATION"
    SAME_SOURCE_SIGNAL = "SAME_SOURCE_SIGNAL"


class EvidenceRelationType(str, Enum):
    """Epistemic edge type in mechanism-evidence graph."""
    CORRELATION = "CORRELATION"
    ASSOCIATION = "ASSOCIATION"
    PROXY_INPUT = "PROXY_INPUT"
    CAUSAL_HYPOTHESIS = "CAUSAL_HYPOTHESIS"


class GateType(str, Enum):
    """Defensibility gate classification: correlation vs causal specificity."""
    CORRELATION = "CORRELATION"
    CAUSAL = "CAUSAL"
