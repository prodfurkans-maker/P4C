
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
        message: prompt, // Required by the new server-side implementation
        history,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Throw the descriptive error message returned by the server
      throw new Error(data.error || `Sunucu Bağlantı Hatası (${response.status})`);
    }

    return data.text || "Zihnim biraz karıştı, tekrar sormaya ne dersin?";
  } catch (error: any) {
    console.error("Frontend Service Error:", error);
    // Rethrow to allow the UI (App.tsx) to catch and display the error
    throw error;
  }
}
