import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import or_

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import models, database

def final_polish_images():
    db = database.SessionLocal()
    try:
        # Get ALL campaigns
        campaigns = db.query(models.Campaign).all()
        print(f"Checking {len(campaigns)} campaigns for image sanity...")
        
        fallback_medical = "https://images.unsplash.com/photo-1581056771107-2475d5639f43?auto=format&fit=crop&q=80&w=800"
        fallback_edu = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800"
        fallback_gen = "https://images.unsplash.com/photo-1469571486040-0badfea0941c?auto=format&fit=crop&q=80&w=800"

        updated = 0
        for c in campaigns:
            needs_update = False
            
            # Check if main image is missing or useless placeholder
            if not c.image_url or "placehold.co" in (c.image_url or "") or c.image_url == "None":
                # Try to get first gallery image
                first_gallery = db.query(models.CampaignImage).filter(models.CampaignImage.campaign_id == c.id).order_by(models.CampaignImage.created_at.asc()).first()
                if first_gallery:
                    c.image_url = first_gallery.image_url
                    print(f"  Fixed '{c.title}' by using first gallery image.")
                else:
                    # Generic fallback based on category
                    if c.category == "Medical":
                        c.image_url = fallback_medical
                    elif c.category == "Education":
                        c.image_url = fallback_edu
                    else:
                        c.image_url = fallback_gen
                    print(f"  Fixed '{c.title}' by using category fallback: {c.category}")
                needs_update = True

            # Ensure gallery is not empty
            gallery_exists = db.query(models.CampaignImage).filter(models.CampaignImage.campaign_id == c.id).count() > 0
            if not gallery_exists:
                db.add(models.CampaignImage(campaign_id=c.id, image_url=c.image_url, is_primary=True))
                print(f"  Added main image to gallery for '{c.title}'")
                needs_update = True
            
            if needs_update:
                updated += 1

        db.commit()
        print(f"Finished. Updated {updated} campaigns.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    final_polish_images()
