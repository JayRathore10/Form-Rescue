import { Router } from "express";
import { fileUpload } from "../controllers/file.controller";
import { upload } from "../middleware/multer.middleware";
export const fileRouter=Router();



fileRouter.post("/uploads",upload.single("file"),fileUpload);