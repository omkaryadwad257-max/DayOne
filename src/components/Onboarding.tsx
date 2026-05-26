/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Megaphone, Palette, Code, Coins, TrendingUp, 
  PenTool, Award, Cpu, Mic, Zap, ArrowRight, Sparkles, Check, ChevronLeft, Lightbulb, Compass
} from "lucide-react";

declare const chrome: any;

// Cross-environment storage helper
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

interface OnboardingProps {
  onComplete: (selectedTopics: string[]) => void;
  initialPhase?: "selection" | "assessment" | "summary";
}

const TOPICS = [
  { id: "marketing", label: "Marketing", icon: Megaphone, color: "text-rose-400 bg-rose-400/15" },
  { id: "design", label: "Design", icon: Palette, color: "text-amber-400 bg-amber-400/15" },
  { id: "coding", label: "Coding", icon: Code, color: "text-cyan-400 bg-cyan-400/15" },
  { id: "finance", label: "Finance", icon: Coins, color: "text-emerald-400 bg-emerald-400/15" },
  { id: "sales", label: "Sales", icon: TrendingUp, color: "text-teal-400 bg-teal-400/15" },
  { id: "writing", label: "Writing", icon: PenTool, color: "text-purple-400 bg-purple-400/15" },
  { id: "leadership", label: "Leadership", icon: Award, color: "text-yellow-400 bg-yellow-400/15" },
  { id: "ai_automation", label: "AI & Automation", icon: Cpu, color: "text-indigo-400 bg-indigo-400/15" },
  { id: "public_speaking", label: "Public Speaking", icon: Mic, color: "text-sky-400 bg-sky-400/15" },
  { id: "productivity", label: "Productivity", icon: Zap, color: "text-pink-400 bg-pink-400/15" },
];

