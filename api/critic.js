export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { catalog, query } = req.body;

    if (!catalog || !Array.isArray(catalog)) {
      return res.status(400).json({ error: "Invalid catalog payload" });
    }

    const userQuery = typeof query === "string" ? query.trim() : "";

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: "Server API key missing" });
    }

    const systemPrompt = `
You are a sharp, witty, and opinionated entertainment critic.
Analyze the provided catalog items and pick 3 standout titles worth checking out.

${userQuery
  ? `The user described what they're in the mood for: "${userQuery}". Your picks and reasons MUST be tailored specifically to this request — favor titles that genuinely match the requested mood, genre, tone, length, or vibe over generically "acclaimed" ones. If nothing in the catalog is a good match, say so honestly in "note" and pick the closest available options.`
  : `The user didn't specify a mood, so use your judgment to pick 3 varied, genuinely interesting standouts (avoid defaulting to the same obvious picks every time — vary your reasoning based on what's unusual or notable in this specific catalog).`
}

RULES:
1. ONLY pick item IDs present in the provided catalog context.
2. DO NOT invent or fabricate any titles or IDs.
3. You MUST reply ONLY with valid JSON in the following structure:
{
  "note": "A short, sharp 1-sentence commentary on the state of this catalog.",
  "picks": [
    {
      "id": "item-id-here",
      "reason": "One punchy sentence explaining why to watch or play it."
    }
  ]
}
`;

    // Send request securely to Groq from the server side
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: userQuery
              ? `The user's mood/request: "${userQuery}"\n\nHere is the current catalog:\n${JSON.stringify(catalog, null, 2)}`
              : `No specific mood given. Here is the current catalog:\n${JSON.stringify(catalog, null, 2)}`
          }
        ],
        temperature: 0.7
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return res.status(groqResponse.status).json({ error: errText });
    }

    const data = await groqResponse.json();
    const result = JSON.parse(data.choices[0].message.content);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ error: "Failed to query the critic API" });
  }
}export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { catalog } = req.body;

    if (!catalog || !Array.isArray(catalog)) {
      return res.status(400).json({ error: "Invalid catalog payload" });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: "Server API key missing" });
    }

    const systemPrompt = `
You are a sharp, witty, and opinionated entertainment critic.
Analyze the provided catalog items and pick 3 standout titles worth checking out.

RULES:
1. ONLY pick item IDs present in the provided catalog context.
2. DO NOT invent or fabricate any titles or IDs.
3. You MUST reply ONLY with valid JSON in the following structure:
{
  "note": "A short, sharp 1-sentence commentary on the state of this catalog.",
  "picks": [
    {
      "id": "item-id-here",
      "reason": "One punchy sentence explaining why to watch or play it."
    }
  ]
}
`;

    // Send request securely to Groq from the server side
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the current catalog:\n${JSON.stringify(catalog, null, 2)}` }
        ],
        temperature: 0.7
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return res.status(groqResponse.status).json({ error: errText });
    }

    const data = await groqResponse.json();
    const result = JSON.parse(data.choices[0].message.content);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ error: "Failed to query the critic API" });
  }
}
