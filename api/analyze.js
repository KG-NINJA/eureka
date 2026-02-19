export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { input } = req.body;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      input: `
Extract:
- genre (visual_art | engineering | writing)
- core_word (one noun)
- axis (vertical | horizontal | circular)
- tension (0.0-1.0)
- openness (0.0-1.0)
- complexity (0.0-1.0)
- stability (0.0-1.0)

Return JSON only.

User input:
${input}
`
    })
  });

  const data = await response.json();

  try {
    const text = data.output[0].content[0].text;
    return res.status(200).json(JSON.parse(text));
  } catch (e) {
    return res.status(500).json({ error: "Parse failed", raw: data });
  }
}
