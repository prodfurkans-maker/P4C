
// Bu dosya artık kullanılmamaktadır. Doğrudan Gemini SDK kullanılmaktadır.
export const config = { runtime: 'edge' };
export default async function handler() {
  return new Response("Lütfen Gemini SDK kullanın.", { status: 404 });
}
