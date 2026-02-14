
import { GoogleGenAI } from "@google/genai";

/**
 * P4C (Çocuklar için Felsefe) Odaklı Sistem Talimatı.
 * "Düşünen Yapay Zeka" - Cevap vermez, sadece düşündürür.
 */
const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, çocuklara düşünmeyi öğreten bir rehbersin.
TEMEL KURAL: Asla doğrudan bilgi verme veya soruları cevaplama. 
GÖREVİN: Çocuğun sorduğu her şeyi, onun seviyesinde bir karşı soruyla yanıtlayarak kendi cevabını bulmasını sağlamak.
DİL: Nazik, merak uyandırıcı ve cesaret verici (5-12 yaş seviyesi).
Kısa cümleler kur, bir seferde sadece bir soru sor.`;

/**
 * Gemini API üzerinden yanıt üretir.
 * Kural: process.env.API_KEY doğrudan kullanılır.
 * Kural: SDK örneği her istekte taze oluşturulur.
 */
export async function getGeminiResponse(prompt: string, history: any[] = []) {
  // Sistem talimatlarına göre anahtar doğrudan ortam değişkeninden alınır.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

    return response.text || "Zihnim biraz karıştı, tekrar sormaya ne dersin?";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Hata durumunda kullanıcıyı korkutmadan nazikçe bilgilendiriyoruz.
    throw new Error("Bağlantı yolunda bir engel çıktı, tekrar deneyelim mi?");
  }
}
