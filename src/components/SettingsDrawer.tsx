/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flame, RotateCcw, BookOpen, UserCheck, Calendar, RefreshCw, ChevronRight } from "lucide-react";

declare const chrome: any;

const StorageUtil = {
  set: (key: string, value: any) => {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [key]: value });
    }
  },
  get: (key: string, defaultValue: any) => {
    const val = localStorage.getItem(key);
    if (val === null) return defaultValue;
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
};

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeTopic: () => void;
  onRetakeAssessment: () => void;
  onResetFresh: () => void;
}

export default function SettingsDrawer({
  isOpen,
  onClose,
  onChangeTopic,
  onRetakeAssessment,
  onResetFresh
}: SettingsDrawerProps) {
  const [streak, setStreak] = useState<number>(4);
  const [topics, setTopics] = useState<string[]>(["coding"]);
  const [level, setLevel] = useState<string>("Beginner");
  
  // Fetch active configurations whenever drawer is opened
  useEffect(() => {
    if (isOpen) {
      setStreak(Number(StorageUtil.get("dayone_streak", 4)));
      
      const topicsLoaded = StorageUtil.get("dayone_selected_topics", ["coding"]);
      setTopics(Array.isArray(topicsLoaded) ? topicsLoaded : [topicsLoaded]);
      
      setLevel(StorageUtil.get("dayone_assessment_level", "Beginner"));
    }
  }, [isOpen]);

  // Retrieve complete dates list or generate a reactive template
  const getCompletedDates = (): string[] => {
    const stored = localStorage.getItem("dayone_completed_dates");
    if (!stored) {
      // Seed initial mock items to match current streak
      const seeded: string[] = [];
      const streakVal = Number(StorageUtil.get("dayone_streak", 4));
      const completedTodayFlag = StorageUtil.get("dayone_completed_today_date", "") === new Date().toDateString();
      
      const today = new Date();
      let startOffset = completedTodayFlag ? 0 : 1;
      for (let i = 0; i < streakVal; i++) {
        const d = new Date();
        d.setDate(today.getDate() - (startOffset + i));
        seeded.push(d.toDateString());
      }
      StorageUtil.set("dayone_completed_dates", seeded);
      return seeded;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  };

  const completedList = getCompletedDates();

  // Generate the last 28 days chronologically
  const days: { date: Date; completed: boolean; isToday: boolean }[] = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    days.push({
      date: d,
      completed: completedList.includes(d.toDateString()),
      isToday: d.toDateString() === today.toDateString()
    });
  }

  const formatTopicLabel = (slug: string) => {
    return slug
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* SEMI-TRANSPARENT BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer"
            id="settings-drawer-backdrop"
          />

          {/* RIGHT DRAWERS SLIDE */}
          <motion.div
            initial={{ x: "100%", opacity: 0.95 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm sm:max-w-md bg-theme-surface/95 text-theme-text-primary border-l border-theme-border shadow-2xl z-50 p-6 md:p-8 overflow-y-auto flex flex-col justify-between"
            id="settings-drawer-container"
          >
            <div>
              {/* Header section with Close */}
              <div className="flex items-center justify-between pb-6 border-b border-theme-border mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-theme-accent shadow-[0_0_10px_var(--accent)]" />
                  <span className="font-extrabold text-sm tracking-wider uppercase font-sans">
                    DayOne Calibration
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-theme-accent/10 text-theme-text-secondary hover:text-theme-text-primary transition-colors cursor-pointer border-0 bg-transparent"
                  aria-label="Close drawer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* CORE EDIT TRACK SECTION */}
              <div className="space-y-6">
                
                {/* 1. TOPICS CONFIGURATION */}
                <div className="bg-theme-surface/50 border border-theme-border p-4 rounded-2xl relative overflow-hidden space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-theme-text-secondary uppercase font-bold">
                    <BookOpen size={11} className="text-theme-accent" />
                    ACTIVE TRACKS
                  </div>
                  <div>
                    <span className="text-[10px] text-theme-text-secondary block mb-1">Current Focus:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {topics.map((t) => (
                        <span
                          key={t}
                          className="text-xs font-mono font-medium bg-theme-accent/15 border border-theme-accent/30 text-theme-text-primary px-2.5 py-1 rounded-lg"
                        >
                          {formatTopicLabel(t)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onChangeTopic();
                      }}
                      className="text-xs font-semibold text-theme-accent-soft hover:text-theme-accent hover:underline border-0 bg-transparent p-0 cursor-pointer"
                    >
                      Change topic focus <ChevronRight size={12} />
                    </button>
                  </div>
                </div>

                {/* 2. LEVEL CONFIGURATION */}
                <div className="bg-theme-surface/50 border border-theme-border p-4 rounded-2xl relative overflow-hidden space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-theme-text-secondary uppercase font-bold">
                    <UserCheck size={11} className="text-theme-accent" />
                    ASSESSMENT PROFILE
                  </div>
                  <div>
                    <span className="text-[10px] text-theme-text-secondary block mb-1">Target Proficiency:</span>
                    <span className="text-xs font-mono font-bold text-theme-text-primary bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded-lg">
                      {level}
                    </span>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onRetakeAssessment();
                      }}
                      className="text-xs font-semibold text-theme-accent-soft hover:text-theme-accent hover:underline border-0 bg-transparent p-0 cursor-pointer"
                    >
                      Retake learning assessment <ChevronRight size={12} />
                    </button>
                  </div>
                </div>

                {/* 3. CALENDAR STREAK HISTORY GRID */}
                <div className="bg-theme-surface/50 border border-theme-border p-4 rounded-2xl relative overflow-hidden space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-theme-text-secondary uppercase font-bold">
                      <Calendar size={11} className="text-orange-400 animate-pulse" />
                      STREAK MATRIX
                    </div>
                    <span className="text-[10px] font-mono font-bold text-orange-400">
                      🔥 {streak} days
                    </span>
                  </div>

                  <p className="text-[10px] text-theme-text-secondary leading-relaxed max-w-xs font-sans">
                     Completing lessons secures your continuous daily compound streak. Grid shows study dates for the last 4 weeks.
                  </p>

                  {/* 28-day chronological contribution cells */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, ix) => (
                        <span key={ix} className="text-[9px] font-mono text-theme-text-secondary/70 font-semibold animate-fade-in">
                          {day}
                        </span>
                      ))}
                      {days.map((dayObj, i) => (
                        <div
                          key={i}
                          className={`relative aspect-square flex items-center justify-center rounded-lg transition-all ${
                            dayObj.completed
                              ? "bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.15)]"
                              : dayObj.isToday
                                ? "bg-theme-accent/15 border border-theme-accent/40 text-theme-accent-soft animate-pulse"
                                : "bg-theme-surface/40 border border-theme-border text-theme-text-secondary/60"
                          }`}
                          title={`${dayObj.date.toLocaleDateString()}: ${
                            dayObj.completed ? "Completed study session" : "No study record"
                          }`}
                        >
                          <span className="text-[8px] font-mono font-bold">{dayObj.date.getDate()}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar legend */}
                    <div className="flex items-center justify-end gap-3 text-[9px] font-mono text-theme-text-secondary/80 pt-1.5">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded bg-theme-surface/40 border border-theme-border" />
                        <span>Empty</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded bg-theme-accent/15 border border-theme-accent/40 animate-pulse" />
                        <span>Today</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded bg-emerald-500/15 border border-emerald-500/35" />
                        <span>Done</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* LOWER RESET ACTIONS BLOCK */}
            <div className="pt-6 border-t border-theme-border space-y-4">
              <button
                onClick={() => {
                  const confirm = window.confirm("Are you sure you want to completely erase all DayOne study history, streaks, and focus metrics? This action is permanent.");
                  if (confirm) {
                    onResetFresh();
                    onClose();
                  }
                }}
                className="w-full bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 hover:border-red-500/35 py-3 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={12} /> EASE DATA & FRESH RESET
              </button>
              <div className="text-[9px] text-center text-[#444452] font-mono tracking-wider">
                DAYONE INSIGHT ENGINE • MV3 EXTENSION MODULE
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
