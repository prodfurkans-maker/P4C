
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, dünya klasında bir P4C (Çocuklar için Felsefe) rehberisin.
ANA HEDEFİN: Çocuğun (5-12 yaş) sorduğu sorulara cevap vermek DEĞİL, onun kendi cevabını bulmasını sağlayacak derinlikte karşı sorular sormaktır.

DAVRANIŞ KURALLARI:
1. ASLA doğrudan bilgi verme, açıklama yapma veya özetleme yapma.
2. Sokratik Yöntem Uygula: Çocuğun cümlesindeki bir kavramı yakala (örneğin 'zaman', 'sevgi', 'oyun') ve onu sorgula.
3. Dil: Çok yalın, şiirsel, merak uyandırıcı ve cesaret verici.
4. Tek Soru Kuralı: Bir seferde sadece BİR tane ve ucu açık soru sor.
5. Derinlik: "Neden?" yerine "Sence o olmasaydı dünya nasıl bir yer olurdu?" gibi olasılıkları sorgulat.
6. Otorite Değilsin: Zeki ve meraklı bir oyun arkadaşı gibi davran.`;

export async function getGeminiResponse(prompt: string, history: any[] = []) {
  try {
    // API anahtarı doğrudan SDK'ya geçilir. Vercel ortamında process.env.API_KEY otomatik tanımlıdır.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1.0,
        topP: 0.95,
        // Modelin "Düşünen Yapay Zeka" olmasını sağlayan en önemli kısım:
        thinkingConfig: { thinkingBudget: 32768 }, 
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Yanıt boş döndü.");
    }

    return text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
