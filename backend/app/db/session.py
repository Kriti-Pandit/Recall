from sqlalchemy import Text, create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    # schema.sql uses TEXT (not VARCHAR) for every string column.
    type_annotation_map = {str: Text}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
