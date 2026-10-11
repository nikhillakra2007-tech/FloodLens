from app.agent.guardrails import check_claim_safety, validate_agent_output


def test_blocked_claim_detected():
    safe, issues = check_claim_safety("The drain was blocked during the event")
    assert not safe
    assert len(issues) > 0


def test_safe_claim_passes():
    safe, issues = check_claim_safety("Higher upstream built-up fraction is consistent with greater runoff")
    assert safe
    assert len(issues) == 0


def test_causation_claim_detected():
    safe, issues = check_claim_safety("This proves causation between impervious surface and flooding")
    assert not safe


def test_agent_output_missing_summary():
    ok, issues = validate_agent_output({})
    assert not ok
    assert any("investigation_summary" in i for i in issues)


def test_agent_output_invalid_mechanism():
    ok, issues = validate_agent_output({
        "investigation_summary": "test",
        "strongest_mechanism": "INVALID_MECHANISM",
        "confidence": 0.5,
    })
    assert not ok


def test_agent_output_confidence_out_of_range():
    ok, issues = validate_agent_output({
        "investigation_summary": "test",
        "confidence": 1.5,
    })
    assert not ok


def test_agent_output_valid():
    ok, issues = validate_agent_output({
        "investigation_summary": "test",
        "strongest_mechanism": "RUNOFF_CONCENTRATION",
        "confidence": 0.7,
    })
    assert ok
