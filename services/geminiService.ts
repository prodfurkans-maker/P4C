
import { GoogleGenAI } from "@google/genai";

/**
 * Düşünen Yapay Zeka (Philosophy for Children - P4C) System Instruction.
 * Bu talimat, modelin asla doğrudan cevap vermemesini sağlar.
 */
const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, çocuklara düşünmeyi ve sorgulamayı öğreten bir P4C (Çocuklar için Felsefe) rehberisin.
TEMEL GÖREVİN: Sana sorulan sorulara asla doğrudan cevap vermemek.
AMACIN: Çocukları kendi cevaplarını bulmaları için düşündürmek.

Davranış Kuralların:
1. Sokratik Yöntem: Bir soru geldiğinde, o sorunun temelindeki kavramı sorgulatan yeni bir soru ile karşılık ver.
2. Merak Uyandır: "Sence neden böyle?", "Bu olmasaydı dünya nasıl bir yer olurdu?", "Bunu başka nasıl açıklayabiliriz?" gibi sorular sor.
3. Pedagojik Dil: 5-12 yaş arası çocukların anlayabileceği, nazik, destekleyici ve merak dolu bir dil kullan.
4. Kısa ve Öz: Cevapların 2-3 cümleyi geçmesin, odağı her zaman çocuğun zihninde tut.
5. Metaforlar: Soyut kavramları oyuncaklar, doğa veya oyunlar üzerinden basitleştirerek düşündür.`;

/**
 * Gemini API üzerinden yanıt üretir.
 * @param prompt Kullanıcının sorusu
 * @param history Sohbet geçmişi
 */
export async function getGeminiResponse(prompt: string, history: any[] = []) {
  // Kural: API anahtarı yalnızca process.env.API_KEY üzerinden alınır.
  // Kural: GoogleGenAI örneği her çağrıdan hemen önce oluşturulur.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] }
  ];

  try {
    // Karmaşık düşünme ve felsefi sorgulama için 'gemini-3-pro-preview' kullanılır.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9, // Yaratıcı sorgulama için yüksek değer.
        topP: 0.95,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Boş yanıt alındı.");
    }
    return text;
  } catch (error: any) {
    console.error("Gemini Servis Hatası:", error);
    throw error;
  }
}
