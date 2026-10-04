import { Request, Response, NextFunction } from "express";

export const fileUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // multer file save karke req.file me daal deta hai
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (err) {
    next(err);
  }
};