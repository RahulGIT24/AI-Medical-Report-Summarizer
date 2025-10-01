from dotenv import load_dotenv
load_dotenv()

import uvicorn
from app.db import Base,engine
from fastapi import FastAPI

app=FastAPI()

Base.metadata.create_all(engine)

if __name__ == "__main__":
    uvicorn.run("main:app", port=5000, log_level="info")
