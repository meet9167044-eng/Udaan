from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import score
from routes import borrowers
from routes import features
from routes import vault
from routes import lender
from routes import demo

app = FastAPI(title="UdaanScore API", description="AI-powered alternative credit scoring for thin-file borrowers", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the score route
app.include_router(score.router, prefix="/score", tags=["Trust Score"])
app.include_router(borrowers.router, prefix="/borrowers", tags=["Borrowers"])
app.include_router(features.router, prefix="/features", tags=["Features"])
app.include_router(vault.router, prefix="/vault", tags=["Consent Vault"])
app.include_router(lender.router, prefix="/lender", tags=["Lender Reports"])
app.include_router(demo.router, prefix="/demo", tags=["Demo"])

@app.get("/", tags=["Root"])
def home():
    return {
        "project": "UdaanScore",
        "tagline": "AI-powered trust credit for India's underserved",
        "status": "Running",
        "version": "1.0.0",
        "quick_links": {
            "docs": "/docs",
            "demo_story": "/demo/raju-story",
            "all_endpoints": "/demo/all-endpoints",
            "health": "/health"
        }
    }

@app.get("/health", tags=["Root"])
def health():
    return {
        "status": "ok",
        "api": "UdaanScore",
        "modules_loaded": 9
    }