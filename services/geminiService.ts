
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
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  // Create instance right before call as per guidelines
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const validHistory = history.filter((item, index) => {
      if (index === 0 && item.role === 'model') return false;
      return true;
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

    return response.text || "Düşüncelerimi toparlayamadım, tekrar sorar mısın?";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("not found") || error.status === 404) {
      throw new Error("KEY_INVALID");
    }
    throw error;
  }
};
