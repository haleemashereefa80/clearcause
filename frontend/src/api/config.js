/**
 * Centralized API Configuration
 * 
 * Uses environment variables for production (Vercel) 
 * and falls back to localhost for development.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const UPI_ID = import.meta.env.VITE_UPI_ID || '';
