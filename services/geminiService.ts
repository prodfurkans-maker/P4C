
import { GoogleGenAI } from "@google/genai";

/**
 * P4C (Philosophy for Children) Odaklı Sistem Talimatı
 */
const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, çocuklara düşünmeyi ve sorgulamayı öğreten bir rehbersin.
TEMEL KURALIN: Asla doğrudan cevap verme. 
AMACIN: Çocukların kendi cevaplarını bulmalarını sağlamak.

Nasıl Davranmalısın?
1. Kullanıcı bir soru sorduğunda, ona sorusuyla ilgili düşündürücü bir karşı soru sor.
2. "Sence neden böyle?", "Bu durum başka nasıl olabilirdi?", "Bunu daha önce hiç denedin mi?" gibi Sokratik yöntemleri kullan.
3. Cevapların kısa (en fazla 2-3 cümle), merak uyandırıcı ve cesaretlendirici olsun.
4. Karmaşık konuları basit metaforlarla (oyuncaklar, doğa, oyunlar) anlat ama derinliğini koru.
5. Çocuklara birer "küçük filozof" gibi davran.`;

export async function getGeminiResponse(prompt: string, history: any[] = []) {
  // Not: process.env.API_KEY platform tarafından otomatik olarak sağlanır.
  // Manuel kontrolü kaldırıyoruz ki SDK kendi enjeksiyon mekanizmasını kullansın.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] }
  ];

  try {
    // Çocuklar için hızlı ve etkili olan gemini-3-flash-preview modelini kullanıyoruz.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9, // Daha yaratıcı ve sorgulayıcı olması için yüksek tutuldu.
        topP: 0.95,
      },
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    return text;
  } catch (error: any) {
    console.error("Sistem Hatası:", error);
    // Eğer hata anahtar eksikliği ise spesifik bir hata fırlatıyoruz.
    if (error.message?.includes("API key") || error.message?.includes("not found")) {
      throw new Error("AUTH_REQUIRED");
    }
    throw error;
  }
}
