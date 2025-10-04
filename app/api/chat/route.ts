import { getGoogleGenAIClient } from "@/lib/geminiClient";

export const PROMPT = (userQuestion: string, lat: number, long: number) => `
You are an elite urban planner, climate resilience expert, and Earth observation data analyst. 
Your task is to provide **practical, actionable, and scientifically-informed strategies** for designing and improving cities while balancing human wellbeing and environmental sustainability.

The user’s location is:
- Latitude: ${lat}
- Longitude: ${long}

User Question:
"${userQuestion}"

Instructions:
1. Base your response on NASA Earth observation data or equivalent scientific sources.
2. Analyze human and environmental factors: population density, local ecosystems, pollution, water & air quality, infrastructure, greenspace.
3. Include clear, actionable recommendations for city planners, local authorities, and residents.
4. Highlight potential trade-offs, challenges, and long-term implications.
5. Keep your answer **concise (50–70 words)**, professional, and solution-oriented.
6. Always respond in valid JSON:

{
  "data": "string"
}

If the input is not a valid question, return: {}
`;

export async function POST(request: Request) {
  const { message, lat, long } = await request.json();
  const ai = getGoogleGenAIClient();

  const stream = await ai.models.generateContentStream({
    model: process.env.GEMINI_MODEL_NAME!,
    contents: [
      {
        role: "user",
        parts: [{ text: PROMPT(message, lat, long) }],
      },
    ],
  });

  let rawText = "";
  for await (const chunk of stream) {
    if (chunk.text) rawText += chunk.text;
  }

  const parsed = rawText.match(/\{[\s\S]*\}/);
  const reply = parsed ? JSON.parse(parsed[0]).data : "";

  return new Response(JSON.stringify({ reply }), {
    headers: { "Content-Type": "application/json" },
  });
}
