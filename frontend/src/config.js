/**
 * Base API URL configuration.
 * In development with Vite proxy, or in production on Vercel with rewrites,
 * this defaults to '/api'. An environment variable VITE_API_URL can override it if needed.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
