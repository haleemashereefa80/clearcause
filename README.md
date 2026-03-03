# Clear Cause - Transparent Crowdfunding Platform

Clear Cause is a modern, full-stack crowdfunding platform designed with a focus on transparency, trust, and premium user experience. It allows users to raise funds for medical emergencies, community projects, and personal causes with ease.

## ✨ Features

- **Dynamic Homepage**: Live featured campaigns fetched directly from the database.
- **Verified Campaigns**: Every campaign is manually verified with document support.
- **Premium UI/UX**:
    - Vibrant, high-contrast Brand Purple theme.
    - Fully responsive design.
    - Clickable campaign cards for easy navigation.
- **Secure Donations**:
    - **Dynamic QR Generation**: Real-time UPI QR codes based on the donation amount.
    - **Custom Tipping**: 0% platform fee with optional tipping (including a 0% tip option).
    - **Secure Payouts**: AES-256 encryption for beneficiary bank details.
- **Hidden Admin Portal**: Access managed through `/admin-access-portal` for enhanced security.
- **Fundraiser Workflow**: Step-by-step request form with real-time account number validation.

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**
- **Tailwind CSS**
- **Lucide React** (Icons)
- **Axios** (API Requests)

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** (ORM)
- **PostgreSQL** (Supabase)
- **Bcrypt** (Password Hashing)
- **Cryptography** (AES bank detail encryption)

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL (Supabase recommended)

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Create and activate a virtual environment.
3. Install dependencies: `pip install -r requirements.txt`
4. Set up your `.env` file (see `.env.template`).
5. Run the server: `uvicorn app.main:app --reload`
6. (Optional) Seed the database: `python seed_db.py`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## 🔐 Environment Variables
Key variables required in `.env`:
- `DATABASE_URL`: Your Supabase/PostgreSQL connection string.
- `VITE_UPI_ID`: Your official business UPI ID for receiving donations via QR code.
- `JWT_SECRET`: For authentication.
- `AES_ENCRYPTION_KEY`: For bank data security.

## 📄 License
Clear Cause is an open-source project.
