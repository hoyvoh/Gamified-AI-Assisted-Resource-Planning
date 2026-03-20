from fastapi import FastAPI

app = FastAPI(
    title="Gamified Resource Planning API",
    version="0.1.0",
    description="API for gamified project resource planning.",
)


@app.get("/health")
async def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}
