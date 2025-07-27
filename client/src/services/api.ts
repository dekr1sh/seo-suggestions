// src/services/api.ts

// Import your custom types
import type { Analysis, AnalysisHistoryItem, AISuggestions } from '../types/analysis';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getToken = (): string | null => localStorage.getItem('token');

// Define a custom HttpError class that extends Error
class HttpError extends Error {
  statusCode: number;
  details?: unknown; 

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

// Define a common interface for backend error responses
interface BackendErrorResponse {
  message?: string;
  error?: string;
  details?: unknown;
  statusCode?: number;
}

// --- Centralized Error Handling for Fetch Responses ---
async function handleResponse(res: Response): Promise<Response> {
  if (!res.ok) {
    let errorInfo: BackendErrorResponse = {};
    try {
      const errorText = await res.text();
      errorInfo = JSON.parse(errorText) as BackendErrorResponse;
    } catch (e: unknown) {
      console.error('Failed to parse backend error response as JSON:', e);
      errorInfo.message = res.statusText || 'An unknown error occurred.';
    }

    const statusCode = res.status;
    const errorMessage = errorInfo.message || errorInfo.error || res.statusText || 'Something went wrong on the server.';

    throw new HttpError(errorMessage, statusCode, errorInfo.details);
  }
  return res;
}

// --- AUTHENTICATION API CALLS ---

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const validatedRes = await handleResponse(res);
  const data: { token?: string } = await validatedRes.json();
  if (!data.token) {
    throw new HttpError('Login response missing token.', res.status || 500);
  }
  return data.token;
}

export async function register(email: string, password: string): Promise<boolean> {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  await handleResponse(res);
  return true;
}

// --- ANALYSIS & RECOMMENDATIONS API CALLS ---

export async function analyzeUrl(url: string): Promise<Analysis> { // <-- Updated return type to Analysis
  const token = getToken();
  if (!token) throw new HttpError('Authentication required.', 401);

  const res = await fetch(`${API}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url }),
  });
  const validatedRes = await handleResponse(res);
  return await validatedRes.json() as Analysis; // <-- Cast the JSON response to Analysis
}

export async function getRecommendations(analysisId: number): Promise<{ message: string; analysisId: number; suggestions: AISuggestions }> { // <-- Updated return type
  const token = getToken();
  if (!token) throw new HttpError('Authentication required.', 401);

  const res = await fetch(`${API}/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ analysisId }),
  });
  const validatedRes = await handleResponse(res);
  // Based on your backend, it returns an object with message, analysisId, and suggestions
  return await validatedRes.json() as { message: string; analysisId: number; suggestions: AISuggestions };
}

// --- HISTORY MANAGEMENT API CALLS ---

export async function getHistory(): Promise<AnalysisHistoryItem[]> { // <-- Updated return type to AnalysisHistoryItem[]
  const token = getToken();
  if (!token) throw new HttpError('Authentication required.', 401);

  const res = await fetch(`${API}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const validatedRes = await handleResponse(res);
  return await validatedRes.json() as AnalysisHistoryItem[]; // <-- Cast the JSON response
}

export async function getAnalysis(id: number): Promise<Analysis> { // <-- Updated return type to Analysis
  const token = getToken();
  if (!token) throw new HttpError('Authentication required.', 401);

  const res = await fetch(`${API}/history/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const validatedRes = await handleResponse(res);
  return await validatedRes.json() as Analysis; // <-- Cast the JSON response
}

export async function deleteAnalysis(id: number): Promise<{ message: string; id: number; url: string }> { // <-- Updated return type
  const token = getToken();
  if (!token) throw new HttpError('Authentication required.', 401);

  const res = await fetch(`${API}/history/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const validatedRes = await handleResponse(res);
  // Based on your backend, it returns an object with message, id, and url
  return await validatedRes.json() as { message: string; id: number; url: string };
}