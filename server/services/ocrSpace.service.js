/**
 * OCR.Space API Service
 * Extracts text from image/PDF URLs using the OCR.Space free-tier API.
 * Docs: https://ocr.space/ocrapi
 */

import axios from 'axios';

const OCR_API_URL = 'https://api.ocr.space/parse/image';

/**
 * Perform OCR on a file accessible at the given URL.
 * @param {string} fileUrl - Publicly accessible URL (Cloudinary URL)
 * @param {string} [language='eng'] - OCR language code
 * @returns {Promise<string>} - Extracted plain text
 */
export const extractTextFromUrl = async (fileUrl, language = 'eng') => {
  const apiKey = process.env.OCR_SPACE_API_KEY;

  if (!apiKey) {
    throw new Error('OCR_SPACE_API_KEY is not set in environment variables.');
  }

  const params = new URLSearchParams();
  params.append('url', fileUrl);
  params.append('apikey', apiKey);
  params.append('language', language);
  params.append('isOverlayRequired', 'false');
  params.append('detectOrientation', 'true');
  params.append('scale', 'true');
  params.append('isTable', 'true'); // Better table recognition for lab reports
  params.append('OCREngine', '2'); // Engine 2 has better accuracy for medical docs

  let response;
  try {
    response = await axios.post(OCR_API_URL, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 60000, // 60s timeout for large PDFs
    });
  } catch (networkError) {
    console.error('[OCRSpace] Network error:', networkError.message);
    throw new Error(`OCR.Space network request failed: ${networkError.message}`);
  }

  const data = response.data;

  // OCR.Space returns IsErroredOnProcessing=true on failure
  if (data.IsErroredOnProcessing) {
    const errMsg = data.ErrorMessage?.[0] || data.ErrorDetails || 'Unknown OCR.Space error';
    console.error('[OCRSpace] Processing error:', errMsg);
    throw new Error(`OCR.Space processing error: ${errMsg}`);
  }

  if (!data.ParsedResults || data.ParsedResults.length === 0) {
    throw new Error('OCR.Space returned no parsed results.');
  }

  // Concatenate text from all parsed pages/sections
  const fullText = data.ParsedResults
    .map((result) => result.ParsedText || '')
    .join('\n')
    .trim();

  if (!fullText) {
    throw new Error('OCR.Space extracted no readable text from the document. The document may be blank or unreadable.');
  }

  console.log(`[OCRSpace] Successfully extracted ${fullText.length} characters from ${fileUrl}`);
  return fullText;
};

export default { extractTextFromUrl };
