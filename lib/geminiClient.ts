import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

export function getGoogleGenAIClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY env variable is required');
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}
