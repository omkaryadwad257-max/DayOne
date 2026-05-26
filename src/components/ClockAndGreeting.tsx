/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Edit2, Check } from "lucide-react";

export default function ClockAndGreeting() {
  const [time, setTime] = useState(new Date());
  const [name, setName] = useState(() => {
    return localStorage.getItem("dayone_user_name") || "Omkar";
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setName(trimmed);
      localStorage.setItem("dayone_user_name", trimmed);
    }
    setIsEditingName(false);
  };

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const formattedDate = time.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const hours = time.getHours();
  let greeting = "Good evening";
  if (hours < 12) greeting = "Good morning";
  else if (hours < 18) greeting = "Good afternoon";

  return (
    <div className="flex flex-col items-center justify-center text-center py-6 select-none" id="clock-section">
      {/* Date */}
      <span className="text-xs uppercase tracking-widest text-theme-accent font-mono font-semibold mb-2 flex items-center gap-1.5 bg-theme-accent/10 px-3 py-1 rounded-full border border-theme-accent/20 animate-fade-in">
        <Sparkles size={11} className="text-theme-accent" />
        {formattedDate}
      </span>

      {/* Clock */}
      <h1 className="text-6xl md:text-7xl font-sans font-extrabold tracking-tighter text-theme-text-primary mb-2">
        {formattedTime}
      </h1>

      {/* Customizable Greeting */}
      <div className="flex items-center justify-center gap-2 group min-h-[36px]">
        {isEditingName ? (
          <div className="flex items-center gap-2 bg-theme-surface/50 border border-theme-border px-3 py-1 rounded-lg">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              className="bg-transparent text-theme-text-primary text-lg font-medium focus:outline-none w-32 text-center"
              maxLength={15}
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="text-theme-accent hover:text-theme-text-primary transition-colors"
              title="Save name"
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-medium text-theme-text-secondary tracking-tight">
              {greeting}, <span className="text-theme-text-primary font-semibold">{name}</span>.
            </span>
            <button
              onClick={() => {
                setTempName(name);
                setIsEditingName(true);
              }}
              className="text-theme-text-secondary/50 hover:text-theme-text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer bg-transparent border-0"
              title="Edit name"
            >
              <Edit2 size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
