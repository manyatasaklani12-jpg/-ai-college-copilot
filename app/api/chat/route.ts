import { NextResponse } from "next/server";

type Message = { role: "user" | "ai"; text: string };

const SYSTEM_PROMPT = `You are AI College Copilot.

Rules:
- Answer the user's question directly.
- Do NOT ask for their branch, year, or college unless absolutely necessary.
- Be friendly and conversational.
- If the user says "hi", simply greet them back.
- Give concise answers.
- Do not interview the user.
- Help with studies, coding, projects, placements, and general questions.
`;

function buildPrompt(history: Message[]) {
  const trimmedHistory = history.slice(-12);

  let prompt = SYSTEM_PROMPT;

  for (const message of trimmedHistory) {
    if (message.role === "user") {
      prompt += `User: ${message.text}\n`;
    } else {
      prompt += `Assistant: ${message.text}\n`;
    }
  }

  prompt += "Assistant: ";

  return prompt;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const history = Array.isArray(body?.history) ? body.history : null;

    if (!history || history.length === 0) {
      return NextResponse.json(
        { reply: "Please enter a message." },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(history);

    // Check that Vercel has the OpenRouter API key
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is missing in Vercel");
    }

    // OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.2-3b-instruct:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter returned ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI Error:", error);

    return NextResponse.json({
      reply: "Sorry, I couldn't connect to the AI service right now.",
    });
  }
}