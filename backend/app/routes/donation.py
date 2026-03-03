from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import razorpay
import os
import hmac
import hashlib
import json
from .. import models, database, utils
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))

class DonationCreate(BaseModel):
    campaign_id: str
    donor_name: str
    donor_email: str
    amount: float
    is_anonymous: bool = False
    donor_pan: Optional[str] = None

@router.post("/order")
def create_order(donation: DonationCreate, db: Session = Depends(database.get_db)):
    amount_paise = int(donation.amount * 100)
    
    order_data = {
        "amount": amount_paise,
        "currency": "INR",
        "payment_capture": 1
    }
    
    try:
        razorpay_order = client.order.create(data=order_data)
        
        # Save preliminary donation record
        new_donation = models.Donation(
            campaign_id=donation.campaign_id,
            donor_name=donation.donor_name,
            donor_email=donation.donor_email,
            donor_pan=donation.donor_pan,
            amount=donation.amount,
            is_anonymous=donation.is_anonymous,
            order_id=razorpay_order['id'],
            payment_status="created"
        )
        db.add(new_donation)
        db.commit()
        
        return {
            "order_id": razorpay_order['id'],
            "amount": donation.amount,
            "currency": "INR",
            "key": os.getenv("RAZORPAY_KEY_ID")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Razorpay Error: {str(e)}")

@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(database.get_db)):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
    
    # Verify signature
    expected_signature = hmac.new(
        secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected_signature, signature):
        print(f"WEBHOOK ERROR: Invalid signature. Expected: {expected_signature}, Received: {signature}")
        raise HTTPException(status_code=400, detail="Invalid Webhook Signature")
    
    print(f"WEBHOOK RECEIVED: Signature verified.")
    
    data = json.loads(body)
    event = data.get("event")
    print(f"WEBHOOK EVENT: {event}")
    
    if event in ["payment.captured", "order.paid"]:
        if event == "order.paid":
            order_payload = data["payload"]["order"]["entity"]
            order_id = order_payload["id"]
            # Extract payment details from the payment entity in the same payload
            payment_payload = data["payload"].get("payment", {}).get("entity", {})
            payment_id = payment_payload.get("id", "captured_via_order")
        else:
            payment_payload = data["payload"]["payment"]["entity"]
            order_id = payment_payload["order_id"]
            payment_id = payment_payload["id"]
        
        print(f"PROCESSING SUCCESS: Order ID: {order_id}, Event: {event}")
        
        donation = db.query(models.Donation).filter(models.Donation.order_id == order_id).first()
        if donation and donation.payment_status != "captured":
            donation.payment_status = "captured"
            donation.payment_id = payment_id
            donation.payment_method = payment_payload.get("method")
            donation.bank = payment_payload.get("bank")
            donation.wallet = payment_payload.get("wallet")
            donation.upi_id = payment_payload.get("vpa")
            
            campaign = db.query(models.Campaign).filter(models.Campaign.id == donation.campaign_id).first()
            if campaign:
                if campaign.raised_amount is None:
                    campaign.raised_amount = 0
                campaign.raised_amount += donation.amount
                print(f"SUCCESS: Updated campaign {campaign.id}. New amount: {campaign.raised_amount}")
            
            db.commit()
        else:
            print(f"WEBHOOK SKIP: Donation not found or already captured for order {order_id}")
            
    return {"status": "ok"}
