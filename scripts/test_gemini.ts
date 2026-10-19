import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    console.log("Testing gemini-3.8-flash...");
    const res = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "Translate to Tamil: 'Hello, welcome to Farmers Friend portal!'"
    });
    console.log("gemini-3.8-flash output:", res.text?.trim());
    return;
  } catch (e: any) {
    console.log("Error with gemini-3.8-flash:", e.message);
  }

  try {
    console.log("Listing available models...");
    const pager = await ai.models.list();
    for await (const m of pager) {
      console.log("Model:", m.name, m.supportedActions);
    }
  } catch (err: any) {
    console.log("Error listing models:", err.message);
  }
}

listModels();
