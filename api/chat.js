export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "Método no permitido" });
  }

  const { message } = req.body;

  // Lista de claves API disponibles (usa una a la vez)
  const apiKeys = [
    process.env.OPENAI_API_KEY_1,
    process.env.OPENAI_API_KEY_2,
    // Puedes agregar más claves aquí si lo deseas
  ];

  // Función para probar las claves una por una
  async function tryKeys(index = 0) {
    if (index >= apiKeys.length) {
      throw new Error("Todas las claves fallaron o alcanzaron su límite.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKeys[index]}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres una inteligencia artificial especializada en responder preguntas sobre Trabajo Social. No debes mencionar que eres ChatGPT ni OpenAI. Si te preguntan quién eres, responde que eres una IA diseñada para ayudar exclusivamente en temas de Trabajo Social. No respondas preguntas fuera de este ámbito.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.choices || !data.choices[0]) {
      return tryKeys(index + 1); // Prueba con la siguiente clave
    }

    return data.choices[0].message.content;
  }

  try {
    const result = await tryKeys();
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error al llamar a OpenAI:", error);
    res.status(500).json({
      result:
        "🤖 La IA está ocupada o fuera de servicio por el momento. Intenta nuevamente más tarde.",
    });
  }
}
