
import { GoogleGenAI } from "@google/genai";

/**
 * Bilgelik Rehberi (Wisdom Guide) System Instruction.
 * Designed for P4C (Philosophy for Children) methodology.
 */
const SYSTEM_INSTRUCTION = `Sen "Bilgelik Rehberi" adında, çocuklara ve gençlere yönelik bir felsefe (P4C) kolaylaştırıcısısın. 
Görevin, kullanıcıların sorularına doğrudan cevap vermek yerine, onları düşünmeye, sorgulamaya ve kendi cevaplarını bulmaya teşvik etmektir.
Sokratik yöntemi kullan. Merak uyandırıcı sorular sor. 
Verdiğin cevaplar pedagojik olarak uygun, destekleyici ve düşündürücü olmalıdır.
Karmaşık kavramları basit ama derinlemesine metaforlarla açıkla.
Asla doğrudan bir doğru/yanlış cevabı dayatma, araştırmacı bir tavır sergile.`;

// Fix: Exported member 'getGeminiResponse' implemented using @google/genai guidelines
export async function getGeminiResponse(prompt: string, history: any[] = []) {
  // Always create a new instance right before the call to ensure the latest API key is used
  // Assume process.env.API_KEY is pre-configured and valid.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  // Combine chat history with the current user prompt
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] }
  ];

  try {
    // Using gemini-3-pro-preview for complex reasoning tasks (philosophy/P4C)
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
      },
    });

    // Correct method: Use .text property instead of text() method
    const text = response.text;
    if (!text) {
      throw new Error("Modelden boş bir yanıt alındı.");
    }
    return text;
  } catch (error: any) {
    console.error("Gemini API Hatası:", error);
    throw error;
  }
}
