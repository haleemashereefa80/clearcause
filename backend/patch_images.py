import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import or_

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import models, database

def patch_all_campaigns():
    db = database.SessionLocal()
    try:
        # Get ALL campaigns
        campaigns = db.query(models.Campaign).all()
        print(f"Auditing {len(campaigns)} campaigns...")
        
        pool = [
            "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1581056771107-2475d5639f43?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1541252260733-5433d3e34dd3?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1536640712247-c7553b3e2641?auto=format&fit=crop&q=80&w=800"
        ]
        
        count = 0
        for i, c in enumerate(campaigns):
            fixed = False
            # Fix Main Image
            if not c.image_url or "placehold.co" in (c.image_url or "") or c.image_url == "None":
                selected_img = pool[i % len(pool)]
                c.image_url = selected_img
                fixed = True
                print(f"  Fixed missing/placeholder main image for: '{c.title}'")

            # Fix Gallery Images
            gallery_count = db.query(models.CampaignImage).filter(models.CampaignImage.campaign_id == c.id).count()
            if gallery_count == 0:
                # Add at least two images
                main_img = c.image_url
                second_img = pool[(i+1) % len(pool)]
                db.add(models.CampaignImage(campaign_id=c.id, image_url=main_img, is_primary=True))
                db.add(models.CampaignImage(campaign_id=c.id, image_url=second_img, is_primary=False))
                fixed = True
                print(f"  Added missing gallery images for: '{c.title}'")
            
            if fixed:
                count += 1
                
        db.commit()
        print(f"Audit complete. Patched {count} campaigns.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    patch_all_campaigns()
