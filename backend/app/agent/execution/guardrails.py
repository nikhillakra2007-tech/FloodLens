FORBIDDEN_CLAIMS = [
    "drain was blocked",
    "drain is blocked",
    "blocked drain",
    "proved causation",
    "proves causation",
    "definitely caused",
    "is the cause",
    "predicts exact flood depth",
    "predicted flood depth",
    "calibrated hydraulic simulation",
    "hydraulic simulation proved",
    "proven cause",
    "proves the flood was caused by",
]

REQUIRED_DISCLAIMERS = [
    "Available data supports this mechanism but does not prove causality",
]


def check_claim_safety(claim: str) -> tuple[bool, list[str]]:
    issues = []
    lower = claim.lower()
    for forbidden in FORBIDDEN_CLAIMS:
        if forbidden in lower:
            issues.append(f"Forbidden claim detected: '{forbidden}'")
    return len(issues) == 0, issues


def validate_agent_output(output: dict) -> tuple[bool, list[str]]:
    issues = []

    if not output.get("investigation_summary"):
        issues.append("Missing investigation_summary")
    else:
        safe, sum_issues = check_claim_safety(output["investigation_summary"])
        issues.extend(sum_issues)

    strongest = output.get("strongest_mechanism")
    if strongest is not None and strongest not in {
        "RUNOFF_CONCENTRATION", "DRAINAGE_CAPACITY", "DRAINAGE_CONNECTIVITY",
        "TERRAIN_DEPRESSION", "OUTFALL_RESTRICTION", "WATERBODY_INTERACTION",
        "IMPERVIOUS_SURFACE", "INSUFFICIENT_EVIDENCE",
    }:
        issues.append(f"Invalid strongest_mechanism: {strongest}")

    confidence = output.get("confidence")
    if confidence is None or not (0 <= confidence <= 1):
        issues.append(f"Confidence must be 0-1, got {confidence}")

    for ev in output.get("supporting_evidence", []):
        safe, ev_issues = check_claim_safety(ev)
        issues.extend(ev_issues)

    # Epistemic certainty check: Agent must not upgrade UNKNOWN or HYPOTHESIS to FACT
    certainty_map = output.get("certainty_classification", {})
    for claim_name, cert in certainty_map.items():
        cert_upper = str(cert).upper()
        if "UNKNOWN" in claim_name.upper() and cert_upper in ("FACT", "SUPPORTED"):
            issues.append(f"Illegal certainty upgrade: '{claim_name}' cannot be classified as {cert_upper}")
        if "HYPOTHESIS" in claim_name.upper() and cert_upper == "FACT":
            issues.append(f"Illegal certainty upgrade: '{claim_name}' cannot be upgraded to FACT")

    return len(issues) == 0, issues


def sanitize_agent_output(output: dict) -> dict:
    if "unknowns" not in output or not output["unknowns"]:
        output["unknowns"] = ["No specific unknowns recorded"]
    output.setdefault("certainty_classification", {})
    return output
