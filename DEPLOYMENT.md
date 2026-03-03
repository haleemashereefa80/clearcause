# Deployment Guide - Clear Cause

Follow these steps to deploy Clear Cause to a production environment.

## 1. Backend (FastAPI + Supabase)
We recommend deploying the backend to **Render**, **Railway**, or **DigitalOcean**.

### Steps:
1. **Database**: Ensure your Supabase instance is active and accessible via the `DATABASE_URL`.
2. **Environment Variables**: Add all variables from `.env` to your hosting provider's "Environment Variables" section.
3. **Command**: Set the start command to:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
   ```

## 2. Frontend (React + Vite)
We recommend deploying the frontend to **Vercel** or **Netlify**.

### Steps:
1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Environment Variable**: Set `VITE_API_URL` to your deployed backend URL (if applicable).

## 3. SSL & Security
- Ensure your backend domain uses HTTPS (Render/Vercel handles this automatically).
- Update your Razorpay/Payment configuration with the production domain.

## 4. Admin Access
Your admin portal will be live at `https://yourdomain.com/admin-access-portal`. Ensure you have invited/created the admin user via the `create_admin.py` script before going live.
