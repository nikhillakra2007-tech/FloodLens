from app.core.database import SessionLocal, engine
from app.db.base import Base


def get_session():
    return SessionLocal()


def create_all() -> None:
    Base.metadata.create_all(bind=engine)
