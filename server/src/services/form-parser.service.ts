import axios from "axios";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "gemma4:e2b";

export interface FormField {
  name: string;
  type:
  | "text"
  | "textarea"
  | "date"
  | "number"
  | "email"
  | "tel"
  | "radio"
  | "select"
  | "checkbox"
  | "signature";
  options?: string[];
  required: boolean | null;
  value: string | null;
}

export interface StructuredForm {
  title: string;
  fields: FormField[];
  documents: string[];
}

export const parseFormWithGemma = async (
  ocrText: string
): Promise<StructuredForm> => {
  const prompt = `
Convert the OCR text below into structured form JSON.

Return ONLY valid JSON.

Rules:
- Do not invent fields.
- Do not invent values.
- Every value must be null.
- Detect field type.
- Detect options such as Yes/No or Male/Female.
- required should be true, false, or null.
- Ignore instructions and page numbers.
- Correct obvious OCR spelling errors.

Schema:

{
  "title": "string",
  "fields": [
    {
      "name": "string",
      "type": "text | textarea | date | number | email | tel | radio | select | checkbox | signature",
      "options": [],
      "required": null,
      "value": null
    }
  ],
  "documents": []
}

OCR:
${ocrText}
`;

  try {
    console.log("📡 Calling Ollama:", MODEL);

    const response = await axios.post(
      OLLAMA_URL,
      {
        model: MODEL,
        prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0,
          num_ctx: 1024,
        },
      },
      {
        timeout: 180000,
      }
    );

    console.log("✅ Ollama status:", response.status);

    console.log("Gemma raw response:");
    console.log(response.data.response);

    if (!response.data?.response) {
      throw new Error("Ollama returned an empty response");
    }

    let parsed: StructuredForm;

    try {
      parsed = JSON.parse(response.data.response);
    } catch (error) {
      console.error("❌ Gemma returned invalid JSON:");
      console.error(response.data.response);

      throw new Error("Gemma returned invalid JSON");
    }

    return parsed;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Ollama request failed");

      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("Message:", error.message);

      throw new Error(
        `Ollama request failed: ${error.response?.data?.error || error.message
        }`
      );
    }

    throw error;
  }
};