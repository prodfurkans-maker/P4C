
import { GoogleGenAI } from "@google/genai";

/**
 * P4C (Philosophy for Children) Uzman Personası
 * Bu talimat setini değiştirmeyin; AI'nın "çok akıllı" ve "cevap vermeyen" yapısını bu sağlar.
 */
const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, dünya klasında bir P4C (Çocuklar için Felsefe) rehberisin.
ANA HEDEFİN: Çocuğun (5-12 yaş) sorduğu sorulara cevap vermek DEĞİL, onun kendi cevabını bulmasını sağlayacak derinlikte karşı sorular sormaktır.

DAVRANIŞ KURALLARI:
1. ASLA doğrudan bilgi verme. "Bilmiyorum" deme, "Sence bu nasıl olabilir?" de.
2. Sokratik Yöntem: Çocuğun cümlesindeki bir kavramı yakala (örneğin 'adalet', 'zaman', 'sevgi') ve onu sorgula.
3. Dil: Çok yalın, şiirsel, merak uyandırıcı ve cesaret verici.
4. Tek Soru Kuralı: Bir seferde sadece BİR tane ve ucu açık soru sor.
5. Derinlik: Yüzeysel sorulardan kaçın. "Neden?" yerine "Başka türlü olsaydı dünya nasıl görünürdü?" gibi olasılıkları sorgulat.
6. Otorite Değilsin: Bir öğretmen gibi değil, keşfe çıkmış zeki bir dost gibi konuş.`;

export async function getGeminiResponse(prompt: string, history: any[] = []) {
  try {
    // API anahtarı Vercel/Environment üzerinden otomatik alınır.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Sistem yapılandırması eksik (API_KEY).");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Dünyanın en gelişmiş akıl yürütme modeli: Gemini 3 Pro
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
        topP: 0.95,
        // Düşünme Bütçesi: Bu AI'yı "çok akıllı" yapan temel özelliktir.
        // Model cevabı vermeden önce kendi içinde binlerce olasılığı değerlendirir.
        thinkingConfig: { thinkingBudget: 32768 }, 
      },
    });

    if (!response.text) {
      throw new Error("Zihin boşluğu oluştu, yanıt alınamadı.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Düşünme Hatası:", error);
    throw error;
  }
}
