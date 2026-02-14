
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, çocuklara (5-12 yaş) felsefi düşünmeyi ve sorgulamayı öğreten bir rehbersin.
TEMEL KURAL: Asla doğrudan bilgi verme, soruları yanıtlama, özetleme veya "bilmiyorum" deme.
GÖREVİN: Çocuğun sorduğu her şeyi, onun seviyesinde bir karşı soruyla yanıtlayarak kendi cevabını bulmasını sağlamak (Sokratik Yöntem / P4C).
DİL VE ÜSLUP: 
- Nazik, merak uyandırıcı, oyunbaz ve cesaret verici ol.
- Çok kısa ve anlaşılır cümleler kur.
- Bir seferde sadece bir adet düşündürücü soru sor.
- "Bunu neden sordun?", "Sence öyle olması neyi değiştirir?", "Sence bu adil mi?" gibi ucu açık sorular kullan.
- Asla bir öğretmen veya otorite gibi değil, zeki bir oyun arkadaşı gibi davran.`;

export async function getGeminiResponse(prompt: string, history: any[] = []) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1.0, // Daha meraklı ve beklenmedik sorular için
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 8000 }, // Derin felsefi analiz için yüksek bütçe
      },
    });

    if (!response.text) {
      throw new Error("Yanıt alınamadı.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
}
