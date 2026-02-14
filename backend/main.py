from dotenv import load_dotenv
load_dotenv()

import uvicorn
from app.db import Base,engine
from fastapi import FastAPI
import app.models
from app.lib.seed import seed_in
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.lib import UPLOADS_DIR, qdrant

app=FastAPI()

origins=["http://localhost:5173"]

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
from app.routers.auth import router as auth_routes
from app.routers.user import router as user_routes
from app.routers.chat import router as chat_routes
from app.routers.patients import router as patient_routes

app.include_router(router=report_routes)
app.include_router(router=auth_routes)
app.include_router(router=user_routes)
app.include_router(router=chat_routes)
app.include_router(router=patient_routes)

if __name__ == "__main__":
    # import os
    # if os.getenv("ENV") == "DEV":
    #     seed_in()
    uvicorn.run("main:app", port=5000, log_level="info",reload=True)