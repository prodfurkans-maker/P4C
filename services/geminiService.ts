
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
  // Use the API key from process.env directly as per requirements
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        ...history.map(h => ({
          role: h.role,
          parts: [{ text: h.parts[0].text }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
      }
    });

    return response.text || "Düşüncelerim şu an çok derinlerde...";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return "Bağlantım biraz zayıfladı, zihnimi toparlayıp geliyorum. Tekrar dener misin?";
  }
};
