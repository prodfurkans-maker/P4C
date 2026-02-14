import Groq from "groq-sdk";

export default async function handler(req, res) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { messages } = req.body;

    const response = await client.chat.completions.create({
      model: "gemini-1.5-flash",
      messages,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Groq API error:", error);
    res.status(500).json({ error: "API çağrısı başarısız oldu" });
  }
}
