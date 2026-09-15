"use client";
import { useState, type KeyboardEvent } from "react";

type Message = { role: "user" | "ai"; text: string };

const initialMessages: Message[] = [
  { role: "ai", text: "Hi there! I am your AI College Copilot. Ask me anything!" },
];

function renderMessage(message: Message) {
  if (message.role === "user") {
    return <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>;
  }

  const blocks: Array<{ type: "paragraph" | "code"; content: string }> = [];
  const parts = message.text.split(/```(?:\w*\n)?/g);

  for (let i = 0; i < parts.length; i++) {
    const content = parts[i].trim();
    if (!content) continue;
    blocks.push({ type: i % 2 === 1 ? "code" : "paragraph", content });
  }

  return blocks.map((block, index) => {
    if (block.type === "code") {
      return (
        <pre
          key={index}
          className="rounded-2xl bg-zinc-950 p-4 text-sm text-zinc-100 overflow-x-auto"
        >
          <code>{block.content}</code>
        </pre>
      );
    }

    return (
      <p key={index} className="whitespace-pre-wrap break-words text-sm leading-6">
        {block.content}
      </p>
    );
  });
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessage: Message = { role: "user", text: trimmed };
    const nextMessages = [...messages, newMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: nextMessages }),
      });

      const data = await res.json();
      const replyText = data.reply || "Sorry, I couldn't get a reply.";

      setMessages((prev) => [...prev, { role: "ai", text: replyText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "Sorry, I couldn't connect to the AI service. Make sure Ollama is running with 'ollama run llama3.2'.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-zinc-950 dark:text-white">
          AI College Copilot
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Ask study questions, coding help, or placement prep advice.
        </p>
      </div>

      <div className="mb-6 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`rounded-2xl p-4 ${
              message.role === "user"
                ? "bg-indigo-600 text-white self-end text-right"
                : "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-white"
            }`}
          >
            {renderMessage(message)}
          </div>
        ))}

        {loading ? (
          <div className="rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            Thinking...
          </div>
        ) : null}
      </div>

      <div className="flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about placement, exams, or coding..."
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={loading}
          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
