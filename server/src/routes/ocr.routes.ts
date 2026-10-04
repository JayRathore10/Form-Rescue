import { Router } from "express";
import { extractFormText } from "../controllers/ocr.controller";

const router = Router();

router.get("/extract/:filename", extractFormText);

export default router;