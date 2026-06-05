from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import score
from routes import borrowers

app = FastAPI(title="UdaanScore API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the score route
app.include_router(score.router, prefix="/score")
app.include_router(borrowers.router, prefix="/borrowers")

@app.get("/")
def home():
    return {"message": "UdaanScore API Running"}

@app.get("/health")
def health():
    return {"status": "ok"}