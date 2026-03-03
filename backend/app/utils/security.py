import os
import base64
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from cryptography.fernet import Fernet
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# AES Encryption for Bank Details
AES_KEY = os.getenv("AES_ENCRYPTION_KEY")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_fernet():
    if not AES_KEY:
        raise ValueError("AES_ENCRYPTION_KEY not found in environment")
    
    key_bytes = AES_KEY.encode()
    # Deriving a 32-byte key for Fernet
    key_32 = hashlib.sha256(key_bytes).digest()
    fernet_key = base64.urlsafe_b64encode(key_32)
    return Fernet(fernet_key)

def encrypt_data(data: str) -> str:
    f = get_fernet()
    return f.encrypt(data.encode()).decode()

def decrypt_data(token: str) -> str:
    f = get_fernet()
    return f.decrypt(token.encode()).decode()

def mask_account_number(acc_no: str) -> str:
    if len(acc_no) <= 4:
        return "****"
    return "*" * (len(acc_no) - 4) + acc_no[-4:]
