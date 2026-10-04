import { Router } from "express";
import { Request, Response } from "express";
import { OLLAMA_URL } from "../configs/env.config";

export const aiRouter = Router();

const MODEL = "gemma4:e2b";

export async function generate(contents: string) {
  const response = await fetch(OLLAMA_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: contents,
      stream: false,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Ollama error ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  return data.response;
}


aiRouter.post("/ask", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    const text = await generate(prompt);

    res.json({ text });
  } catch (err) {
    console.error("AI Error:", err);

    res.status(500).json({
      error: "Local AI request failed",
    });
  }
});

