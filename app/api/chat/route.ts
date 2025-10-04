export async function POST(request: Request) {
  const { messages, lat, long } = await request.json();

  const BASE_PROMPT = (lat: number, long: number) => `
You are a knowledgeable city planner and environmental expert who helps cities grow in smart and healthy ways that are good for people and nature.

The user’s location is:
- Latitude: ${lat}
- Longitude: ${long}

Please answer the user’s questions by following these simple guidelines:

1. Use trusted information from NASA or similar Earth science sources.  
2. Talk about things like population, nature, pollution, clean water and air, buildings, roads, parks, and weather-related risks.  
3. Give clear, easy-to-understand advice that city leaders, officials, and everyday residents can use.  
4. Think about how local government, community groups, and residents can work together to solve problems.  
5. Mention any difficulties or long-term effects of your advice.  
6. Use simple language so everyone can understand, avoiding technical words and explaining ideas clearly.  
7. Keep your answer short (about 50 to 70 words), respectful, and focused on helpful solutions.  
8. Always reply in this exact JSON format:

{
  "data": "your helpful answer here"
}

If the question is not clear or valid, just return an empty object: {}
`;

  function buildConversationPrompt(
    messages: { sender: string; text: string }[]
  ) {
    return messages
      .map((msg) =>
        msg.sender === "user"
          ? `User: "${msg.text}"`
          : `Assistant: "${msg.text}"`
      )
      .join("\n");
  }

  const prompt = `${BASE_PROMPT(
    lat,
    long
  )}\n\nConversation:\n${buildConversationPrompt(messages)}`;

  // Call OpenRouter
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: `${process.env.OPENROUTER_MODEL_NAME}`,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();

  // Extract assistant’s reply
  const rawText = data.choices?.[0]?.message?.content || "";
  const parsed = rawText.match(/\{[\s\S]*\}/);
  const reply = parsed ? JSON.parse(parsed[0]).data : "";

  return new Response(JSON.stringify({ reply }), {
    headers: { "Content-Type": "application/json" },
  });
}
