import logging
from uuid import UUID

from app.agent.agent import FloodLensAgent
from app.core.database import SessionLocal
from app.repositories.investigations import get_comparison, save_investigation

logger = logging.getLogger(__name__)


def run_investigation_async(investigation_id: UUID) -> None:
    db = SessionLocal()
    try:
        from app.repositories.investigations import get_investigation
        inv = get_investigation(db, investigation_id)
        if not inv:
            logger.error("Investigation %s not found", investigation_id)
            return

        comp = get_comparison(db, inv.comparison_id)
        if not comp:
            logger.error("Comparison %s not found", inv.comparison_id)
            return

        inv.status = "running"
        save_investigation(db, inv)

        agent = FloodLensAgent(db)
        result = agent.run_investigation(inv.id, comp.place_a_id, comp.place_b_id, comp.id)
        inv.agent_response = result
        inv.summary = result.get("investigation_summary")
        inv.status = "completed"
        save_investigation(db, inv)
    except Exception as e:
        logger.error("Investigation %s failed: %s", investigation_id, e)
        inv = get_investigation(db, investigation_id)
        if inv:
            inv.status = "failed"
            inv.error_message = str(e)
            save_investigation(db, inv)
    finally:
        db.close()
