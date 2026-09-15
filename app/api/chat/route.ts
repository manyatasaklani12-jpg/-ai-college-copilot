import { NextResponse } from "next/server";

type Message = { role: "user" | "ai"; text: string };

const SYSTEM_PROMPT = `You are AI College Copilot.\n\nRules:\n- Answer the user's question directly.\n- Do NOT ask for their branch, year, or college unless absolutely necessary.\n- Be friendly and conversational.\n- If the user says "hi", simply greet them back.\n- Give concise answers.\n- Do not interview the user.\n- Help with studies, coding, projects, placements, and general questions.\n\n`;

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

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2",
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({ reply: data.response });
  } catch (error: any) {
    console.error("Ollama Error:", error);
    return NextResponse.json({
      reply:
        "Sorry, I couldn't connect to the local AI model. Make sure Ollama is running with 'ollama run llama3.2'.",
    });
  }
}
