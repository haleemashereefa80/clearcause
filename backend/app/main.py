from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import donation, admin, campaign
from .database import engine, SessionLocal
from . import models
import os
from dotenv import load_dotenv

load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Clear Cause API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Crowdfunding API", "status": "healthy"}

# Include routers
app.include_router(donation.router, prefix="/api/donations", tags=["Donations"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(campaign.router, prefix="/api/campaigns", tags=["Campaigns"])
