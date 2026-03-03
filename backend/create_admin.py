import sys
import os
from sqlalchemy.orm import Session

# Add the parent directory to sys.path to import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app import models
from app.utils import security

def create_admin(name, email, password):
    # Ensure tables are created first
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            print(f"User with email {email} already exists.")
            return

        # Create admin user
        password_hash = security.hash_password(password)
        new_user = models.User(
            name=name,
            email=email,
            password_hash=password_hash,
            role="admin"
        )
        db.add(new_user)
        db.commit()
        print(f"Admin user {name} ({email}) created successfully!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("--- Create Admin User ---")
    name = input("Enter Name: ")
    email = input("Enter Email: ")
    password = input("Enter Password: ")
    
    create_admin(name, email, password)
