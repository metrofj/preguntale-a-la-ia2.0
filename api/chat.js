export default async function handler(req, res) {
  const apiKeys = [
    process.env.OPENAI_API_KEY_1,
    process.env.OPENAI_API_KEY_2,
    process.env.OPENAI_API_KEY_3,
  ].filter(Boolean);

  const OPENAI_API_KEY = apiKeys.find(Boolean);

  console.info("📦 API KEY detectada:", OPENAI_API_KEY ? "✅ PRESENTE" : "❌ FALTANTE");

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "Falta la clave de API de OpenAI" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: "Pregunta vacía" });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente experto en Trabajo Social. Responde de forma clara, amable y directa. No digas que eres un modelo de lenguaje ni menciones que eres ChatGPT.",
          },
          { role: "user", content: message },
        ],
        temperature: 0.7,
      }),
    });

    const openaiData = await openaiRes.json();

    if (openaiData.error) {
      console.error("❌ ERROR DETECTADO:", openaiData.error);
      return res.status(500).json({ error: "La IA está ocupada o fuera de servicio por el momento. Intenta más tarde." });
    }

    const respuestaIA = openaiData.choices?.[0]?.message?.content?.trim();
    console.info("📨 Respuesta de OpenAI:", respuestaIA);

    return res.status(200).json({ response: respuestaIA });

  } catch (error) {
    console.error("❌ ERROR en catch:", error);
    return res.status(500).json({ error: "Error al contactar con OpenAI" });
  }
}
