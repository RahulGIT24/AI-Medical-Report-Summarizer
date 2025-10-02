from dotenv import load_dotenv
load_dotenv()

import uvicorn
from app.db import Base,engine
from fastapi import FastAPI
from app.models import User, Reports
from app.lib.seed import seed_in
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.lib import UPLOADS_DIR

app=FastAPI()

origins=["http://localhost:5173/*","http://localhost:5174/*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)

app.mount("/uploads",StaticFiles(directory=UPLOADS_DIR), name="static")

# routers imported
from app.routers.report_routes import router as report_routes

app.include_router(router=report_routes)

if __name__ == "__main__":
    import os
    if os.getenv("ENV") == "DEV": 
        seed_in()
    uvicorn.run("main:app", port=5000, log_level="info")