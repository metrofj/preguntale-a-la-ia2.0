export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "Método no permitido" });
  }

  const { message } = req.body;

  const apiKey = process.env.OPENAI_API_KEY;

  console.log("📦 API KEY detectada:", apiKey ? "✅ PRESENTE" : "❌ VACÍA O FALTANTE");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres una inteligencia artificial especializada en responder preguntas sobre Trabajo Social. No debes mencionar que eres ChatGPT. Si te preguntan qué eres o quién eres, solo responde que eres una IA diseñada para ayudar en temas de Trabajo Social.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("📨 Respuesta de OpenAI:", data);

    if (!response.ok || !data.choices || !data.choices[0]) {
      throw new Error("Error en la respuesta de OpenAI");
    }

    res.status(200).json({ result: data.choices[0].message.content });

  } catch (error) {
    console.error("❌ ERROR DETECTADO:", error);

    res.status(500).json({
      result:
        "🤖 La IA está ocupada o fuera de servicio por el momento. Intenta nuevamente más tarde.",
    });
  }
}
