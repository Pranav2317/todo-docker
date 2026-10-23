import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# In Docker this comes from docker-compose.yml.
# Without Docker it falls back to a local SQLite file so you can still run it.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todos.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
