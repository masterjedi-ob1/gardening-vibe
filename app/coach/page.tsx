"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Sprout, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "What should I do in the garden today?",
  "How are my tomatoes doing?",
  "The Cherokee Purple looks droopy — what's wrong?",
  "When will the Sun Gold tomatoes be ready?",
  "How do I stake my indeterminate tomatoes?",
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm the Green Thumb — here to help you and Bill tend your Summer 2026 garden with care and calm. What's on your mind today? 🌱",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const userText = text ?? input.trim();
    if (!userText || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply ?? data.error ?? "Something went wrong." }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "I'm having trouble connecting right now. Try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Chat thread */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-4 pb-40">
        <div className="text-center space-y-1 py-4">
          <Sprout className="h-8 w-8 text-garden-600 mx-auto" />
          <h1 className="font-bold text-stone-800">The Green Thumb</h1>
          <p className="text-xs text-stone-400">Your AI garden coach · grounded in your real garden</p>
        </div>

        {/* Starter chips */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-garden-200 text-garden-700 bg-garden-50 hover:bg-garden-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-garden-600 text-white rounded-br-sm"
                  : "bg-white border border-stone-200 text-stone-800 rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-garden-500" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input bar — sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-stone-200 bg-white/95 backdrop-blur-sm px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask the Green Thumb anything…"
            className="flex-1 rounded-xl border border-stone-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-garden-500 bg-white"
          />
          <Button onClick={() => sendMessage()} disabled={!input.trim() || loading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
