import { Request, Response } from "express";
import { translateContent, batchTranslateContent } from "../services/geminiService";

export async function translateTextHandler(req: Request, res: Response): Promise<void> {
  try {
    const { text, texts, targetLang = "ta" } = req.body;

    if (Array.isArray(texts)) {
      const translated = await batchTranslateContent(texts, targetLang);
      res.status(200).json({
        success: true,
        data: { translations: translated }
      });
      return;
    }

    if (typeof text === "string") {
      const translated = await translateContent(text, targetLang);
      res.status(200).json({
        success: true,
        data: { translation: translated }
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "Please provide either 'text' (string) or 'texts' (array of strings)."
    });
  } catch (err: any) {
    console.error("[Translate Controller Error]:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to translate content."
    });
  }
}

export async function getTranslationStatusHandler(req: Request, res: Response): Promise<void> {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("leaked"));
  res.status(200).json({
    success: true,
    data: {
      geminiConfigured: hasGeminiKey,
      supportedLanguages: ["en", "ta"],
      defaultLanguage: "en",
      engine: hasGeminiKey ? "Google Gemini AI & High-Speed Agricultural Rule Engine" : "High-Speed Agricultural Rule Engine"
    }
  });
}
