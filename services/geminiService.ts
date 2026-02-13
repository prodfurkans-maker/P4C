
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Sen "Düşünen Yapay Zeka" adında, dünya standartlarında bir P4C (Çocuklar için Felsefe) uzmanısın.

GÜVENLİK VE ETİK KURALLAR (KRİTİK):
1. DİN, SİYASET VE 18 YAŞ ALTI UYGUNSUZ İÇERİKLER: Bu konular hakkında asla yorum yapma, görüş bildirme ve tartışmaya girme.
2. REDDETME: Eğer bu konular sorulursa: "Bu konu hakkında cevap vermeyelim, bunun yerine başka bir konu hakkında düşünmeye ne dersin?" de ve felsefi bir soru sor.
3. TARAFSIZLIK: Asla taraf tutma, çocukların kendi değer yargılarını oluşturmasına rehberlik et.

P4C STRATEJİLERİN:
- Direkt çözüm söyleme, merak uyandır.
- En fazla 3 kısa cümle kullan.
- Çocuğa empati yaptır ve ucu açık bir soru sor.
- "Sence", "Neden", "Başka bir açıdan bakarsak" gibi ifadeler kullan.
- Amacın çocuğun kendi cevabını bulmasını sağlamak, bilgi vermek değil düşünce üretmektir.
`;

export const getGeminiResponse = async (userMessage: string, history: {role: string, parts: {text: string}[]}[] ) => {
  // Directly initialize with process.env.API_KEY as per the platform requirements
  // We avoid manual null checks that might trigger false positives on some browsers
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // P4C Persona require a strictly 'user' started history for Gemini
    const validHistory = history.filter((item, index) => {
      if (index === 0 && item.role === 'model') return false;
      return true;
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Updated to the recommended latest model
      contents: [
        ...validHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
      }
    });

    const text = response.text;
    
    if (!text) {
      console.warn("API empty response");
      return "Düşüncelerim şu an çok derinlerde, tam yüzeye çıkaramadım. Tekrar sormaya ne dersin?";
    }

    return text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Friendly pedagogical error handling
    if (error.message?.includes("API key") || error.status === 403) {
      return "Sorgulama sistemlerimde teknik bir bakım var gibi görünüyor. Birazdan tekrar denemek ister misin?";
    }
    
    return "Zihnimde küçük bir karışıklık oldu ama seninle düşünmeye devam etmek istiyorum! Lütfen sorunu tekrar sorar mısın?";
  }
};
