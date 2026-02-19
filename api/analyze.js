export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

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

Return JSON only. No explanations.

User input:
${input}
`
      })
    });

    const data = await response.json();

    const content = data.output?.[0]?.content?.[0]?.text;

    if (!content) {
      return res.status(500).json({
        error: "No content returned from model",
        raw: data
      });
    }

    // ```json や ``` を除去
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      return res.status(500).json({
        error: "JSON parse failed",
        raw: content
      });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
