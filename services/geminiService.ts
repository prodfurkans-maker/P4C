
/**
 * Frontend service that communicates with the server-side API.
 * This prevents the "API Key must be set when running in a browser" error.
 */
export async function getGeminiResponse(prompt: string, history: any[] = []) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        history,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Sunucu ile bağlantı kurulamadı.');
    }

    const data = await response.json();
    return data.text || "Anlayamadım, tekrar söyleyebilir misin?";
  } catch (error: any) {
    console.error("Frontend Service Error:", error);
    throw new Error(error.message || "Bağlantı yolunda bir engel çıktı, tekrar deneyelim mi?");
  }
}
