import sys
import os
from sqlalchemy.orm import Session
from decimal import Decimal

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import models, database

def fix_campaign_images():
    db = database.SessionLocal()
    try:
        campaigns = db.query(models.Campaign).all()
        print(f"Checking {len(campaigns)} campaigns for missing images...")
        
        # Categorized high-quality images from Unsplash
        image_pool = {
            "Medical": [
                "https://images.unsplash.com/photo-1581056771107-2475d5639f43?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1538108197017-c1b89c0ef31c?auto=format&fit=crop&q=80&w=800"
            ],
            "Education": [
                "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800"
            ],
            "Animal Welfare": [
                "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=800"
            ],
            "Environment": [
                "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1501183638710-841dd1904538?auto=format&fit=crop&q=80&w=800"
            ],
            "Default": [
                "https://images.unsplash.com/photo-1469571486040-0badfea0941c?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800"
            ]
        }
        
        updated_count = 0
        
        for c in campaigns:
            needs_update = False
            
            # 1. Fix Main Image
            if not c.image_url or "placehold.co" in (c.image_url or ""):
                category = c.category if c.category in image_pool else "Default"
                c.image_url = image_pool[category][0]
                needs_update = True
                print(f"Fixed Main Image for: {c.title}")
            
            # 2. Fix Gallery Images
            existing_gallery = db.query(models.CampaignImage).filter(models.CampaignImage.campaign_id == c.id).all()
            if len(existing_gallery) == 0:
                print(f"Adding Gallery Images for: {c.title}")
                # Add main image as primary
                db.add(models.CampaignImage(campaign_id=c.id, image_url=c.image_url, is_primary=True))
                
                # Add secondary image
                category = c.category if c.category in image_pool else "Default"
                secondary_img = image_pool[category][1] if len(image_pool[category]) > 1 else image_pool["Default"][0]
                db.add(models.CampaignImage(campaign_id=c.id, image_url=secondary_img, is_primary=False))
                needs_update = True
            
            if needs_update:
                updated_count += 1
        
        db.commit()
        print(f"Done! Updated images for {updated_count} campaigns.")
    finally:
        db.close()

if __name__ == "__main__":
    fix_campaign_images()
