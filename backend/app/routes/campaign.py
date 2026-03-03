from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from .. import models, database
from pydantic import BaseModel
from typing import List, Optional
import uuid

router = APIRouter()

class CampaignBase(BaseModel):
    title: str
    description: str
    short_description: str
    target_amount: float
    category: str
    image_url: Optional[str] = None

class CampaignResponse(CampaignBase):
    id: uuid.UUID
    raised_amount: float
    status: str
    fundraiser_name: Optional[str] = "Anonymous"
    
    class Config:
        orm_mode = True

@router.get("/", response_model=List[CampaignResponse])
def get_campaigns(db: Session = Depends(database.get_db)):
    results = db.query(
        models.Campaign,
        models.Fundraiser.full_name.label("fundraiser_name")
    ).join(
        models.Fundraiser, 
        models.Campaign.fundraiser_id == models.Fundraiser.id
    ).filter(models.Campaign.status == "approved").all()
    
    campaigns = []
    for campaign, f_name in results:
        campaign.fundraiser_name = f_name
        campaigns.append(campaign)
    
    return campaigns

@router.get("/{campaign_id}")
def get_campaign_detail(campaign_id: str, db: Session = Depends(database.get_db)):
    campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Get recent donations for this campaign
    donations_query = db.query(models.Donation).filter(
        models.Donation.campaign_id == campaign_id,
        models.Donation.payment_status == "captured"
    )
    
    donations = donations_query.order_by(models.Donation.created_at.desc()).limit(10).all()
    
    # Calculate actual raised amount from donations to ensure consistency
    from sqlalchemy import func
    actual_raised = db.query(func.sum(models.Donation.amount)).filter(
        models.Donation.campaign_id == campaign_id,
        models.Donation.payment_status == "captured"
    ).scalar() or 0
    
    # Sync the campaign's raised_amount if it's different (optional, but good for other lists)
    if campaign.raised_amount != actual_raised:
        campaign.raised_amount = actual_raised
        db.commit()

    # Get campaign images
    images = db.query(models.CampaignImage).filter(models.CampaignImage.campaign_id == campaign_id).all()
    
    return {
        "campaign": campaign,
        "donations": donations,
        "images": [img.image_url for img in images]
    }

class FundraiserRequestCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    title: str
    description: str
    target_amount: float
    category: str
    # KYC Details & Documents
    aadhaar_number: str
    pan_number: str
    kyc_aadhaar_pan: str
    kyc_address_proof: str
    kyc_selfie: str
    supporting_documents: Optional[str] = None
    # Bank details
    account_holder: str
    account_number: str
    ifsc: str
    bank_name: str
    passbook_image: str
    descriptive_images: Optional[List[str]] = []

@router.post("/request")
def submit_fundraiser_request(request: FundraiserRequestCreate, db: Session = Depends(database.get_db)):
    # 1. Create or get Fundraiser
    fundraiser = models.Fundraiser(
        full_name=request.full_name,
        email=request.email,
        phone=request.phone
    )
    db.add(fundraiser)
    db.flush() # Get ID
    
    # 2. Create Fundraiser Request
    new_request = models.FundraiserRequest(
        fundraiser_id=fundraiser.id,
        title=request.title,
        description=request.description,
        target_amount=request.target_amount,
        category=request.category,
        aadhaar_number=request.aadhaar_number,
        pan_number=request.pan_number,
        kyc_aadhaar_pan=request.kyc_aadhaar_pan,
        kyc_address_proof=request.kyc_address_proof,
        kyc_selfie=request.kyc_selfie,
        supporting_documents=request.supporting_documents
    )
    db.add(new_request)
    
    # 3. Store Bank Details (Encrypted)
    from ..utils import security
    bank_details = models.FundraiserBankDetail(
        fundraiser_id=fundraiser.id,
        account_holder_name=request.account_holder,
        encrypted_account_number=security.encrypt_data(request.account_number),
        masked_account_number=security.mask_account_number(request.account_number),
        ifsc_code=request.ifsc,
        bank_name=request.bank_name,
        passbook_image=request.passbook_image
    )
    db.add(bank_details)

    # 4. Store Descriptive Images
    if request.descriptive_images:
        for img_url in request.descriptive_images:
            db.add(models.RequestImage(request_id=new_request.id, image_url=img_url))
    
    db.commit()
    return {"message": "Request submitted successfully and is under review"}
