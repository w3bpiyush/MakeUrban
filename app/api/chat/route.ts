import { GoogleGenAI } from "@google/genai";
import { increaseLatLng } from "@/lib/coordsUtils";

const HEAT_API_URL = process.env.NEXT_PUBLIC_HOST_HEAT_API_URL;
const AEROSOL_API_URL = process.env.NEXT_PUBLIC_HOST_AEROSOL_API_URL;

interface AerosolPrediction {
  lat: number;
  lon: number;
  predicted_aerosol: number;
  year: number;
}

interface AerosolData {
  predictions: AerosolPrediction[];
}

interface Message {
  sender: "user" | "assistant";
  text: string;
}

export async function POST(request: Request) {
  try {
    const {
      messages,
      lat,
      long,
    }: { messages: Message[]; lat: number; long: number } =
      await request.json();

    const { latStart, latEnd, lngStart, lngEnd } = increaseLatLng(lat, long);

    // Fetch heat and aerosol data in parallel
    const [heatRes, aerosolRes] = await Promise.all([
      fetch(`${HEAT_API_URL}?lat=${lat}&lon=${long}`),
      fetch(
        `${AEROSOL_API_URL}?latstart=${latStart}&latend=${latEnd}&lonstart=${lngStart}&lonend=${lngEnd}`
      ),
    ]);

    if (!heatRes.ok || !aerosolRes.ok) {
      throw new Error("Failed to fetch external data.");
    }

    const heatData: { heat_index: number } = await heatRes.json();
    const aerosolData: AerosolData = await aerosolRes.json();

    // Build prompt dynamically
    const BASE_PROMPT = (
      lat: number,
      long: number,
      heatIndex: number,
      aerosol: AerosolData
    ) => `
You are an expert city planner and environmental analyst.

User location:
- Latitude: ${lat}
- Longitude: ${long}

Heat Index: ${heatIndex}

Aerosol Predictions:
${aerosol.predictions
  .map(
    (p: AerosolPrediction) =>
      `- Lat: ${p.lat}, Lon: ${p.lon}, Predicted Aerosol: ${p.predicted_aerosol}, Year: ${p.year}`
  )
  .join("\n")}

Tasks:
1. Infer the city or town name dynamically from the coordinates.
2. Analyze the user question and classify its intent as one of: answering, reasoning, explaining, suggesting.
3. Tailor your response tone and style based on the intent classification.
4. Provide actionable advice on population, pollution, infrastructure, nature, weather risks, etc.
5. Highlight challenges or long-term impacts.
6. Based on this, draw a proper plan for the city. Give actual numerical data:
   - How many trees should be planted in danger zones
   - Where hospitals and healthcare centres should be built
   - Maximum daily fuel consumption by vehicles
   - Best precaution measures residents should take
   Give approximate data using the received heat and aerosol data.
7. Keep responses concise (50–70 words)
8. Always respond in JSON format: { "data": "..." }
9. If question is unclear, respond with {}
`;

    const conversation = messages
      .map((msg: Message) =>
        msg.sender === "user"
          ? `User: "${msg.text}"`
          : `Assistant: "${msg.text}"`
      )
      .join("\n");

    const prompt = `${BASE_PROMPT(
      lat,
      long,
      heatData.heat_index,
      aerosolData
    )}\nConversation:\n${conversation}`;

    // Initialize AI
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL_NAME;
    if (!model)
      throw new Error("GEMINI_MODEL_NAME environment variable not set.");

    const stream = await ai.models.generateContentStream({
      model,
      config: { thinkingConfig: { thinkingBudget: -1 } },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let rawText = "";
    for await (const chunk of stream) {
      if (chunk.text) rawText += chunk.text;
    }

    // Parse JSON safely
    const parsed = rawText.match(/\{[\s\S]*\}/);
    const reply = parsed ? JSON.parse(parsed[0]).data : "";

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in POST handler:", err);
    return new Response(JSON.stringify({ reply: "" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
