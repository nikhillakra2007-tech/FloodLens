from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.evidence_models import EvidenceItem


def get_evidence_by_id(db: Session, evidence_id: UUID) -> EvidenceItem | None:
    return db.scalar(select(EvidenceItem).where(EvidenceItem.id == evidence_id))


def get_evidence_for_investigation(db: Session, investigation_id: UUID) -> list[EvidenceItem]:
    return list(db.scalars(select(EvidenceItem).where(EvidenceItem.investigation_id == investigation_id)).all())


def save_evidence(db: Session, item: EvidenceItem) -> EvidenceItem:
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
