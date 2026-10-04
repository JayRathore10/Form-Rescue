import { createWorker } from "tesseract.js";

export const extractTextFromImage = async (
  imagePath: string
): Promise<string> => {
  const worker = await createWorker("eng");

  try {
    const {
      data: { text },
    } = await worker.recognize(imagePath);

    return text.trim();
  } finally {
    await worker.terminate();
  }
};