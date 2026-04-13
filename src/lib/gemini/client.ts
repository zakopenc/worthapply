import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-3.1-pro-preview';

let genAI: GoogleGenerativeAI | null = null;
let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

export function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getModel() {
  if (!model) {
    const client = getGeminiClient();
    model = client.getGenerativeModel({ model: MODEL_NAME });
  }

  return model;
}

function extractJsonPayload(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith('```')) {
    const fenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    return fenced.trim();
  }

  return trimmed;
}

const GEMINI_TIMEOUT_MS = 60_000; // 60 seconds

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Gemini API timed out after ${ms}ms`)), ms);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const model = getModel();
  const result = await withTimeout(model.generateContent(prompt), GEMINI_TIMEOUT_MS);
  const text = extractJsonPayload(result.response.text());

  try {
    return JSON.parse(text) as T;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');
    return JSON.parse(jsonMatch[0]) as T;
  }
}

export async function generateText(prompt: string): Promise<string> {
  const model = getModel();
  const result = await withTimeout(model.generateContent(prompt), GEMINI_TIMEOUT_MS);
  return result.response.text();
}
