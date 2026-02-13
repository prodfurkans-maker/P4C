
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
`;

export const getGeminiResponse = async (userMessage: string, history: {role: string, parts: {text: string}[]}[] ) => {
  // LocalStorage'dan Groq Key'i al
  const apiKey = localStorage.getItem('GROQ_API_KEY');
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  // Groq API OpenAI uyumlu bir endpoint kullanır
  const url = "https://api.groq.com/openai/v1/chat/completions";
  
  // Geçmişi Groq formatına çevir
  const messages = [
    { role: "system", content: SYSTEM_INSTRUCTION },
    ...history.map(h => ({
      role: h.role === "model" ? "assistant" : "user",
      content: h.parts[0].text
    })),
    { role: "user", content: userMessage }
  ];

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) throw new Error("API_KEY_INVALID");
      throw new Error(errorData.error?.message || "GROQ_ERROR");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Düşüncelerim şu an çok derinlerde...";
  } catch (error: any) {
    console.error("Groq API Error:", error);
    if (error.message === "API_KEY_INVALID") throw error;
    return "Bağlantım biraz zayıfladı, gel tekrar deneyelim!";
  }
};
