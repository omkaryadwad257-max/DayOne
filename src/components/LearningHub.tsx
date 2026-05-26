/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, RotateCcw, AlertCircle, BookOpen, Trophy, Award, Search, CheckCircle, HelpCircle } from "lucide-react";
import { LearningBite, UserProgress } from "../types";

const predefinedCategories = [
  { label: "Computer Science", value: "computer science", icon: "💻" },
  { label: "Astrophysics", value: "astrophysics", icon: "🌌" },
  { label: "UX/UI Design", value: "design", icon: "🎨" },
  { label: "Cognitive Psychology", value: "default", icon: "🧠" }
];

export default function LearningHub() {
  const [currentBite, setCurrentBite] = useState<LearningBite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("computer science");
  const [loadingText, setLoadingText] = useState("De-constructing complex structures...");

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // User Statistics Persistence
  const [stats, setStats] = useState<UserProgress>(() => {
    const saved = localStorage.getItem("dayone_learning_stats");
    if (saved) return JSON.parse(saved);
    return {
      topicCount: 4,
      completedQuizzes: 3,
      streak: 5,
      lastActive: new Date().toISOString()
    };
  });

  useEffect(() => {
    localStorage.setItem("dayone_learning_stats", JSON.stringify(stats));
  }, [stats]);

  // Load initial article based on default selection or fall back
  useEffect(() => {
    fetchLearningBite(selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle loading messages to look incredibly polished
  useEffect(() => {
    if (!loading) return;
    const texts = [
      "Consulting DayOne learning models...",
      "Curating clear semantic structural insights...",
      "Extracting elite conceptual milestones...",
      "Structuring comprehensive interactive challenges...",
      "Synthesizing knowledge blocks..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 2400);
    return () => clearInterval(interval);
  }, [loading]);

  const fetchLearningBite = async (topicQuery: string) => {
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setQuizSubmitted(false);

    try {
      const response = await fetch("/api/learning/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicQuery }),
      });

      if (!response.ok) {
        throw new Error("API network failure");
      }

      const data = (await response.json()) as LearningBite;
      setCurrentBite(data);
      
      // Update stats for reading a new topic
      setStats((prev) => {
        const today = new Date().toDateString();
        const lastActiveDate = new Date(prev.lastActive).toDateString();
        const newStreak = lastActiveDate === today ? prev.streak : prev.streak + 1;
        return {
          ...prev,
          topicCount: prev.topicCount + 1,
          streak: newStreak,
          lastActive: new Date().toISOString()
        };
      });

    } catch (err: any) {
      console.error(err);
      setError("Unable to synthesize dynamic bite. Please ensure server is running or try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (catVal: string) => {
    setSelectedCategory(catVal);
    fetchLearningBite(catVal);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = customTopic.trim();
    if (!query) return;
    fetchLearningBite(query);
  };

  const handleOptionClick = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedOption(idx);
  };

  const submitQuiz = () => {
    if (selectedOption === null || quizSubmitted) return;
    setQuizSubmitted(true);

    const isCorrect = selectedOption === currentBite?.quiz.correctIndex;
    if (isCorrect) {
      setStats((prev) => ({
        ...prev,
        completedQuizzes: prev.completedQuizzes + 1
      }));
    }
  };

  return (
    <div className="w-full max-w-2xl bg-[#111119]/50 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden relative" id="learning-hub-container">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-[#6C63FF]/5 to-transparent pointer-events-none" />

      {/* Hub Header & Stats */}
      <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2.5">
          <BookOpen className="text-[#6C63FF] w-5 h-5" />
          <div>
            <h3 className="text-white font-semibold text-base tracking-tight">Daily Learning Bite</h3>
            <p className="text-xs text-[#7c7c8f] font-medium font-mono">STIMULATE YOUR SYNAPSES ONCE A DAY</p>
          </div>
        </div>

        {/* User Statistics */}
        <div className="flex gap-4 items-center font-mono">
          <div className="flex items-center gap-1.5 p-1 px-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400" title="Daily streak active">
            <Trophy size={12} />
            <span className="text-xs font-bold">{stats.streak}d Streak</span>
          </div>
          <div className="flex items-center gap-1.5 p-1 px-2.5 rounded-lg bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-[#6C63FF]" title="Total bites studied">
            <Award size={12} />
            <span className="text-xs font-bold">{stats.topicCount} Topics</span>
          </div>
        </div>
      </div>

      {/* Navigation and Custom Search */}
      <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01]/50 flex flex-wrap gap-3 items-center justify-between">
        {/* Category Pickers */}
        <div className="flex flex-wrap gap-2">
          {predefinedCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => selectCategory(cat.value)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCategory === cat.value && !customTopic
                  ? "bg-[#6C63FF] border-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/20"
                  : "bg-white/[0.02] border-white/5 text-[#9e9ea3] hover:text-white hover:border-white/10"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Custom Input Search */}
        <form onSubmit={handleCustomSubmit} className="flex-1 min-w-[180px] max-w-sm relative">
          <input
            type="text"
            placeholder="Search custom topic..."
            value={customTopic}
            onChange={(e) => {
              setCustomTopic(e.target.value);
              setSelectedCategory("");
            }}
            className="w-full bg-white/[0.02] border border-white/5 focus:border-[#6C63FF]/30 placeholder-[#555] text-white rounded-xl py-1.5 pl-3 pr-8 text-xs focus:outline-none transition-all"
          />
          <button type="submit" className="absolute right-2 top-1.5 text-white/40 hover:text-white cursor-pointer" title="Search topic">
            <Search size={14} />
          </button>
        </form>
      </div>

      {/* Main Content Pane */}
      <div className="p-6 md:p-8 min-h-[300px] flex flex-col justify-between">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 animate-pulse">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-t-[#6C63FF] border-white/5 animate-spin" />
              <Sparkles className="absolute inset-0 m-auto text-[#6C63FF] animate-bounce" size={16} />
            </div>
            <p className="text-sm font-medium text-white/90">{loadingText}</p>
            <p className="text-[10px] text-[#555] font-mono mt-1.5">GEMINI AI IS ASSEMBLING INSIGHTS</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col justify-center items-center py-12 text-center text-[#ff6B6B] bg-red-500/5 rounded-xl border border-red-500/10 p-6">
            <AlertCircle size={32} className="mb-3 opacity-90" />
            <h4 className="font-semibold text-white">Synthesizer Disrupted</h4>
            <p className="text-xs text-[#a0a0a9] max-w-md mt-1.5">{error}</p>
            <button
              onClick={() => fetchLearningBite(selectedCategory || "computer science")}
              className="mt-4 text-xs font-mono font-bold bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg px-4 py-2 hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw size={12} /> RETRY CONNECTION
            </button>
          </div>
        ) : currentBite ? (
          <div className="space-y-6">
            {/* The Article Body */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF] bg-[#6C63FF]/10 border border-[#6C63FF]/20 rounded px-2 py-0.5">
                  {currentBite.category}
                </span>
                <span className="text-[#444] text-xs font-mono">• 3 MIN STUDY</span>
              </div>
              <h2 className="text-2xl font-bold font-sans text-white tracking-tight mb-3">
                {currentBite.topic}
              </h2>
              <p className="text-sm leading-relaxed text-[#c4c4cc] font-serif whitespace-pre-line" dangerouslySetInnerHTML={{
                __html: currentBite.explanation.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold font-sans">$1</strong>')
              }} />
            </div>

            {/* Core Takeaways */}
            <div className="bg-white/[0.02]/30 p-4 rounded-xl border border-white/[0.03]">
              <h4 className="text-xs font-mono font-bold text-[#8e8e9f] uppercase mb-2.5 tracking-wider">Key Takeaways</h4>
              <ul className="space-y-2">
                {currentBite.takeaway.map((t, idx) => (
                  <li key={idx} className="text-xs leading-relaxed text-[#a0a0ab] flex gap-2">
                    <span className="text-[#6C63FF] font-semibold font-mono">{idx + 1}.</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Comprehension Challenge */}
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-[#6C63FF]" />
                <h4 className="text-sm font-semibold text-white tracking-tight">Active Comprehension Check</h4>
              </div>

              <p className="text-sm font-medium text-[#d4d4dc]">{currentBite.quiz.question}</p>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentBite.quiz.options.map((option, idx) => {
                  let buttonStyle = "bg-white/[0.02] border-white/5 text-[#9ea0a5] hover:bg-white/[0.03] hover:border-white/10";
                  let checkClass = "text-transparent";

                  if (selectedOption === idx) {
                    if (quizSubmitted) {
                      if (idx === currentBite.quiz.correctIndex) {
                        buttonStyle = "bg-green-500/10 border-green-500/40 text-green-300 shadow-lg shadow-green-500/5";
                      } else {
                        buttonStyle = "bg-red-500/10 border-red-500/40 text-red-300";
                      }
                    } else {
                      buttonStyle = "bg-[#6C63FF]/10 border-[#6C63FF]/50 text-[#6C63FF] hover:bg-[#6C63FF]/20";
                    }
                  } else if (quizSubmitted && idx === currentBite.quiz.correctIndex) {
                    // Reveal correct one anyway
                    buttonStyle = "bg-green-500/10 border-green-500/20 text-green-300";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={quizSubmitted}
                      className={`text-left text-xs p-3.5 rounded-xl border font-medium transition-all ${buttonStyle} flex items-start gap-3 relative cursor-pointer group`}
                    >
                      <span className="font-mono bg-white/[0.04] p-1 px-2 rounded-md border border-white/5 group-hover:border-white/10 flex items-center justify-center">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 mt-0.5">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action and Explanations Pane */}
              <div className="flex items-center gap-3 pt-2">
                {!quizSubmitted ? (
                  <button
                    onClick={submitQuiz}
                    disabled={selectedOption === null}
                    className={`px-5 py-2 hover:opacity-100 rounded-xl font-medium tracking-tight text-xs flex items-center gap-2 cursor-pointer border transition-all ${
                      selectedOption === null
                        ? "bg-white/[0.02] text-white/30 border-white/[0.01]"
                        : "bg-[#6C63FF] border-[#6C63FF] hover:bg-[#5C53EF] text-white shadow-xl shadow-[#6C63FF]/20"
                    }`}
                  >
                    SUBMIT ANSWER <ArrowRight size={13} />
                  </button>
                ) : (
                  <div className="w-full bg-[#111119]/80 rounded-xl p-4 border border-white/[0.04] text-xs flex items-start gap-3 slide-up">
                    <CheckCircle className={`shrink-0 mt-0.5 ${
                      selectedOption === currentBite.quiz.correctIndex ? "text-green-400" : "text-red-400"
                    }`} size={16} />
                    <div>
                      <h5 className="font-bold text-white mb-1">
                        {selectedOption === currentBite.quiz.correctIndex ? "Brilliant! Correct reasoning." : "That's incorrect. Keep experimenting!"}
                      </h5>
                      <p className="text-[#a0a0ab] font-sans leading-relaxed">{currentBite.quiz.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex justify-center items-center font-mono">
            <span>NO DATA POPULATED</span>
          </div>
        )}
      </div>
    </div>
  );
}