interface Question {
  id: string;
  type: "select" | "choice" | "text";
  text: string;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

function getQuestionsForTopic(topicId: string, topicLabel: string): Question[] {
  if (topicId === "coding") {
    return [
      {
        id: "experience",
        type: "select",
        text: "Have you ever written a production loop, script, or web app?",
        options: [
          { label: "Yes, regularly", value: "yes" },
          { label: "No, never", value: "no" },
          { label: "I've tinkered, but not sure", value: "maybe" }
        ]
      },
      {
        id: "level",
        type: "choice",
        text: "Which of these concepts feels most familiar to you?",
        options: [
          { label: "Variables & basic loops", value: "Beginner" },
          { label: "API integration & state management", value: "Intermediate" },
          { label: "System architecture & CI/CD", value: "Advanced" }
        ]
      },
      {
        id: "goal",
        type: "text",
        text: "What's the one thing you most want to understand or build first?",
        placeholder: "e.g. build an interactive React game, optimize database schemas..."
      }
    ];
  }

  if (topicId === "marketing") {
    return [
      {
        id: "experience",
        type: "select",
        text: "Have you ever run a paid advertising or social media campaign?",
        options: [
          { label: "Yes, successfully", value: "yes" },
          { label: "No, never", value: "no" },
          { label: "Just helped with one", value: "maybe" }
        ]
      },
      {
        id: "level",
        type: "choice",
        text: "Which of these marketing concepts feels most familiar?",
        options: [
          { label: "Content creation & SEO basics", value: "Beginner" },
          { label: "A/B testing & funnels", value: "Intermediate" },
          { label: "Customer acquisition cost (CAC) calculations", value: "Advanced" }
        ]
      },
      {
        id: "goal",
        type: "text",
        text: "What's the one thing you most want to understand or accomplish?",
        placeholder: "e.g. acquire my first 100 users, write ad copy..."
      }
    ];
  }

  if (topicId === "design") {
    return [
      {
        id: "experience",
        type: "select",
        text: "Have you ever built interactive user interface mockups or style guides?",
        options: [
          { label: "Yes, as a core role", value: "yes" },
          { label: "No, not yet", value: "no" },
          { label: "Just casual wireframes", value: "maybe" }
        ]
      },
      {
        id: "level",
        type: "choice",
        text: "Which of these design tools or concepts feels most familiar with?",
        options: [
          { label: "Simple wireframes & color theory", value: "Beginner" },
          { label: "Figma components & auto-layout", value: "Intermediate" },
          { label: "Design systems & interactive tokens", value: "Advanced" }
        ]
      },
      {
        id: "goal",
        type: "text",
        text: "What's the one thing you most want to master first?",
        placeholder: "e.g. design modern dark-theme layouts, structure layout grids..."
      }
    ];
  }

  // Fallback / default template for generic or custom topics
  return [
    {
      id: "experience",
      type: "select",
      text: `Have you ever applied ${topicLabel} skills in a professional or personal project?`,
      options: [
        { label: "Yes, extensively", value: "yes" },
        { label: "No, I'm starting from scratch", value: "no" },
        { label: "I have some basic exposure", value: "maybe" }
      ]
    },
    {
      id: "level",
      type: "choice",
      text: `Which description best matches your current maturity in ${topicLabel}?`,
      options: [
        { label: "Curious beginner exploring foundational concepts", value: "Beginner" },
        { label: "Competent practitioner solving active issues", value: "Intermediate" },
        { label: "Experienced strategist leading initiatives", value: "Advanced" }
      ]
    },
    {
      id: "goal",
      type: "text",
      text: `What's the one thing you most want to master or address in ${topicLabel}?`,
      placeholder: `e.g. excel at key concepts, accelerate professional outcomes...`
    }
  ];
}

export default function Onboarding({ onComplete, initialPhase }: OnboardingProps) {
  // Phase state: "selection" | "assessment" | "summary"
  const [phase, setPhase] = useState<"selection" | "assessment" | "summary">(() => {
    return initialPhase || "selection";
  });
  
  // Selection Page states
  const [selected, setSelected] = useState<string[]>(() => {
    return StorageUtil.get("dayone_selected_topics", []);
  });
  const [customTopic, setCustomTopic] = useState("");
  const [customList, setCustomList] = useState<string[]>([]);

  // Assessment states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    experience: "",
    level: "Beginner",
    goal: ""
  });
  
  // Sliding animation direction
  const [direction, setDirection] = useState(1); // 1 for next, -1 for back

  // Process selected topics
  const primaryTopicId = selected[0] || "coding";
  const primaryTopicLabel = TOPICS.find(t => t.id === primaryTopicId)?.label || primaryTopicId;
  const questionsList = getQuestionsForTopic(primaryTopicId, primaryTopicLabel);

  // Toggle selection on screen 1
  const handleToggle = (id: string) => {
    setSelected((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Add custom tag
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTopic.trim();
    if (trimmed && !customList.includes(trimmed)) {
      setCustomList((prev) => [...prev, trimmed]);
      setSelected((prev) => [...prev, trimmed]);
      setCustomTopic("");
    }
  };

  const handleRemoveCustom = (topic: string) => {
    setCustomList((prev) => prev.filter(t => t !== topic));
    setSelected((prev) => prev.filter(t => t !== topic));
  };

  const hasSelection = selected.length > 0;

  // Handle CTA on Screen 1
  const handleBeginOnboarding = () => {
    if (!hasSelection) return;
    StorageUtil.set("dayone_selected_topics", selected);
    setPhase("assessment");
    setCurrentQuestionIdx(0);
  };

  // Answer handling for Step 2
  const handleAnswerSelect = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    StorageUtil.set(`dayone_assessment_${key}`, value);

    // Auto-advance for select items to feel snappy
    if (key === "experience") {
      setTimeout(() => {
        setDirection(1);
        setCurrentQuestionIdx(1);
      }, 250);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questionsList.length - 1) {
      setDirection(1);
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setPhase("summary");
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setDirection(-1);
      setCurrentQuestionIdx(prev => prev - 1);
    } else {
      setPhase("selection");
    }
  };

  const handleFinish = () => {
    StorageUtil.set("dayone_completed_onboarding", "true");
    onComplete(selected);
  };

  // Variants for conversational transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0
    })
  };

  // State 1: TOPIC SELECTION
  if (phase === "selection") {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col justify-center items-center py-6 px-4 select-none text-center">
        {/* Dynamic ambient header badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-widest text-theme-accent font-mono font-bold mb-4 flex items-center gap-1.5 bg-theme-accent/10 px-4 py-1.5 rounded-full border border-theme-accent/20"
        >
          <Sparkles size={12} className="text-theme-accent" />
          SCREEN 1: TOPIC SELECTION
        </motion.div>

        {/* Warm Interactive Headings */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-theme-text-primary mb-3">
            What do you want to <span className="bg-gradient-to-r from-theme-accent to-theme-accent-soft bg-clip-text text-transparent">get good at?</span>
          </h1>
          <p className="text-sm md:text-base text-theme-text-secondary max-w-xl mx-auto mb-10 leading-relaxed font-sans">
            Select the elite skills you want to level up. We generate daily focus sprints, cognitive checkpoints, and strategic insights customized to your growth.
          </p>
        </motion.div>

        {/* Grid of topic cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 w-full mb-8"
        >
          {TOPICS.map((topic, idx) => {
            const isSelected = selected.includes(topic.id);
            const Icon = topic.icon;
            return (
              <div
                key={topic.id}
                onClick={() => handleToggle(topic.id)}
                className={`group relative p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-3.5 cursor-pointer select-none transition-all duration-300 transform hover:-translate-y-1.5 ${
                  isSelected 
                    ? "bg-theme-accent/20 border-theme-accent text-theme-text-primary shadow-xl shadow-theme-accent/10 scale-[1.03]"
                    : "bg-theme-surface/55 border-theme-border text-theme-text-secondary hover:bg-theme-surface/80 hover:border-theme-accent/20 hover:text-theme-text-primary"
                }`}
              >
                {/* Soft decorative status light */}
                <div className={`absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isSelected ? "bg-theme-accent shadow-[0_0_8px_var(--accent)]" : "bg-transparent"
                }`} />

                <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                  isSelected ? "bg-theme-accent/30 text-theme-text-primary" : topic.color
                }`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-semibold tracking-tight">{topic.label}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Custom Topic Input */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="w-full max-w-lg space-y-4 mb-10 bg-theme-surface/30 p-5 rounded-2xl border border-theme-border"
        >
          <span className="text-[10px] font-mono tracking-widest text-theme-text-secondary uppercase block text-center font-bold">
            SOMETHING ELSE ON YOUR MIND?
          </span>
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              placeholder="Type custom skill, topic or technology (e.g. Kubernetes, Watercolor)"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="flex-1 bg-theme-bg border border-theme-border focus:border-theme-accent/40 text-theme-text-primary rounded-xl px-4 py-2 text-xs focus:outline-none transition-all placeholder-theme-text-secondary/70"
              maxLength={35}
            />
            <button
              type="submit"
              className="bg-theme-accent/15 hover:bg-theme-accent text-theme-text-primary hover:text-white px-3.5 rounded-xl border border-theme-accent/25 hover:border-theme-accent transition-all cursor-pointer text-xs font-semibold"
              title="Add Custom Subject"
            >
              Add
            </button>
          </form>

          {/* Custom list chips rendering */}
          {customList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center pt-2">
              {customList.map((tag) => (
                <span
                  key={tag}
                  onClick={() => handleRemoveCustom(tag)}
                  className="text-[10px] font-mono font-medium bg-theme-accent/20 border border-theme-accent/30 text-theme-text-primary px-2.5 py-1 rounded-lg cursor-pointer hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-all flex items-center gap-1"
                  title="Click to remove"
                >
                  {tag} <span className="text-theme-text-secondary/55 font-sans">×</span>
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Bottom CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="w-full flex justify-center"
        >
          <button
            onClick={handleBeginOnboarding}
            disabled={!hasSelection}
            className={`px-8 py-3 rounded-full text-sm font-bold tracking-wide flex items-center gap-2.5 transition-all duration-300 transform active:scale-95 ${
              hasSelection
                ? "bg-theme-accent hover:bg-theme-accent-soft text-white shadow-xl shadow-theme-accent/30 hover:shadow-theme-accent/50 cursor-pointer"
                : "bg-theme-surface/30 border border-theme-border text-theme-text-secondary/20 select-none cursor-not-allowed"
            }`}
          >
            LET'S BEGIN <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>
    );
  }

  // State 2: EXPERTISE ASSESSMENT
  if (phase === "assessment") {
    const currentQuestion = questionsList[currentQuestionIdx];
    const progresses = Array.from({ length: questionsList.length });

    return (
      <div className="w-full max-w-xl mx-auto flex flex-col justify-start items-center py-10 px-4 min-h-[70vh]">
        
        {/* Dynamic header navigation */}
        <div className="w-full flex justify-between items-center mb-10">
          <button
            onClick={handlePrevQuestion}
            className="flex items-center gap-1 text-xs text-theme-text-secondary hover:text-theme-text-primary bg-theme-surface/50 border border-theme-border hover:border-theme-accent/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ChevronLeft size={13} /> Back
          </button>
          
          {/* Progress indicators */}
          <div className="flex items-center gap-2">
            {progresses.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentQuestionIdx 
                    ? "w-8 bg-theme-accent" 
                    : idx < currentQuestionIdx 
                      ? "w-3 bg-theme-accent-soft/70" 
                      : "w-2 bg-theme-text-secondary/20"
                }`}
              />
            ))}
          </div>

          <span className="text-[10px] font-mono tracking-widest text-[#7c7c8f] uppercase">
            Q {currentQuestionIdx + 1} OF {questionsList.length}
          </span>
        </div>

        {/* Conversational Assessment Panel */}
        <div className="w-full relative overflow-hidden min-h-[340px] flex flex-col justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestionIdx}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full bg-theme-surface/50 backdrop-blur-2xl border border-theme-border rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col gap-6"
            >
              {/* Context label */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-theme-accent uppercase font-bold bg-theme-accent/10 px-2.5 py-1 rounded-lg">
                  {primaryTopicLabel.toUpperCase()} ASSESSMENT
                </span>
                <span className="text-theme-text-secondary font-mono text-[10px]">• CHAT STREAM</span>
              </div>

              {/* Dynamic Conversational Question Text */}
              <h2 className="text-xl md:text-2xl font-bold text-theme-text-primary tracking-tight leading-snug">
                {currentQuestion.text}
              </h2>

              {/* INPUT TYPES FIELDS */}
              <div className="space-y-3 w-full mt-2">
                
                {/* 1. SELECT PILLS (YES / NO / MAYBE) */}
                {currentQuestion.type === "select" && currentQuestion.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentQuestion.options.map((opt) => {
                      const isChosen = answers[currentQuestion.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswerSelect(currentQuestion.id, opt.value)}
                          className={`p-4 rounded-xl text-left border text-xs font-semibold tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-between ${
                            isChosen
                              ? "bg-theme-accent/20 border-theme-accent text-theme-text-primary shadow-lg shadow-theme-accent/10 scale-[1.02]"
                              : "bg-theme-surface/30 border-theme-border text-theme-text-secondary hover:bg-theme-surface/60 hover:border-theme-accent/20 hover:text-theme-text-primary"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isChosen && <div className="w-2 h-2 rounded-full bg-theme-accent shadow-[0_0_8px_var(--accent)]" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. MULTIPLE CHOICE SELECT (LEVEL DEFINITION) */}
                {currentQuestion.type === "choice" && currentQuestion.options && (
                  <div className="flex flex-col gap-2.5">
                    {currentQuestion.options.map((opt) => {
                      const isChosen = answers[currentQuestion.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswerSelect(currentQuestion.id, opt.value)}
                          className={`p-4 rounded-xl text-left border text-xs font-medium tracking-wide transition-all duration-300 transform hover:translate-x-1 flex items-center justify-between cursor-pointer ${
                            isChosen
                              ? "bg-theme-accent/20 border-theme-accent text-theme-text-primary shadow-lg shadow-theme-accent/10"
                              : "bg-theme-surface/30 border-theme-border text-theme-text-secondary hover:bg-theme-surface/60 hover:border-theme-accent/20 hover:text-theme-text-primary"
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-theme-accent-soft bg-theme-accent/10 px-2 py-0.5 rounded ml-2 font-bold">
                            {opt.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. OPEN TEXT (USER PERSONAL GOAL) */}
                {currentQuestion.type === "text" && (
                  <div className="space-y-3">
                    <textarea
                      placeholder={currentQuestion.placeholder}
                      value={answers[currentQuestion.id]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
                        StorageUtil.set(`dayone_assessment_${currentQuestion.id}`, val);
                      }}
                      className="w-full h-32 bg-theme-bg border border-theme-border focus:border-theme-accent/40 text-theme-text-primary rounded-xl p-4 text-xs font-sans focus:outline-none transition-all placeholder-theme-text-secondary/70 resize-none"
                    />
                    <p className="text-[10px] text-theme-text-secondary/80 font-mono leading-relaxed">
                      This goal will customize your study points, learning card bites, and targeted strategies in the DayOne tab dashboard.
                    </p>
                  </div>
                )}

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action controls footer */}
        <div className="w-full flex justify-end mt-8">
          {currentQuestion.type === "text" || answers[currentQuestion.id] ? (
            <button
              onClick={handleNextQuestion}
              className="bg-theme-accent hover:bg-theme-accent-soft text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-theme-accent/30 cursor-pointer border-0"
            >
              {currentQuestionIdx === questionsList.length - 1 ? (
                <>GENERATE GROWTH PLAN <ArrowRight size={13} /></>
              ) : (
                <>CONTINUE <ArrowRight size={13} /></>
              )}
            </button>
          ) : (
            <div className="text-[10px] text-theme-text-secondary font-mono flex items-center gap-1">
              Select an option above to advance
            </div>
          )}
        </div>

      </div>
    );
  }

  // State 3: SUMMARY VERDICT ROADMAP
  if (phase === "summary") {
    const chosenLevel = answers.level || "Beginner";
    const chosenGoalText = answers.goal ? answers.goal.trim() : `mastering core concepts of ${primaryTopicLabel}`;

    return (
      <div className="w-full max-w-lg mx-auto flex flex-col justify-center items-center py-10 px-4 min-h-[75vh] text-center">
        
        {/* Verification pulse emblem */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-14 h-14 rounded-2xl bg-theme-accent/20 border border-theme-accent/30 text-theme-text-primary flex items-center justify-center mb-6 shadow-2xl shadow-theme-accent/20"
        >
          <Lightbulb size={24} className="text-theme-accent animate-pulse" />
        </motion.div>

        {/* Narrative Verdict Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4 w-full mb-8"
        >
          <span className="text-[10px] font-mono tracking-widest text-[#7c7c8f] uppercase font-bold flex items-center justify-center gap-1.5">
            <Compass size={11} className="text-theme-accent" /> GROWTH PROFILE SYNTHESIZED
          </span>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-theme-text-primary mb-2 leading-tight">
            Curating your DayOne growth path...
          </h1>
          
          <div className="bg-theme-surface/55 backdrop-blur-3xl border border-theme-border p-6 rounded-2xl text-left space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-theme-accent/5 rounded-full blur-xl" />
            
            <p className="text-sm text-theme-text-secondary leading-relaxed font-sans">
              Got it. We'll start from <strong className="text-theme-text-primary bg-theme-accent/20 px-2.5 py-1 rounded-lg border border-theme-accent/20 font-mono text-xs">{chosenLevel}</strong> and focus on <span className="text-theme-accent-soft italic">"{chosenGoalText}"</span>.
            </p>

            <div className="border-t border-theme-border pt-4 flex flex-col gap-2 text-xs text-theme-text-secondary">
              <div className="flex items-center gap-2">
                <Check size={11} className="text-theme-accent" />
                <span>Generating custom learning cards</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={11} className="text-theme-accent" />
                <span>Adjusting focus checklist complexity</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={11} className="text-theme-accent" />
                <span>Calibrating micro-learning metrics</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enter DayOne button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full flex justify-center"
        >
          <button
            onClick={handleFinish}
            className="w-full bg-theme-accent hover:bg-theme-accent-soft text-white py-3 rounded-full text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 shadow-xl shadow-theme-accent/30 hover:shadow-theme-accent/50 cursor-pointer border-0"
          >
            ENTER DAYONE DASHBOARD <ArrowRight size={15} />
          </button>
        </motion.div>

      </div>
    );
  }

  return null;
}
