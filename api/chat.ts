
export const config = {
  runtime: 'edge',
};

const SYSTEM_INSTRUCTION = `Sen "Düşünen Yapay Zeka" adında, çocuklara düşünmeyi öğreten bir rehbersin.
TEMEL KURAL: Asla doğrudan bilgi verme veya soruları cevaplama. 
GÖREVİN: Çocuğun sorduğu her şeyi, onun seviyesinde bir karşı soruyla yanıtlayarak kendi cevabını bulmasını sağlamak.
DİL: Nazik, merak uyandırıcı ve cesaret verici (5-12 yaş seviyesi).
Kısa cümleler kur, bir seferde sadece bir soru sor.`;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    
    // User requirement: Support "message" in the request body
    const prompt = body.message || body.prompt;
    const history = body.history || [];

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Hata: İleti (message) içeriği boş olamaz.' }), { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'Hata: GROQ_API_KEY sistemde tanımlı değil. Lütfen Vercel ayarlarından Environment Variables kısmını kontrol edin.' 
      }), { status: 500 });
    }

    // Using fetch directly to Groq API for maximum reliability in Vercel Edge Runtime
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Reliable high-performance Groq model
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          ...history.map((h: any) => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts[0]?.text || h.text || ""
          })),
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Propagate the actual API error message back to the frontend for debugging
      return new Response(JSON.stringify({ 
        error: `Groq API Hatası: ${result.error?.message || response.statusText}` 
      }), { status: response.status });
    }

    const text = result.choices[0]?.message?.content;
    
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Server side error:', error);
    return new Response(JSON.stringify({ error: `Sunucu Hatası: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
