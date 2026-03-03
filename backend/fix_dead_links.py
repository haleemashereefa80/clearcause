import sys
import os
from sqlalchemy.orm import Session

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import models, database

def fix_dead_links():
    db = database.SessionLocal()
    try:
        # High-reliability Unsplash IDs (Commonly cached and stable)
        medical_imgs = [
            "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1505751172107-597cd5577367?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1538108197017-c1b89c0ef31c?auto=format&fit=crop&q=80&w=800"
        ]
        edu_imgs = [
            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800"
        ]
        nature_imgs = [
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1469571486040-0badfea0941c?auto=format&fit=crop&q=80&w=800"
        ]

        campaigns = db.query(models.Campaign).all()
        print(f"Refreshing image links for {len(campaigns)} campaigns...")

        for i, c in enumerate(campaigns):
            if c.category == "Medical":
                c.image_url = medical_imgs[i % len(medical_imgs)]
            elif c.category == "Education":
                c.image_url = edu_imgs[i % len(edu_imgs)]
            else:
                c.image_url = nature_imgs[i % len(nature_imgs)]
            
            # Sync gallery too
            db.query(models.CampaignImage).filter(models.CampaignImage.campaign_id == c.id).delete()
            db.add(models.CampaignImage(campaign_id=c.id, image_url=c.image_url, is_primary=True))
            
            secondary = nature_imgs[(i+1)%len(nature_imgs)] if c.category != "Education" else edu_imgs[(i+1)%len(edu_imgs)]
            db.add(models.CampaignImage(campaign_id=c.id, image_url=secondary, is_primary=False))

        db.commit()
        print("Successfully updated all image links to high-reliability sources.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_dead_links()
