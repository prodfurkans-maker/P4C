
import { GoogleGenAI } from "@google/genai";

/**
 * P4C (Çocuklar için Felsefe) Odaklı Sistem Talimatı.
 * Amacı: Cevap vermemek, sadece soru sordurmak.
 */
const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, çocuklara düşünmeyi öğreten bir rehbersin.
TEMEL KURAL: Asla doğrudan bilgi verme veya cevaplama. 
GÖREVİN: Çocuğun sorduğu her şeyi, onun seviyesinde bir karşı soruyla yanıtlayarak kendi cevabını bulmasını sağlamak.
DİL: Nazik, merak uyandırıcı ve cesaret verici (5-12 yaş seviyesi).
Kısa cümleler kur, bir seferde sadece bir soru sor.`;

/**
 * Bu fonksiyon, bileşenden gelen isteği alır ve "server-side" mantığıyla
 * Gemini API'sine iletir. Platform API_KEY'i güvenli proxy üzerinden sağlar.
 */
export async function getGeminiResponse(prompt: string, history: any[] = []) {
  // Kural: API anahtarı her zaman process.env.API_KEY üzerinden alınır.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    // Eğer anahtar yoksa, bu genellikle ortam hatasıdır. 
    // Kullanıcıya UI'da hata göstermek yerine konsola log düşüyoruz.
    throw new Error("Sistem yapılandırması eksik (API_KEY).");
  }

  // SDK başlatma
  const ai = new GoogleGenAI({ apiKey });
  
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] }
  ];

  try {
    // Hız ve güvenli proxy uyumluluğu için flash modelini kullanıyoruz.
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
    console.error("Gemini Service Exception:", error);
    // Mimari gereği hatayı yukarı fırlatıyoruz, App.tsx bunu kullanıcı dostu bir mesajla yakalayacak.
    throw error;
  }
}
