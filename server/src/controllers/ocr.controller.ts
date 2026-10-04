import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { extractTextFromImage } from "../services/ocr.service";

export const extractFormText = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { filename } = req.params;

    if (!filename) {
      res.status(400).json({
        error: "Filename is required",
      });
      return;
    }

    const uploadsDir = path.resolve(process.cwd(), "src/uploads");
    const imagePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(imagePath)) {
      res.status(404).json({
        error: "Image not found",
        path: imagePath,
      });
      return;
    }

    const text = await extractTextFromImage(imagePath);

    res.status(200).json({
      success: true,
      filename,
      text,
    });
  } catch (error) {
    console.error("OCR Error:", error);

    res.status(500).json({
      error: "Failed to extract text from image",
    });
  }
};