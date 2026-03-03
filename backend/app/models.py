from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="admin")
    created_at = Column(DateTime, server_default=func.now())

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text)
    short_description = Column(Text)
    image_url = Column(Text)
    category = Column(String)
    target_amount = Column(Numeric(12, 2), nullable=False)
    raised_amount = Column(Numeric(12, 2), default=0)
    status = Column(String, default="pending") # pending | approved | rejected | completed
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    fundraiser_id = Column(UUID(as_uuid=True), ForeignKey("fundraisers.id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Donation(Base):
    __tablename__ = "donations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"))
    donor_name = Column(String, nullable=False)
    donor_email = Column(String, nullable=False)
    donor_pan = Column(String)
    amount = Column(Numeric(12, 2), nullable=False)
    is_anonymous = Column(Boolean, default=False)
    
    # Razorpay details
    order_id = Column(String, unique=True)
    payment_id = Column(String, unique=True)
    payment_status = Column(String, default="created")
    
    # Payment method details
    payment_method = Column(String)
    bank = Column(String)
    wallet = Column(String)
    upi_id = Column(String)
    card_network = Column(String)
    
    ip_address = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class CampaignImage(Base):
    __tablename__ = "campaign_images"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"))
    image_url = Column(Text, nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

class Fundraiser(Base):
    __tablename__ = "fundraisers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    address = Column(Text)
    kyc_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

class FundraiserRequest(Base):
    __tablename__ = "fundraiser_requests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fundraiser_id = Column(UUID(as_uuid=True), ForeignKey("fundraisers.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    target_amount = Column(Numeric(12, 2))
    
    # KYC Details & Documents
    aadhaar_number = Column(String)
    pan_number = Column(String)
    kyc_aadhaar_pan = Column(String) # URL or reference
    kyc_address_proof = Column(String) # URL or reference
    kyc_selfie = Column(String) # URL or reference
    supporting_documents = Column(Text) # JSON list of other docs
    
    status = Column(String, default="submitted")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class FundraiserBankDetail(Base):
    __tablename__ = "fundraiser_bank_details"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fundraiser_id = Column(UUID(as_uuid=True), ForeignKey("fundraisers.id"))
    account_holder_name = Column(String, nullable=False)
    encrypted_account_number = Column(String, nullable=False)
    masked_account_number = Column(String, nullable=False)
    ifsc_code = Column(String, nullable=False)
    bank_name = Column(String)
    branch = Column(String)
    passbook_image = Column(String) # URL or reference for first page of passbook
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

class Volunteer(Base):
    __tablename__ = "volunteers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    verification_details = Column(Text)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

class VolunteerAssignment(Base):
    __tablename__ = "volunteer_assignments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id = Column(UUID(as_uuid=True), ForeignKey("volunteers.id"))
    request_id = Column(UUID(as_uuid=True), ForeignKey("fundraiser_requests.id"))
    status = Column(String, default="assigned") # assigned | in_progress | completed | failed
    notes = Column(Text)
    assigned_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action = Column(String, nullable=False)
    performed_by = Column(String)
    entity_type = Column(String)
    entity_id = Column(UUID(as_uuid=True))
    event_data = Column(Text) # Storing JSON as text for simplicity in MVP
    ip_address = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class RequestImage(Base):
    __tablename__ = "request_images"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("fundraiser_requests.id"))
    image_url = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
