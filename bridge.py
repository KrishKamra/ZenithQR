from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow your React UI (on port 8080) to access this data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Internal "State" - This holds the current data shown on the dashboard
telemetry_data = {
    "qualityScore": 52.05,
    "latencyMs": 9.81,
    "safetyStatus": "warning",
    "qrData": "https://github.com/KrishKamra"
}

class TelemetryUpdate(BaseModel):
    qualityScore: float | None = None
    latencyMs: float | None = None
    safetyStatus: str | None = None
    qrData: str | None = None

@app.get("/telemetry")
async def get_telemetry():
    """React UI will call this to update the cards."""
    return telemetry_data

@app.post("/update")
async def update_telemetry(data: TelemetryUpdate):
    """Your NPU scripts will call this to push new data."""
    global telemetry_data
    update_dict = data.model_dump(exclude_unset=True)
    telemetry_data.update(update_dict)
    return {"status": "success", "updated": telemetry_data}

if __name__ == "__main__":
    import uvicorn
    # Run on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)