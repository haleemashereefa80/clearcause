from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, database, utils
from pydantic import BaseModel
import os
from datetime import timedelta

router = APIRouter()

class AdminLogin(BaseModel):
    email: str
    password: str

class StatusUpdate(BaseModel):
    status: str

class VolunteerAssign(BaseModel):
    volunteer_id: str
    request_id: str
    notes: str = None

class CampaignImageCreate(BaseModel):
    image_url: str
    is_primary: bool = False

@router.post("/campaigns/{campaign_id}/images")
def add_campaign_image(campaign_id: str, image_data: CampaignImageCreate, db: Session = Depends(database.get_db)):
    campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    new_image = models.CampaignImage(
        campaign_id=campaign_id,
        image_url=image_data.image_url,
        is_primary=image_data.is_primary
    )
    db.add(new_image)
    db.commit()
    return {"status": "success", "image_id": new_image.id}

@router.post("/login")
def login(login_data: AdminLogin, db: Session = Depends(database.get_db)):
    admin = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not admin or not utils.security.verify_password(login_data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = utils.security.create_access_token(data={"sub": admin.email, "role": "admin"})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(database.get_db)):
    total_raised = db.query(func.sum(models.Donation.amount)).filter(models.Donation.payment_status == "captured").scalar() or 0
    pending_count = db.query(models.FundraiserRequest).filter(models.FundraiserRequest.status == "submitted").count()
    active_campaigns = db.query(models.Campaign).filter(models.Campaign.status == "approved").count()
    total_donations = db.query(models.Donation).filter(models.Donation.payment_status == "captured").count()
    
    return {
        "total_raised": float(total_raised),
        "pending_requests": pending_count,
        "active_campaigns": active_campaigns,
        "total_donations": total_donations
    }

@router.get("/donations")
def get_all_donations(db: Session = Depends(database.get_db)):
    donations = db.query(models.Donation).order_by(models.Donation.created_at.desc()).all()
    results = []
    for d in donations:
        campaign = db.query(models.Campaign).filter(models.Campaign.id == d.campaign_id).first()
        results.append({
            "id": str(d.id),
            "campaign_title": campaign.title if campaign else "Unknown Campaign",
            "donor_name": d.donor_name,
            "amount": float(d.amount),
            "status": d.payment_status,
            "method": d.payment_method,
            "payment_id": d.payment_id,
            "date": d.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return results

@router.get("/requests")
def get_fundraiser_requests(db: Session = Depends(database.get_db)):
    return db.query(models.FundraiserRequest).order_by(models.FundraiserRequest.created_at.desc()).all()

@router.get("/requests/{request_id}")
def get_request_details(request_id: str, db: Session = Depends(database.get_db)):
    req = db.query(models.FundraiserRequest).filter(models.FundraiserRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    fundraiser = db.query(models.Fundraiser).filter(models.Fundraiser.id == req.fundraiser_id).first()
    bank_details = db.query(models.FundraiserBankDetail).filter(models.FundraiserBankDetail.fundraiser_id == req.fundraiser_id).first()
    assignment = db.query(models.VolunteerAssignment).filter(models.VolunteerAssignment.request_id == request_id).first()
    
    volunteer = None
    if assignment:
        volunteer = db.query(models.Volunteer).filter(models.Volunteer.id == assignment.volunteer_id).first()

    # Get descriptive images
    images = db.query(models.RequestImage).filter(models.RequestImage.request_id == request_id).all()

    return {
        "request": req,
        "fundraiser": fundraiser,
        "bank_details": bank_details,
        "assignment": assignment,
        "volunteer": volunteer,
        "images": [img.image_url for img in images]
    }

@router.patch("/requests/{request_id}/status")
def update_request_status(request_id: str, status_data: StatusUpdate, db: Session = Depends(database.get_db)):
    req = db.query(models.FundraiserRequest).filter(models.FundraiserRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req.status = status_data.status
    db.commit()
    return {"status": "success", "new_status": req.status}

@router.post("/approve/{request_id}")
def approve_request(request_id: str, db: Session = Depends(database.get_db)):
    req = db.query(models.FundraiserRequest).filter(models.FundraiserRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req.status = "approved"
    
    # Create the actual campaign
    new_campaign = models.Campaign(
        title=req.title,
        description=req.description,
        target_amount=req.target_amount,
        category=req.category,
        status="approved",
        fundraiser_id=req.fundraiser_id
    )
    db.add(new_campaign)
    db.flush() # Get campaign ID

    # Move images from RequestImage to CampaignImage
    request_images = db.query(models.RequestImage).filter(models.RequestImage.request_id == request_id).all()
    
    # Set the first image as the main campaign image_url if available
    first_image_url = None
    if request_images:
        first_image_url = request_images[0].image_url
        new_campaign.image_url = first_image_url
    
    for idx, req_img in enumerate(request_images):
        db.add(models.CampaignImage(
            campaign_id=new_campaign.id,
            image_url=req_img.image_url,
            is_primary=(idx == 0) # Set first one as primary in gallery too
        ))
    
    db.commit()
    return {"status": "approved", "campaign_id": new_campaign.id}

@router.post("/payout")
def record_payout(campaign_id: str, amount: float, reference: str, db: Session = Depends(database.get_db)):
    # Logic to record bank transfer to beneficiary
    return {"status": "success"}

@router.get("/volunteers")
def get_volunteers(db: Session = Depends(database.get_db)):
    volunteers = db.query(models.Volunteer).all()
    results = []
    for v in volunteers:
        assignment = db.query(models.VolunteerAssignment).filter(models.VolunteerAssignment.volunteer_id == v.id).first()
        results.append({
            "volunteer": v,
            "assignment": assignment
        })
    return results

@router.post("/assign-volunteer")
def assign_volunteer(data: VolunteerAssign, db: Session = Depends(database.get_db)):
    # Check if existing assignment exists
    existing = db.query(models.VolunteerAssignment).filter(models.VolunteerAssignment.request_id == data.request_id).first()
    if existing:
        existing.volunteer_id = data.volunteer_id
        existing.status = "assigned"
        existing.notes = data.notes
    else:
        new_assignment = models.VolunteerAssignment(
            volunteer_id=data.volunteer_id,
            request_id=data.request_id,
            notes=data.notes
        )
        db.add(new_assignment)
    
    # Update request status to 'under_review' automatically
    req = db.query(models.FundraiserRequest).filter(models.FundraiserRequest.id == data.request_id).first()
    if req:
        req.status = "under_review"

    db.commit()
    return {"status": "success"}
