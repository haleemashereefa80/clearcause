import sys
import os
from sqlalchemy.orm import Session
from decimal import Decimal

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import models, database

def list_campaign_images():
    db = database.SessionLocal()
    try:
        campaigns = db.query(models.Campaign).all()
        print(f"Found {len(campaigns)} campaigns.")
        for c in campaigns:
            images = db.query(models.CampaignImage).filter(models.CampaignImage.campaign_id == c.id).all()
            print(f"ID: {c.id} | Title: {c.title}")
            print(f"  Main Image: {c.image_url}")
            print(f"  Gallery Images: {len(images)}")
            if not c.image_url or "placehold.co" in (c.image_url or ""):
                print("  !!! MAIN IMAGE MISSING OR PLACEHOLDER !!!")
            if len(images) == 0:
                print("  !!! NO GALLERY IMAGES !!!")
            print("-" * 30)
    finally:
        db.close()

if __name__ == "__main__":
    list_campaign_images()
