from uuid import UUID
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.evidence_models import EvidenceItem
from app.db.models.investigation_models import (
    Comparison,
    CounterfactualRun,
    Investigation,
    Mechanism,
)


def get_comparison(db: Session, comparison_id: UUID) -> Comparison | None:
    return db.scalar(select(Comparison).where(Comparison.id == comparison_id))


def save_comparison(db: Session, comp: Comparison) -> Comparison:
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp


def get_or_create_comparison(
    db: Session,
    place_a_id: UUID,
    place_b_id: UUID,
    similarity_score: float = 0.0,
    weights_version: str = "v1",
    feature_similarities: dict[str, Any] | None = None,
    reasons: list[str] | None = None,
) -> Comparison:
    comp = db.scalar(
        select(Comparison).where(
            Comparison.place_a_id == place_a_id,
            Comparison.place_b_id == place_b_id,
        )
    )
    if not comp:
        comp = Comparison(
            place_a_id=place_a_id,
            place_b_id=place_b_id,
            similarity_score=similarity_score,
            weights_version=weights_version,
            feature_similarities=feature_similarities or {},
            reasons=reasons or [],
        )
        db.add(comp)
        db.commit()
        db.refresh(comp)
    return comp


def get_mechanisms(db: Session, comparison_id: UUID) -> list[Mechanism]:
    return list(
        db.scalars(
            select(Mechanism)
            .where(Mechanism.comparison_id == comparison_id)
            .order_by(Mechanism.rank)
        ).all()
    )


def save_mechanisms(db: Session, mechanisms: list[Mechanism]) -> None:
    if mechanisms:
        comp_id = mechanisms[0].comparison_id
        db.query(Mechanism).filter(Mechanism.comparison_id == comp_id).delete()
    for m in mechanisms:
        db.add(m)
    db.commit()


def get_investigation(db: Session, investigation_id: UUID) -> Investigation | None:
    return db.scalar(select(Investigation).where(Investigation.id == investigation_id))


def save_investigation(db: Session, inv: Investigation) -> Investigation:
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


def get_evidence(db: Session, investigation_id: UUID) -> list[EvidenceItem]:
    return list(
        db.scalars(
            select(EvidenceItem)
            .where(EvidenceItem.investigation_id == investigation_id)
            .order_by(EvidenceItem.support_score.desc())
        ).all()
    )


def save_evidence_items(db: Session, items: list[EvidenceItem]) -> None:
    for item in items:
        db.add(item)
    db.commit()


def save_counterfactual(db: Session, run: CounterfactualRun) -> CounterfactualRun:
    db.add(run)
    db.commit()
    db.refresh(run)
    return run
