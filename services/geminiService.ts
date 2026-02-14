
import { GoogleGenAI } from "@google/genai";

/**
 * P4C (Çocuklar için Felsefe) Odaklı Sistem Talimatı.
 */
const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, çocuklara düşünmeyi öğreten bir rehbersin.
TEMEL KURAL: Asla doğrudan bilgi verme veya cevaplama. 
GÖREVİN: Çocuğun sorduğu her şeyi, onun seviyesinde bir karşı soruyla yanıtlayarak kendi cevabını bulmasını sağlamak.
DİL: Nazik, merak uyandırıcı ve cesaret verici (5-12 yaş seviyesi).
Kısa cümleler kur, bir seferde sadece bir soru sor.`;

/**
 * Gemini API üzerinden yanıt üretir.
 * Bu platformda process.env.API_KEY güvenli bir proxy üzerinden enjekte edilir.
 */
export async function getGeminiResponse(prompt: string, history: any[] = []) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    // Uygulama içinde yakalanması için spesifik bir hata fırlatıyoruz.
    throw new Error("AUTH_REQUIRED");
  }

  // SDK her istekte taze bir instance ile başlatılır (Platform kuralı).
  const ai = new GoogleGenAI({ apiKey });
  
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Modelden boş yanıt döndü.");
    
    return resultText;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Yetkilendirme veya anahtar hatalarını yukarıya ilet.
    if (error.message?.includes("API key") || error.status === 403 || error.status === 401) {
      throw new Error("AUTH_REQUIRED");
    }
    throw error;
  }
}
