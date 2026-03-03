from app.database import SessionLocal
from app import models
from app.utils import security
import uuid
from decimal import Decimal

def seed_data():
    db = SessionLocal()
    try:
        # 0. Clear Existing Data (Optional but recommended for fresh look)
        print("Clearing existing data...")
        db.query(models.Donation).delete()
        db.query(models.CampaignImage).delete()
        db.query(models.RequestImage).delete()
        db.query(models.Campaign).delete()
        db.query(models.FundraiserBankDetail).delete()
        db.query(models.FundraiserRequest).delete()
        db.query(models.VolunteerAssignment).delete()
        db.query(models.Volunteer).delete()
        db.query(models.Fundraiser).delete()
        db.query(models.AuditLog).delete()
        # Note: We keep Users to avoid deleting login credentials
        db.commit()

        # 1. Create Admins
        admin1_email = "admin1@clearcause.com"
        admin2_email = "admin2@clearcause.com"
        
        if not db.query(models.User).filter(models.User.email == admin1_email).first():
            admin1 = models.User(
                name="Head Admin",
                email=admin1_email,
                password_hash=security.hash_password("Admin123!"),
                role="admin"
            )
            db.add(admin1)
            print(f"Created admin: {admin1_email}")

        if not db.query(models.User).filter(models.User.email == admin2_email).first():
            admin2 = models.User(
                name="Audit Admin",
                email=admin2_email,
                password_hash=security.hash_password("SecureAdmin456!"),
                role="admin"
            )
            db.add(admin2)
            print(f"Created admin: {admin2_email}")

        # 2. Create Fundraisers
        fr1 = models.Fundraiser(
            full_name="Rajesh Kumar",
            email="rajesh@example.com",
            phone="9876543210",
            kyc_verified=True
        )
        db.add(fr1)
        db.flush()

        # 3. Create Campaigns
        campaigns_data = [
            {
                "title": "Emergency Cancer Treatment for Rahul",
                "short": "Rahul needs an urgent bone marrow transplant to fight Stage 3 leukemia. The family has exhausted all savings.",
                "desc": "Rahul is a bright 12-year-old student who was recently diagnosed with Stage 3 leukemia. The only hope for his survival is an urgent bone marrow transplant. The cost of the procedure and post-operative care is beyond his family's reach. Your support can give him a second chance at life.",
                "target": 2500000, "raised": 1653800, "cat": "Medical",
                "img": "https://images.unsplash.com/photo-1581056771107-2475d5639f43?auto=format&fit=crop&q=80&w=800"
            },
            {
                "title": "Education Fund for Orphan Children",
                "short": "Providing school supplies, coaching, and nutrition for 50 orphan children. We aim to support their higher studies.",
                "desc": "Education is the key to breaking the cycle of poverty. We are raising funds to support 50 children who have lost their parents. This fund will cover their school fees, books, uniforms, and daily nutrition, ensuring they don't lose out on a bright future.",
                "target": 500000, "raised": 155000, "cat": "Education",
                "img": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800"
            },
            {
                "title": "Community Water Well Project",
                "short": "Building a sustainable water well for a village facing severe drought conditions. This will benefit 200 families.",
                "desc": "Access to clean water is a basic human right. This village has been suffering from chronic water scarcity for years. We plan to build a deep-bore well powered by solar energy to provide a permanent solution for 200 families. No more walking 5km for a bucket of water.",
                "target": 350000, "raised": 63000, "cat": "Infrastructure",
                "img": "https://images.unsplash.com/photo-1541252260733-5433d3e34dd3?auto=format&fit=crop&q=80&w=800"
            },
            {
                "title": "Life-Saving Heart Surgery for Baby Aisha",
                "short": "Aisha is just 6 months old and was born with a complex heart defect. She needs immediate surgery to survive.",
                "desc": "Baby Aisha was born with a critical heart condition that requires specialized surgery before she turns one. Her father works as a daily wage laborer and cannot afford the astronomical hospital bills. Time is running out for little Aisha.",
                "target": 800000, "raised": 256000, "cat": "Medical",
                "img": "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800"
            },
            {
                "title": "Plant 10,000 Trees in Urban Areas",
                "short": "Help us combat rising temperatures by planting native trees across our city streets and community parks.",
                "desc": "Urban heat islands are making our cities unlivable. We are launching a massive greening initiative to plant and maintain 10,000 native saplings. These trees will provide shade, absorb CO2, and restore local biodiversity.",
                "target": 150000, "raised": 58450, "cat": "Environment",
                "img": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800"
            },
            {
                "title": "New Shelter for Street Dogs",
                "short": "Our current shelter is overcrowded. We need funds to build a larger, safer facility for rescued street dogs.",
                "desc": "Every stray dog deserves a life free from hunger and abuse. Our current space can only house 20 dogs, but the need is far greater. We are raising funds to build a state-of-the-art rescue center with an on-site clinic.",
                "target": 450000, "raised": 126000, "cat": "Animal Welfare",
                "img": "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"
            },
            {
                "title": "Scholarships for Tribal Students",
                "short": "Help 100 talented students from tribal communities pursue higher education by covering their tuition fees.",
                "desc": "Financial constraints should not stop talent. We have identified 100 brilliant students from remote tribal areas who have cleared college entrance exams but lack the funds to enroll. Your contribution will pave their path to professional success.",
                "target": 1200000, "raised": 486000, "cat": "Education",
                "img": "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800"
            },
            {
                "title": "Emergency Heart Surgery for Baby Kabir",
                "short": "Kabir needs a life-saving arterial switch procedure. His family is desperately seeking financial aid.",
                "desc": "Kabir was born with TGA, a serious heart condition. He needs surgery at the earliest to ensure his heart functions normally. Let's come together to save this precious life and bring a smile back to his parents' faces.",
                "target": 1200000, "raised": 452000, "cat": "Medical",
                "img": "https://images.unsplash.com/photo-1536640712247-c7553b3e2641?auto=format&fit=crop&q=80&w=800"
            },
            {
                "title": "Sustainable Farming Kits for Farmers",
                "short": "Providing organic seeds and toolkits to 100 small-scale farmers to promote sustainable agriculture.",
                "desc": "Traditional farming is becoming harder due to soil degradation. We are providing organic farming kits that include vermicompost, heirloom seeds, and natural pesticides to help 100 farmers transition to sustainable practices.",
                "target": 200000, "raised": 45000, "cat": "Livelihood",
                "img": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800"
            },
            {
                "title": "Medical Support for Senior Citizens",
                "short": "Ensuring free health checkups and medicines for 200 elderly people living in destitute conditions.",
                "desc": "Many seniors live alone with no financial support for medical emergencies. This program provides monthly health screenings, essential medicines, and elderly care support to 200 seniors in our community.",
                "target": 600000, "raised": 180000, "cat": "Healthcare",
                "img": "https://images.unsplash.com/photo-1581578731548-c64695ce6958?auto=format&fit=crop&q=80&w=800"
            },
            {
                "title": "Disaster Relief for Flood Victims",
                "short": "Providing immediate food, water, and shelter kits to families displaced by the recent monsoon floods.",
                "desc": "Massive floods have left thousands homeless in the coastal regions. Our team is on the ground distributing 'survival kits' containing dry ration, blankets, and hygiene products. Your contribution helps us reach more families.",
                "target": 1500000, "raised": 920000, "cat": "Relief",
                "img": "https://images.unsplash.com/photo-1469571486040-0badfea0941c?auto=format&fit=crop&q=80&w=800"
            },
            {
                "title": "Solar Lighting for Remote Villages",
                "short": "Bringing light to 50 homes in off-grid tribal hamlets using sustainable solar home lighting systems.",
                "desc": "For generations, these families have lived in darkness after sunset. We are installing standalone solar units that power 3 LED bulbs and a mobile charging port for 50 homes, improving safety and enabling children to study.",
                "target": 400000, "raised": 112000, "cat": "Infrastructure",
                "img": "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800"
            }
        ]

        # Bulk create campaigns
        import random
        from datetime import datetime, timedelta

        donor_names = ["Amit Singh", "Sneha Kapur", "Priya Sharma", "Rahul Verma", "Ananya Iyer", 
                       "Vikram Seth", "Zoya Khan", "Arjun Gupta", "Meera Reddy", "Siddharth Malhotra"]

        for c in campaigns_data:
            new_campaign = models.Campaign(
                title=c["title"],
                short_description=c["short"],
                description=c["desc"],
                target_amount=Decimal(str(c["target"])),
                raised_amount=Decimal(str(c["raised"])),
                category=c["cat"],
                status="approved",
                fundraiser_id=fr1.id,
                image_url=c["img"]
            )
            db.add(new_campaign)
            db.flush()

            # Add multiple images for each to use the gallery feature
            db.add(models.CampaignImage(campaign_id=new_campaign.id, image_url=c["img"], is_primary=True))
            # Secondary image for gallery
            secondary_map = {
                "Medical": "https://images.unsplash.com/photo-1505751172107-597cd5577367?auto=format&fit=crop&q=80&w=800",
                "Education": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
                "Environment": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
                "Infrastructure": "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800"
            }
            db.add(models.CampaignImage(campaign_id=new_campaign.id, 
                                      image_url=secondary_map.get(c["cat"], "https://images.unsplash.com/photo-1538108197017-c1b89c0ef31c?auto=format&fit=crop&q=80&w=800"), 
                                      is_primary=False))

            # --- GENERATE MATCHING DONATIONS ---
            remaining_to_seed = Decimal(str(c["raised"]))
            num_donors = random.randint(5, 12)
            
            for i in range(num_donors):
                if i == num_donors - 1:
                    donation_amount = remaining_to_seed
                else:
                    # Random amount between 1% and 30% of remaining
                    factor = Decimal(str(random.uniform(0.1, 0.4)))
                    donation_amount = (remaining_to_seed * factor).quantize(Decimal("1.00"))
                    if donation_amount < Decimal("100"): donation_amount = Decimal("100")
                    if donation_amount >= remaining_to_seed: donation_amount = remaining_to_seed / 2
                
                if remaining_to_seed <= 0: break

                donor = random.choice(donor_names)
                db.add(models.Donation(
                    campaign_id=new_campaign.id,
                    donor_name=donor,
                    donor_email=f"{donor.lower().replace(' ', '.')}@example.com",
                    amount=donation_amount,
                    payment_status="captured",
                    payment_method=random.choice(["upi", "card", "netbanking"]),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
                ))
                remaining_to_seed -= donation_amount

        db.commit()
        print("Successfully seeded diverse sample data with matching donation records!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
