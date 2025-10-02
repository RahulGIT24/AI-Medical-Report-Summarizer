from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy_utils import create_database, database_exists
from app.lib import DATABASE_URL

engine = create_engine(DATABASE_URL)

if not database_exists(DATABASE_URL):
    create_database(DATABASE_URL)

Base = declarative_base()

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)