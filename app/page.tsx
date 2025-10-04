"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import dynamic from "next/dynamic";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

export default function Home() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello! How can I help?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Send message
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to state
    const newMessages: Message[] = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      let data: { reply: string };
      if (res.ok) {
        data = await res.json();
      } else {
        data = { reply: "Sorry, something went wrong." };
      }

      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error reaching the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen">
      <MapComponent lat={51.505} long={-0.09} zoom={12} />

      <Button
        className="fixed bottom-4 left-4 z-[1000]"
        onClick={() => setOpen(true)}
      >
        Open Chat
      </Button>

      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md flex flex-col h-[70vh]">
            <div className="px-4 py-2 border-b flex items-center justify-between">
              <span className="font-semibold text-lg">Chat</span>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5 text-gray-600 hover:text-gray-800" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-xl ${msg.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] px-3 py-2 rounded-xl bg-gray-200 text-gray-800">
                    Typing...
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex gap-2">
              <Textarea
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                className="flex-1 resize-none min-h-[40px] max-h-32"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={loading}>
                {loading ? "..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
