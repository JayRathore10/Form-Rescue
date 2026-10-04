import { Request, Response } from "express";
import path from "path";
import fs from "fs";

import { extractTextFromImage } from "../services/ocr.service";
import { parseFormWithGemma } from "../services/form-parser.service";

export const extractFormText = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { filename } = req.params;

    console.log("📄 Filename:", filename);

    if (!filename) {
      res.status(400).json({
        error: "Filename is required",
      });
      return;
    }

    const uploadsDir = path.resolve(process.cwd(), "src/uploads");
    const imagePath = path.join(uploadsDir, filename);

    console.log("📁 Image path:", imagePath);

    if (!fs.existsSync(imagePath)) {
      res.status(404).json({
        error: "Image not found",
        imagePath,
      });
      return;
    }

    // 1. OCR
    console.log("🔍 Running Tesseract...");

    const ocrText = await extractTextFromImage(imagePath);

    console.log("✅ OCR completed");
    console.log("OCR TEXT:");
    console.log(ocrText);

    if (!ocrText) {
      res.status(400).json({
        error: "No text detected in image",
      });
      return;
    }

    // 2. Gemma
    console.log("🤖 Sending OCR text to Gemma...");

    const structuredForm = await parseFormWithGemma(ocrText);

    console.log("✅ Gemma completed");
    console.log(structuredForm);

    res.status(200).json({
      success: true,
      filename,
      form: structuredForm,
    });
  } catch (error) {
    console.error("❌ FORM PROCESSING ERROR:");
    console.error(error);

    res.status(500).json({
      error: "Failed to process form",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};