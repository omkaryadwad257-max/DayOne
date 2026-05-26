/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Compass, RotateCcw, Settings, Sun, Moon } from "lucide-react";
import Onboarding from "./components/Onboarding";
import EditorialLearnCard from "./components/EditorialLearnCard";
import SettingsDrawer from "./components/SettingsDrawer";

declare const chrome: any;

export default function App() {
  const [completedOnboarding, setCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem("dayone_completed_onboarding") === "true";
  });

  const [streak, setStreak] = useState<number>(() => {
    return Number(localStorage.getItem("dayone_streak") || "4");
  });

  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [onboardingPhase, setOnboardingPhase] = useState<"selection" | "assessment" | "summary">("selection");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("dayone_color_theme") || "dark") as "dark" | "light";
  });

  useEffect(() => {
    const savedTheme = (localStorage.getItem("dayone_color_theme") || "dark") as "dark" | "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["theme", "dayone_color_theme"], (result: any) => {
        const stored = (result && (result.theme || result.dayone_color_theme)) || savedTheme;
        setTheme(stored as "dark" | "light");
        document.documentElement.setAttribute('data-theme', stored);
        localStorage.setItem("dayone_color_theme", stored);
      });
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem("dayone_color_theme", nextTheme);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ theme: nextTheme, dayone_color_theme: nextTheme });
    }
  };

  const handleOnboardingComplete = (selectedTopics: string[]) => {
    localStorage.setItem("dayone_completed_onboarding", "true");
    localStorage.setItem("dayone_selected_topics", JSON.stringify(selectedTopics));
    setCompletedOnboarding(true);
    // Reload streak to stay in sync
    setStreak(Number(localStorage.getItem("dayone_streak") || "4"));
  };

  const handleRestartOnboardingFlow = (phase: "selection" | "assessment") => {
    localStorage.removeItem("dayone_completed_onboarding");
    if (phase === "selection") {
      localStorage.removeItem("dayone_selected_topics");
    }
    setOnboardingPhase(phase);
    setCompletedOnboarding(false);
  };

  const handleResetFresh = () => {
    localStorage.removeItem("dayone_completed_onboarding");
    localStorage.removeItem("dayone_selected_topics");
    localStorage.removeItem("dayone_streak");
    localStorage.removeItem("dayone_completed_today_date");
    localStorage.removeItem("dayone_cached_concept_today");
    localStorage.removeItem("dayone_cached_concept_date");
    localStorage.removeItem("dayone_completed_dates");
    localStorage.removeItem("dayone_assessment_level");
    localStorage.removeItem("dayone_assessment_experience");
    localStorage.removeItem("dayone_assessment_goal");

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.clear();
    }

    setOnboardingPhase("selection");
    setCompletedOnboarding(false);
    setStreak(4);
  };

  return (
    <div className={`min-h-screen bg-theme-bg text-theme-text-primary flex flex-col justify-between p-6 md:p-8 relative overflow-hidden select-none font-sans ${theme === "light" ? "light" : ""}`}>
      
      {/* Dynamic ambient starry background */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-200 animate-stars-drift ${theme === "light" ? "opacity-[0.06] mix-blend-multiply" : "opacity-[0.14] mix-blend-screen"}`}
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 140px 60px, #8b5cf6, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 280px 240px, #a78bfa, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 420px 320px, #6366f1, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 120px 560px, #818cf8, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 640px 480px, #4f46e5, rgba(0,0,0,0)),
            radial-gradient(2.5px 2.5px at 780px 200px, #c084fc, rgba(0,0,0,0))
          `,
          backgroundSize: "400px 400px"
        }}
      />

      {/* Radial soft lavender blur spot with living floating wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 w-[700px] h-[700px] animate-float-drift">
          <div className={`w-full h-full rounded-full blur-[140px] transition-all duration-300 ${theme === "light" ? "bg-indigo-400/[0.12]" : "bg-indigo-500/[0.08]"}`} />
        </div>
      </div>

      {/* HEADER SECTION */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-theme-accent shadow-[0_0_12px_var(--accent)]" />
          <span className="font-extrabold text-sm tracking-[0.3em] text-theme-text-primary font-sans">DAYONE</span>
        </div>
        <div className="flex items-center gap-4">
          {completedOnboarding ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetFresh}
                className="text-[10px] uppercase font-mono tracking-wider text-theme-text-secondary hover:text-theme-text-primary transition-colors bg-theme-surface/50 border border-theme-border px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5"
                title="Reset configuration onboarding"
              >
                <RotateCcw size={11} /> Reset Track
              </button>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/15" id="streak-indicator-container">
                <span>🔥 Day {streak}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-theme-text-secondary bg-theme-accent/5 px-3 py-1.5 rounded-xl border border-theme-border">
              <Sparkles size={11} className="text-theme-accent animate-pulse" />
              <span>ONBOARDING MODE</span>
            </div>
          )}

          {/* Theme Switcher Sun / Moon Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl bg-theme-surface/50 hover:bg-theme-surface border border-theme-border text-theme-text-secondary hover:text-theme-text-primary transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            id="theme-toggle-btn"
          >
            {theme === "dark" ? (
              <Sun size={14} className="text-amber-400" />
            ) : (
              <Moon size={14} className="text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      {/* CONDITIONAL BODY RENDER */}
      {!completedOnboarding ? (
        <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center items-center z-10 py-4">
          <Onboarding onComplete={handleOnboardingComplete} initialPhase={onboardingPhase} />
        </main>
      ) : (
        /* MAIN SINGLE-FOCUS LAYOUT - CENTERED CARD */
        <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center items-center z-10 py-6">
          <div className="w-full flex justify-center py-2">
            <EditorialLearnCard onStreakChange={(newStreak) => setStreak(newStreak)} />
          </div>
        </main>
      )}

      {/* Settings bottom right corner block */}
      {completedOnboarding && (
        <button
          onClick={() => setSettingsOpen(true)}
          className="fixed bottom-6 right-6 p-2 px-3 rounded-xl bg-theme-surface/70 hover:bg-theme-surface border border-theme-border hover:border-theme-accent/30 text-theme-text-secondary hover:text-theme-text-primary transition-all shadow-xl z-30 cursor-pointer flex items-center gap-1.5"
          title="Open Settings"
          id="settings-trigger-btn"
        >
          <Settings size={13} className="animate-[spin_4s_linear_infinite] opacity-60" />
          <span className="text-[10px] font-mono tracking-wider font-bold uppercase select-none">Calibrate</span>
        </button>
      )}

      {/* Slide-in settings calibration panel */}
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onChangeTopic={() => handleRestartOnboardingFlow("selection")}
        onRetakeAssessment={() => handleRestartOnboardingFlow("assessment")}
        onResetFresh={handleResetFresh}
      />

      {/* FOOTER */}
      <footer className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-theme-border text-[10px] text-theme-text-secondary font-mono tracking-wider z-10">
        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
          <Compass size={11} className="text-[#6C63FF]/60" />
          <span>DAYONE CHROME Tab INSIGHTS</span>
        </div>
        <div className="flex gap-4">
          <span>TARGET PLATFORM: MV3</span>
          <span>ESTABLISHED AT CLOUD RUN</span>
        </div>
      </footer>

    </div>
  );
}
