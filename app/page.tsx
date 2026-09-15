import ChatBot from "./components/ChatBot";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-10">
        <div className="mb-8 max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600 dark:text-indigo-400">
            AI College Copilot
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            A smarter study chatbot for placement, coding, and exam prep.
          </h1>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
            Ask your questions and get instant study guidance from your AI college assistant.
          </p>
        </div>

        <ChatBot />
      </div>
    </main>
  );
}
