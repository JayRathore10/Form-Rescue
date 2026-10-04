import { apiFetch } from "./api";

/**
 * Upload a form file (image or PDF)
 * @param {File} file
 * @returns {Promise<{ success: boolean, message: string, file: { filename: string, originalName: string, size: number, mimetype: string } }>}
 */
export async function uploadFormFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  return await apiFetch("/api/v1/file/uploads", {
    method: "POST",
    body: formData,
  });
}

/**
 * Extract structured form data using OCR & Gemma
 * @param {string} filename - Filename returned from uploadFormFile
 * @returns {Promise<{ success: boolean, filename: string, form: { title: string, fields: Array<{ name: string, type: string, options?: string[], required: boolean | null, value: string | null }>, documents: string[] } }>}
 */
export async function extractFormFields(filename) {
  return await apiFetch(`/api/v1/ocr/extract/${encodeURIComponent(filename)}`, {
    method: "GET",
  });
}

/**
 * Full analyze pipeline: uploads file to backend and extracts structured fields
 * @param {File} file
 */
export async function analyzeFormFile(file) {
  const uploadRes = await uploadFormFile(file);
  const uploadedFilename = uploadRes?.file?.filename;

  if (!uploadedFilename) {
    throw new Error("File upload succeeded but no filename was returned.");
  }

  const ocrRes = await extractFormFields(uploadedFilename);
  return ocrRes?.form || null;
}

/**
 * Ask AI question / prompt
 * @param {string} prompt
 * @returns {Promise<{ text: string }>}
 */
export async function askAiHelp(prompt) {
  return await apiFetch("/api/v1/ai/ask", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

/**
 * Get an AI explanation and advice for a specific form field
 * @param {Object} params
 * @param {string} params.fieldName
 * @param {string} [params.fieldType]
 * @param {string} [params.formTitle]
 * @param {string} [params.currentValue]
 */
export async function getFieldAiExplanation({ fieldName, fieldType = "text", formTitle = "Form", currentValue = "" }) {
  const prompt = `You are a helpful form assistant. The user is filling out a "${formTitle}".
Field Name: "${fieldName}"
Field Type: "${fieldType}"
Current Value: "${currentValue || "(empty)"}"

Please provide a concise, 1-2 sentence explanation of what this field is asking for and any helpful tips for filling it correctly.`;

  const res = await askAiHelp(prompt);
  return res?.text || "";
}
