"use client";

import { Ghost, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const loadingMessages = [
  "👻 Boo is conjuring your perfect event plan...",
  "🔮 Consulting the spectral party planners...",
  "👻 Summoning ghostly volunteers...",
  "🌙 Channeling supernatural organization skills...",
  "⚡ Gathering phantom helpers...",
  "✨ Weaving a web of spooky coordination...",
  "👻 Boo is haunting up some great ideas...",
  "🌟 Materializing ethereal event magic...",
  "🎃 Carving out the perfect volunteer slots...",
  "👻 Floating through event possibilities...",
];

export function AILoading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Rotate messages every 3 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-8 py-12">
      {/* Animated robot with sparkles */}
      <div className="relative">
        <div className="absolute inset-0 animate-pulse">
          <Sparkles className="-left-6 -top-6 absolute h-6 w-6 animate-spin text-yellow-500" />
          <Sparkles
            className="-right-6 -top-6 absolute h-6 w-6 animate-spin text-purple-500"
            style={{ animationDelay: "0.5s" }}
          />
          <Sparkles
            className="-left-6 -bottom-6 absolute h-6 w-6 animate-spin text-pink-500"
            style={{ animationDelay: "1s" }}
          />
          <Sparkles
            className="-right-6 -bottom-6 absolute h-6 w-6 animate-spin text-blue-500"
            style={{ animationDelay: "1.5s" }}
          />
        </div>
        <Ghost className="relative h-20 w-20 animate-bounce text-primary" />
      </div>

      {/* Loading message */}
      <div className="space-y-2 text-center">
        <p className="font-medium text-foreground text-lg">
          {loadingMessages[messageIndex]}
        </p>
        <p className="text-muted-foreground text-sm">
          Boo is crafting your perfect event setup{dots}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-primary"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      {/* Fun fact */}
      <div className="max-w-md rounded-lg bg-muted/50 p-4">
        <p className="text-center text-muted-foreground text-sm">
          💡 <span className="font-medium">Did you know?</span> Boo has helped
          organize over 1,000 community events, from spooky soirées to
          delightful potlucks!
        </p>
      </div>
    </div>
  );
}
