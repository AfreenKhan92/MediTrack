/**
 * OpenRouter AI Service
 * Uses official OpenAI SDK configured for OpenRouter.ai
 *
 * Client setup:
 * const client = new OpenAI({
 *   apiKey: process.env.OPENROUTER_API_KEY,
 *   baseURL: "https://openrouter.ai/api/v1",
 * });
 */

import OpenAI from 'openai';

let openAIClient = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getErrorStatus = (error) => error?.status || error?.response?.status || error?.cause?.status || null;

const isRetryableOpenRouterError = (error) => {
  const status = getErrorStatus(error);
  const message = String(error?.message || '').toLowerCase();

  return status === 429 || status === 408 || status >= 500 || message.includes('rate limit');
};

const createCompletionWithRetry = async ({ client, model, messages, temperature, label }) => {
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await client.chat.completions.create({
        model,
        messages,
        temperature,
      });
    } catch (error) {
      const status = getErrorStatus(error);
      const retryable = attempt < maxAttempts && isRetryableOpenRouterError(error);

      if (!retryable) {
        throw error;
      }

      const delayMs = Math.min(1000 * attempt, 2000);
      console.warn(`[OpenRouter] ${label} attempt ${attempt} failed with ${status || 'unknown'}; retrying in ${delayMs}ms`);
      await sleep(delayMs);
    }
  }

  throw new Error(`[OpenRouter] ${label} failed after ${maxAttempts} attempts`);
};

const getOpenAIClient = () => {
  if (!openAIClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('your_openrouter_api_key')) {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
    }
    openAIClient = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://meditrack.app',
        'X-Title': 'MediTrack Family Health Manager',
      },
    });
  }
  return openAIClient;
};

/**
 * Strip markdown code fences (e.g. ```json ... ```)
 */
const stripMarkdownFences = (text) => {
  if (!text) return '';
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
};

/**
 * Extract structured medical information from OCR text using OpenRouter.
 * Returns clean structured JSON containing all requested medical fields.
 *
 * @param {string} ocrText - Raw OCR text from the document
 * @returns {Promise<Object>} - Parsed medical JSON
 */
export const extractMedicalInfo = async (ocrText) => {
  const client = getOpenAIClient();
  const model = process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';

  const prompt = `You are an expert medical document analyzer. Extract structured information from the following medical report or prescription text.

Return ONLY a valid JSON object. Do NOT include markdown formatting, code block fences, or any explanatory text.

JSON Schema to strictly follow:
{
  "reportTitle": string | null,
  "patientName": string | null,
  "doctorName": string | null,
  "hospital": string | null,
  "hospitalName": string | null,
  "reportDate": string | null,
  "summary": string | null,
  "diagnosis": string | null,
  "medicalConditions": string[],
  "medicines": [
    {
      "name": string,
      "dosage": string | null,
      "frequency": string | null,
      "duration": string | null,
      "instructions": string | null
    }
  ],
  "tests": [
    {
      "testName": string,
      "value": string | null,
      "unit": string | null,
      "referenceRange": string | null,
      "isAbnormal": boolean
    }
  ],
  "testResults": [
    {
      "testName": string,
      "value": string | null,
      "unit": string | null,
      "referenceRange": string | null,
      "isAbnormal": boolean
    }
  ],
  "abnormalValues": string[],
  "recommendations": string | null,
  "observations": string | null,
  "followUpDate": string | null,
  "documentType": "Prescription" | "Lab Test" | "Vaccine Certificate" | "Discharge Summary" | "Other"
}

OCR Text:
---
${ocrText.substring(0, 8000)}
---`;

  const completion = await createCompletionWithRetry({
    client,
    model,
    temperature: 0.1,
    label: 'medical extraction',
    messages: [
      {
        role: 'system',
        content: 'You are a precise medical document parser that outputs clean valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const rawText = completion.choices[0]?.message?.content || '';
  const cleanedText = stripMarkdownFences(rawText);

  let parsed;
  try {
    parsed = JSON.parse(cleanedText);
  } catch (parseError) {
    console.error('[OpenRouter] JSON parse error. Raw output:', cleanedText.substring(0, 500));
    throw new Error(`OpenRouter response could not be parsed as JSON: ${parseError.message}`);
  }

  // Field normalization to guarantee full compatibility with both requested schema & existing UI components
  parsed.hospitalName = parsed.hospitalName || parsed.hospital || null;
  parsed.hospital = parsed.hospital || parsed.hospitalName || null;

  const testList = (parsed.tests && parsed.tests.length > 0)
    ? parsed.tests
    : (parsed.testResults || []);
  parsed.tests = testList;
  parsed.testResults = testList;

  if (!parsed.medicalConditions || parsed.medicalConditions.length === 0) {
    parsed.medicalConditions = parsed.diagnosis ? [parsed.diagnosis] : [];
  }

  if (!parsed.abnormalValues || parsed.abnormalValues.length === 0) {
    parsed.abnormalValues = testList
      .filter((t) => t.isAbnormal)
      .map((t) => `${t.testName}: ${t.value || ''} ${t.unit || ''}`.trim());
  }

  console.log(`[OpenRouter] Extracted medical data using model: ${model}`);
  return parsed;
};

/**
 * Generate a patient-friendly summary using OpenRouter.
 *
 * @param {string} ocrText - Raw OCR text
 * @param {Object} parsedData - Previously parsed JSON data
 * @returns {Promise<string>} - Plain English summary
 */
export const generatePatientSummary = async (ocrText, parsedData) => {
  // Use existing extracted summary if present and detailed
  if (parsedData?.summary && parsedData.summary.length > 80) {
    return parsedData.summary;
  }

  const client = getOpenAIClient();
  const model = process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';

  const parsedContext = parsedData
    ? `\nStructured details:\n${JSON.stringify(parsedData, null, 2).substring(0, 2000)}`
    : '';

  const prompt = `You are a compassionate healthcare assistant. Generate a clear, patient-friendly summary of the medical document.

RULES:
- Explain in simple English what the document is about
- Explain prescribed medicines, dosages, test results, and abnormal findings
- Keep the summary under 200 words
- Write as clean paragraph text without markdown bullet points or headings
- Be clear and reassuring

OCR Text:
---
${ocrText.substring(0, 5000)}
---${parsedContext}

Summary:`;

  const completion = await createCompletionWithRetry({
    client,
    model,
    temperature: 0.3,
    label: 'summary generation',
    messages: [
      { role: 'system', content: 'You are a helpful medical summary generator.' },
      { role: 'user', content: prompt },
    ],
  });

  const summary = (completion.choices[0]?.message?.content || '').trim();
  if (!summary) {
    throw new Error('OpenRouter returned an empty summary.');
  }

  console.log(`[OpenRouter] Generated patient summary (${summary.length} chars)`);
  return summary;
};

export default { extractMedicalInfo, generatePatientSummary };
