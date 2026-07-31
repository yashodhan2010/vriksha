import os
import threading
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from rapidocr_onnxruntime import RapidOCR

from worker import SupabaseRest, load_config, poll_once


class ProcessRequest(BaseModel):
    limit: int = 5


class WorkerState:
    def __init__(self) -> None:
        self.db: SupabaseRest | None = None
        self.engine: RapidOCR | None = None
        self.lock = threading.Lock()


state = WorkerState()


def require_secret(authorization: str | None) -> None:
    expected = os.environ.get("KYC_WORKER_SECRET")
    if not expected:
        raise HTTPException(status_code=500, detail="KYC_WORKER_SECRET is not configured.")
    if authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="Invalid worker trigger secret.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    state.db = SupabaseRest(load_config())
    state.engine = RapidOCR()
    yield


app = FastAPI(title="Vriksha KYC OCR Worker", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/jobs/process")
def process_jobs(payload: ProcessRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    require_secret(authorization)
    if state.db is None or state.engine is None:
        raise HTTPException(status_code=503, detail="Worker is not ready.")
    if payload.limit < 1 or payload.limit > 20:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 20.")

    if not state.lock.acquire(blocking=False):
        return {"ok": True, "busy": True, "processed": 0}

    try:
        processed = poll_once(state.db, state.engine, payload.limit)
        return {"ok": True, "busy": False, "processed": processed}
    finally:
        state.lock.release()
