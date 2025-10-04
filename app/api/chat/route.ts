import { getGoogleGenAIClient } from "@/lib/geminiClient";

export const PROMPT = (userQuestion: string) => `
You are an expert urban planner and data analyst with a deep understanding of climate change, sustainability, and Earth observation data. The user will ask questions related to designing smart cities that balance human wellbeing and environmental protection. Keep your answer concise, around 50–70 words.

User Question:
"${userQuestion}"

Only respond with valid JSON in this exact format:
{
  "data": "string"
}
If it's not a message, return an empty object.
`;

export async function POST(request: Request) {
  const { message } = await request.json();
  const ai = getGoogleGenAIClient();

  const stream = await ai.models.generateContentStream({
    model: process.env.GEMINI_MODEL_NAME!,
    contents: [
      {
        role: "user",
        parts: [{ text: PROMPT(message) }],
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
