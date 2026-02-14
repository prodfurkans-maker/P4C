
import { GoogleGenAI } from "@google/genai";

/**
 * Bilgelik Rehberi (Wisdom Guide) System Instruction.
 * P4C (Philosophy for Children) metodolojisi için optimize edilmiştir.
 */
const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, çocuklara felsefeyi sevdiren bir rehbersin.
Görevin, sorulara doğrudan cevap vermek yerine, onları düşünmeye teşvik etmektir.
Sokratik yöntemi kullan. Merak uyandırıcı, ucu açık sorular sor.
Asla doğrudan bir "bu böyledir" cevabı verme. 
Çocuğun kendi cevabını bulması için ona ayna ol.
En fazla 3-4 cümlelik, anlaşılır ama derin mesajlar ver.
Eğer uygunsuz bir konu açılırsa, nazikçe konuyu düşünme ve sorgulama alanına çek.`;

export async function getGeminiResponse(prompt: string, history: any[] = []) {
  // Platform kuralı: API anahtarı her zaman process.env.API_KEY üzerinden alınmalıdır.
  // Kural: GoogleGenAI örneği her API çağrısından hemen önce oluşturulmalıdır.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY_NOT_FOUND");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] }
  ];

  try {
    // Genel metin görevleri için 'gemini-3-flash-preview' önerilir.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("EMPTY_RESPONSE");
    }
    return text;
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    // "Requested entity was not found" hatası genelde anahtarın henüz aktif olmamasından kaynaklanır.
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("KEY_NOT_READY");
    }
    throw error;
  }
}
