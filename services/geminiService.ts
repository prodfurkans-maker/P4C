
import { GoogleGenAI } from "@google/genai";

/**
 * P4C (Çocuklar için Felsefe) Metodolojisi System Instruction.
 */
const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, çocuklara düşünmeyi ve sorgulamayı öğreten bir P4C rehberisin.
ASLA doğrudan cevap verme. Soruları sorularla yanıtlayarak çocuğun kendi cevabını bulmasını sağla.
Kısa, nazik ve merak uyandırıcı cümleler kur.`;

export async function getGeminiResponse(prompt: string, history: any[] = []) {
  // Kural: API anahtarı her zaman process.env.API_KEY üzerinden alınır.
  // Kural: GoogleGenAI örneği her istekten hemen önce oluşturulur.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] }
  ];

  try {
    // Basic metin görevleri için en uyumlu model flash modelidir.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    return response.text || "Zihnim biraz karıştı, tekrar sorar mısın?";
  } catch (error: any) {
    console.error("Gemini API Hatası:", error);
    // Eğer yetki hatası alınırsa üst katmana bildir.
    if (error.message?.includes("API key") || error.message?.includes("403") || error.message?.includes("401")) {
      throw new Error("AUTH_REQUIRED");
    }
    throw error;
  }
}
