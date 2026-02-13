
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
    console.error("KRİTİK HATA: API Anahtarı (API_KEY) sistemde bulunamadı!");
    return "Bağlantı anahtarım eksik görünüyor. Lütfen sistem yöneticisine danışır mısın?";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    // ÖNEMLİ: Gemini geçmişin 'user' ile başlamasını zorunlu tutar. 
    // Eğer geçmişin ilk mesajı 'model' ise (karşılama mesajı gibi), onu filtreleyelim.
    const validHistory = history.filter((item, index) => {
      if (index === 0 && item.role === 'model') return false;
      return true;
    });

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", // En kararlı ve hızlı erişim için bu modele dönüldü
      contents: [
        ...validHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
      }
    });

    const text = response.text;
    if (!text) {
      console.warn("API boş bir yanıt döndürdü.");
      return "Düşüncelerim şu an çok derinlerde, tam yüzeye çıkaramadım. Tekrar sormaya ne dersin?";
    }

    return text;
  } catch (error: any) {
    console.error("Gemini API Teknik Hatası:", error);
    
    // Bölgesel kısıtlama veya anahtar hatası kontrolü
    if (error.message?.includes("location") || error.message?.includes("supported")) {
      return "Üzgünüm, şu an bulunduğun bölgeden düşünce sunucularıma erişemiyorum. Bağlantını kontrol edip tekrar dener misin?";
    }
    
    return "Zihnimde küçük bir karışıklık oldu ama pes etmiyorum! Sorunu tekrar sorabilir misin?";
  }
};
