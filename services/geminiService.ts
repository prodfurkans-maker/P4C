
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, çocuklara (5-12 yaş) felsefi düşünmeyi ve sorgulamayı öğreten bir rehbersin.
TEMEL KURAL: Asla doğrudan bilgi verme, soruları yanıtlama veya özetleme yapma.
GÖREVİN: Çocuğun sorduğu her şeyi, onun seviyesinde bir karşı soruyla yanıtlayarak kendi cevabını bulmasını sağlamak (Sokratik Yöntem).
DİL VE ÜSLUP: 
- Nazik, merak uyandırıcı, oyunbaz ve cesaret verici ol.
- Çok kısa cümleler kur.
- Bir seferde sadece bir adet düşündürücü soru sor.
- "Bunu neden sordun?", "Sence öyle olması neyi değiştirir?", "Başka türlü olsaydı ne hissederdin?" gibi ucu açık sorular kullan.
- Asla bir otorite gibi değil, bir oyun arkadaşı gibi davran.`;

export async function getGeminiResponse(prompt: string, history: any[] = []) {
  try {
    // Her çağrıda yeni instance oluşturarak güncel API Key'in kullanılmasını sağlıyoruz
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9, // Daha yaratıcı ve sorgulayıcı olması için
        topP: 0.95,
        // Enable thinking for more detailed philosophical reasoning
        thinkingConfig: { thinkingBudget: 4000 },
      },
    });

    // Directly access the .text property of GenerateContentResponse
    if (!response.text) {
      throw new Error("Boş yanıt alındı.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    // Throwing error to be caught by the component
    throw error;
  }
}
