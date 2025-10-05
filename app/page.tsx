"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { increaseLatLng } from "@/lib/coordsUtils";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function Home() {
  // --- UI States ---
  const [openChat, setOpenChat] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  // --- Chat State ---
  const [messages, setMessages] = useState<Message[]>([{ sender: "bot", text: "Hello! How can I help?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // --- City Search State ---
  const [cityInput, setCityInput] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);

  // --- Map State ---
  const [lat, setLat] = useState(26.66371);
  const [long, setLong] = useState(87.27403);
  const [selectedCity, setSelectedCity] = useState<{ lat: number; long: number } | null>(null);

  // --- Aerosol State ---
  const [aerosolData, setAerosolData] = useState<any[]>([]);
  const [aerosolLoading, setAerosolLoading] = useState(false);

  // --- Handlers ---
  // Send chat message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          lat: selectedCity?.lat ?? lat,
          long: selectedCity?.long ?? long,
        }),
      });

      const data = res.ok ? await res.json() : { reply: "Sorry, something went wrong." };
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { sender: "bot", text: "Error reaching the server." }]);
    } finally {
      setLoading(false);
    }
  };

  // Search for a city
  const searchCity = async () => {
    if (!cityInput.trim()) return;

    setCityLoading(true);
    setCityError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GEOCODING_API_URL}?name=${encodeURIComponent(cityInput)}&count=10&language=en&format=json`
      );
      const data = await res.json();

      if (data.results?.length) {
        const city = data.results[0];
        setLat(city.latitude);
        setLong(city.longitude);
        setSelectedCity({ lat: city.latitude, long: city.longitude });
        setOpenCity(false);
      } else {
        setCityError("City not found.");
      }
    } catch {
      setCityError("Error fetching city data.");
    } finally {
      setCityLoading(false);
    }
  };

  // Fetch aerosol data
  const handleCheckAerosol = async () => {
    setAerosolLoading(true);

    try {
      const { latStart, latEnd, lngStart, lngEnd } = increaseLatLng(lat, long);
      const url = `${process.env.NEXT_PUBLIC_HOST_AEROSOL_API_URL}?latstart=${latStart}&latend=${latEnd}&lonstart=${lngStart}&lonend=${lngEnd}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.predictions) setAerosolData(data.predictions);
    } catch (error) {
      console.error("Error fetching aerosol data:", error);
    } finally {
      setAerosolLoading(false);
    }
  };

  // --- Render ---
  return (
    <main className="relative min-h-screen">
      <MapComponent lat={lat} long={long} zoom={15} aerosolData={aerosolData} />

      {/* Action Buttons */}
      <div className="fixed bottom-4 left-4 z-[1000] flex flex-wrap gap-2 max-w-[95vw]">
        {[
          { label: "Find City", onClick: () => setOpenCity(true) },
          { label: aerosolLoading ? "Loading..." : "Check Aerosol", onClick: handleCheckAerosol },
          { label: "UrbanEye 🌳", onClick: () => setOpenChat(true) },
        ].map((btn, i) => (
          <Button key={i} className="flex-1 min-w-[120px]" onClick={btn.onClick}>
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Chat Modal */}
      {openChat && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md flex flex-col h-[70vh]">
            <div className="px-4 py-2 border-b flex items-center justify-between">
              <span className="font-semibold text-lg">Chat</span>
              <button onClick={() => setOpenChat(false)}>
                <X className="h-5 w-5 text-gray-600 hover:text-gray-800" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-xl ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] px-3 py-2 rounded-xl bg-gray-200 text-gray-800">Typing...</div>
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

      {/* City Modal */}
      {openCity && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md flex flex-col h-auto">
            <div className="px-4 py-2 border-b flex items-center justify-between">
              <span className="font-semibold text-lg">Find City</span>
              <button onClick={() => setOpenCity(false)}>
                <X className="h-5 w-5 text-gray-600 hover:text-gray-800" />
              </button>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-3">
              <Input
                placeholder="Enter city name..."
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
              />
              <Button onClick={searchCity} disabled={cityLoading} className="w-full">
                {cityLoading ? "Searching..." : "Search"}
              </Button>
              {cityError && <p className="text-sm text-red-500">{cityError}</p>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
