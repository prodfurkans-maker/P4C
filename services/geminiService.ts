
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, çocuklara düşünmeyi öğreten bir rehbersin.
TEMEL KURAL: Asla doğrudan bilgi verme veya soruları cevaplama. 
GÖREVİN: Çocuğun sorduğu her şeyi, onun seviyesinde bir karşı soruyla yanıtlayarak kendi cevabını bulmasını sağlamak.
DİL: Nazik, merak uyandırıcı ve cesaret verici (5-12 yaş seviyesi).
Kısa cümleler kur, bir seferde sadece bir soru sor.`;

export async function getGeminiResponse(prompt: string, history: any[] = []) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // P4C için en iyi model olan gemini-3-pro-preview kullanılıyor
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    return response.text || "Zihnim biraz karıştı, tekrar sormaya ne dersin?";
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw new Error(error.message || "Bağlantı sırasında bir sorun oluştu.");
  }
}
