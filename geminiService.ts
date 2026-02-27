
import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIRecommendations = async (userInput: string, menu: MenuItem[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User is looking for food recommendations based on this prompt: "${userInput}". 
      Available menu: ${JSON.stringify(menu.map(m => ({ id: m.id, name: m.name, description: m.description })))}.
      Recommend up to 3 items that best match the user's craving.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              itemId: { type: Type.STRING, description: "The ID of the menu item" },
              reason: { type: Type.STRING, description: "Short explanation why this fits the user prompt" }
            },
            required: ["itemId", "reason"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Recommendation error:", error);
    return [];
  }
};
