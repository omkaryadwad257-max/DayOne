/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Check, Flame, HelpCircle, Loader, RotateCcw, Award, AlertTriangle, WifiOff } from "lucide-react";

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
  },
  remove: (key: string) => {
    localStorage.removeItem(key);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove(key);
    }
  }
};

interface TomorrowTeaser {
  conceptName: string;
  teaserText: string;
}

interface EditorialConcept {
  conceptName: string;
  explanation: string;
  realWorldExample: string;
  tryThisToday: string;
  tomorrowTeaser?: TomorrowTeaser;
}

interface EditorialLearnCardProps {
  onStreakChange?: (streak: number) => void;
}

const DEFAULT_TOPIC_CONCEPTS: Record<string, EditorialConcept> = {
  coding: {
    conceptName: "Dependency Inversion Principle",
    explanation: "High-level modules should not depend on low-level modules. Both should depend on abstractions. This protects your core business rules from being broken or tightly bound when database drivers, third-party frameworks, or API clients are modified.",
    realWorldExample: "Instead of hardcoding a mysqlConnection.query() directly in your userSignupHandler, create an abstract UserRepository interface. Code your handler to accept any object subclassing UserRepository. You can now swap MySQL for SQLite or Mock repo transparently.",
    tryThisToday: "Inspect one file in your current codebase that connects to an external service or database. Introduce a lightweight interface definition between them to completely decouple them.",
    tomorrowTeaser: {
      conceptName: "Symmetric Encryption & Cryptographic IVs",
      teaserText: "Learn why recycling identical initialization vectors completely compromises AES encryption strength."
    }
  },
  design: {
    conceptName: "Optical Kerning Alignments",
    explanation: "Mathematical balance is not always human visual balance. Characters with circular curves (O, C, S) or diagonal slopes (A, V, W) must physically cross the boundary margins of grids by a subtle percentage to appear perfectly aligned to human retinas.",
    realWorldExample: "In elegant hero titles starting with a capital 'V' or 'T', slightly shift the letter tracking-left border by -0.04em or adjust padding-left manually so it doesn't look awkwardly shoved inside.",
    tryThisToday: "Inspect a large hero heading on your website. Manually adjust the first character's margins using sub-pixel details to make it align visually with the sub-text block.",
    tomorrowTeaser: {
      conceptName: "The Rule of Spatial Proximity",
      teaserText: "Understanding how spacing tells the brain which interface items are related before they even read them."
    }
  },
  marketing: {
    conceptName: "Negative Cognitive Load Friction",
    explanation: "The more choices you present to a landing page lead, the lower the conversion rates dip (Hick's Law). Strategic high-converting landing pages focus on 'one page, one singular focal target action' with all secondary actions scrubbed thoroughly.",
    realWorldExample: "A SaaS homepage removes secondary header links, social icons, and multiple pricing tiers of 5 choices, narrowing the entire screen focus onto a single, clear, high-contrast action button.",
    tryThisToday: "Audit a page in your workflow. Count how many click targets exist and challenge yourself to delete at least half of them to see if it simplifies cognitive focus.",
    tomorrowTeaser: {
      conceptName: "Contrast-Induced Isolation Effect",
      teaserText: "How isolating key call-to-action triggers in unique color tones guides involuntary attention."
    }
  },
  leadership: {
    conceptName: "Psychological Safety Buffers",
    explanation: "High-performance software organizations depend on trust. Teams where members feel safe to make mistakes, show vulnerability, or voice controversial questions consistently operate with greater resilience, efficiency, and collective speed.",
    realWorldExample: "During an incident post-mortem, focus entirely on 'what failed in the system parameters' instead of pointing fingers. The leader takes personal responsibility for workflow configurations.",
    tryThisToday: "In your next sync, invite the quietest colleague to contribute their ideas first, establishing a safe, open dialog environment.",
    tomorrowTeaser: {
      conceptName: "The Delegation-Ownership Ladder",
      teaserText: "Progressively lifting teammates from task executors to autonomous decision curators."
    }
  },
  public_speaking: {
    conceptName: "Rhetorical Pausing",
    explanation: "Silence is more authoritative than filler sounds ('uh', 'um'). Well-placed, silent pauses of 2-3 seconds immediately preceding or following a pivotal presentation statement heighten audience focus and allow complex insights to resonate.",
    realWorldExample: "When announcing an important milestone, state the main number, hold silent eye contact for two solid beats, then state the direct strategic outcome.",
    tryThisToday: "Record yourself speaking for 60 seconds about your goals. Actively replace every 'um' or 'ah' with pure, calm, intentional silent pauses.",
    tomorrowTeaser: {
      conceptName: "The Rule of Three Rule",
      teaserText: "Why human brains are hardwired to process, remember, and enjoy things presented in triplets."
    }
  },
  writing: {
    conceptName: "Vigorous Active Verbs",
    explanation: "Passive voice drains energy and authority from composition because it hides the active agent. Replacing 'is done by' or 'was decided' with robust active verbs instantly clarifies responsibility and creates rhythmic velocity.",
    realWorldExample: "Change 'The system was initialized by the supervisor code block' into 'The supervisor code block boots the system hierarchy.'",
    tryThisToday: "Review your last three emails. Find every instance of passive structures and aggressively rewrite them into lively active verbs.",
    tomorrowTeaser: {
      conceptName: "The Hook-Hold-Drop Architecture",
      teaserText: "How to layout columns, essays, or newsletters so readers stick past the crucial three-second fold."
    }
  },
  productivity: {
    conceptName: "The Zeigarnik Effect Loop",
    explanation: "Our cognitive processing power is limited. Unfinished, open-ended tasks create continuous background sub-conscious stress that reduces focus. Closing loops or writing down exact sequential action steps immediately frees mental RAM.",
    realWorldExample: "At 5:00 PM, write down the three concrete steps to resume tomorrow's active sprint. Your brain immediately halts worrying about them, allowing full evening decompression.",
    tryThisToday: "Brain-dump all nagging thoughts onto a blank sheet of paper right now. Group them, and calendar the specific execution start parameters.",
    tomorrowTeaser: {
      conceptName: "Time-Blocking Friction Parameters",
      teaserText: "Why structuring strict transition buffers between focused cognitive sessions prevents context-switching fatigue."
    }
  },
  ai_automation: {
    conceptName: "Chain-of-Thought Prompt Anchors",
    explanation: "Asking an LLM for direct immediate answers forces it to predict next-tokens on a guess. Forcing the model to explicitly lay out its step-by-step reasoning tree *before* formulating the final response increases accuracy tremendously on logical tasks.",
    realWorldExample: "Prepend your prompt with 'Begin by analyzing the mathematical constraints under an inner scratchpad, then declare the final results.'",
    tryThisToday: "Modify one of your automations or prompt templates to include a required multi-phase chain-of-thought analysis step.",
    tomorrowTeaser: {
      conceptName: "Semantic Retrieval-Augmented Grounding",
      teaserText: "How contextual pinpoint search results completely eliminate model hallucinations."
    }
  },
  sales: {
    conceptName: "Value-Framed Price Positioning",
    explanation: "Customers never buy features; they invest in state transformations. Frame every negotiation around the direct opportunity costs, friction points, or resource hours saved, rather than raw software metrics or hour pricing.",
    realWorldExample: "Instead of saying 'Our cloud backup runs every 60 minutes and costs $200 per month', position it as 'We protect you against losing $80,000 of daily billing logs for the price of a monthly dinner.'",
    tryThisToday: "Identify one product you represent. Pitch its value in a single sentence without naming any feature technical specification.",
    tomorrowTeaser: {
      conceptName: "Frictionless Checkout Momentum",
      teaserText: "Why reducing payment steps from three fields to a single tap boosts emotional purchase triggers."
    }
  },
  finance: {
    conceptName: "The Compound Interest Horizon",
    explanation: "Wealth accumulation is non-linear. The final years of compounding yield astronomical returns compared to the starting decade. Maintaining continuous long-term exposure is mathematically superior to attempting to time short-term market peaks.",
    realWorldExample: "A modest recurrent deposit of $300/month compounding at 8% annually grows to ~$100k in 15 years, but surges to ~$450k by year 30.",
    tryThisToday: "Run a compounding interest calculation comparing a 10-year versus 30-year active timeframe to grasp the incredible late-horizon slope.",
    tomorrowTeaser: {
      conceptName: "The Emergency Liquidity Buffer",
      teaserText: "Why keeping at least six months of liquid expenses prevents forced asset sell-offs during economic downturns."
    }
  }
};

// Inline luxury particle confetti engine for smooth performance
function CelestialConfetti() {
  const particles = Array.from({ length: 18 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {particles.map((_, i) => {
        const xDir = Math.random() * 240 - 120; // horizontal scatter
        const yDir = Math.random() * -180 - 60; // shoot upwards
        const scale = Math.random() * 0.7 + 0.3;
        const duration = Math.random() * 2.2 + 1.8;
        const delay = Math.random() * 0.4;
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 0, y: 150, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: [0, xDir],
              y: [150, yDir],
              scale: [0, scale, scale * 1.2, 0]
            }}
            transition={{
              duration: duration,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: Math.random() * 1.5,
              delay: delay
            }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-teal-400 via-indigo-400 to-amber-300 shadow-[0_0_12px_rgba(108,99,255,0.4)]"
          />
        );
      })}
    </div>
  );
}

export default function EditorialLearnCard({ onStreakChange }: EditorialLearnCardProps) {
  const [concept, setConcept] = useState<EditorialConcept | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState("De-constructing complex structures...");

  // Streak & Progress state
  const [streak, setStreak] = useState<number>(() => {
    return Number(StorageUtil.get("dayone_streak", 4));
  });

  const [completedToday, setCompletedToday] = useState<boolean>(() => {
    const todayStr = new Date().toDateString();
    const lastCompletedDate = StorageUtil.get("dayone_completed_today_date", "");
    return lastCompletedDate === todayStr;
  });

  const [screenMode, setScreenMode] = useState<"card" | "completion">(() => {
    const todayStr = new Date().toDateString();
    const lastCompletedDate = StorageUtil.get("dayone_completed_today_date", "");
    return lastCompletedDate === todayStr ? "completion" : "card";
  });

  const [topic, setTopic] = useState<string>(() => {
    const topics = StorageUtil.get("dayone_selected_topics", ["coding"]);
    return Array.isArray(topics) ? topics[0] : topics;
  });

  const [level, setLevel] = useState<string>(() => {
    return StorageUtil.get("dayone_assessment_level", "Beginner");
  });

  const [goal, setGoal] = useState<string>(() => {
    return StorageUtil.get("dayone_assessment_goal", "level up my craft");
  });

  const [shared, setShared] = useState<boolean>(false);

  // Cycle loading messages to look incredibly polished
  useEffect(() => {
    if (!loading) return;
    const texts = [
      "Consulting DayOne learning models...",
      "Curating clear semantic structural insights...",
      "Extracting elite conceptual milestones...",
      "Structuring comprehensive user tracks...",
      "Synthesizing knowledge blocks..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  // Fetch concept on mount
  useEffect(() => {
    fetchConcept();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConcept = async () => {
    setLoading(true);
    setError(null);

    try {
      // First try to check if there is a cached concept for today to keep it static
      const cachedToday = StorageUtil.get("dayone_cached_concept_today", null);
      const cachedDate = StorageUtil.get("dayone_cached_concept_date", "");
      const todayStr = new Date().toDateString();

      if (cachedToday && cachedDate === todayStr) {
        setConcept(cachedToday);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/learning/editorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          level,
          goal,
          dayNumber: streak
        })
      });

      if (!response.ok) {
        throw new Error("Editorial generation API failure");
      }

      const data = await response.json();
      
      if (!data.conceptName || !data.explanation) {
        throw new Error("Invalid conceptual response model format");
      }

      // Check current cache to back it up as yesterday list if it's different
      const currentCached = StorageUtil.get("dayone_cached_concept_today", null);
      if (currentCached && currentCached.conceptName !== data.conceptName) {
        StorageUtil.set("dayone_cached_concept_yesterday", currentCached);
      }

      setConcept(data);
      // Cache it for the rest of today so they don't get a different concept on refreshing the tab same day
      StorageUtil.set("dayone_cached_concept_today", data);
      StorageUtil.set("dayone_cached_concept_date", todayStr);

    } catch (err: any) {
      console.error(err);
      
      // Look for a yesterday backup concept
      const cachedYesterday = StorageUtil.get("dayone_cached_concept_yesterday", null);
      if (cachedYesterday) {
        setConcept(cachedYesterday);
        setError("using_fallback_yesterday");
      } else {
        const defaultFallback = DEFAULT_TOPIC_CONCEPTS[topic] || DEFAULT_TOPIC_CONCEPTS["coding"];
        setConcept(defaultFallback);
        setError("using_fallback_default");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteToday = () => {
    if (completedToday) {
      setScreenMode("completion");
      return;
    }

    const newStreak = streak + 1;
    const todayStr = new Date().toDateString();

    setStreak(newStreak);
    setCompletedToday(true);

    StorageUtil.set("dayone_streak", newStreak);
    StorageUtil.set("dayone_completed_today_date", todayStr);

    // Synchronize completed dates list for the settings calendar
    try {
      const stored = localStorage.getItem("dayone_completed_dates");
      const currentDatesList: string[] = stored ? JSON.parse(stored) : [];
      if (!currentDatesList.includes(todayStr)) {
        currentDatesList.push(todayStr);
        StorageUtil.set("dayone_completed_dates", currentDatesList);
      }
    } catch {
      StorageUtil.set("dayone_completed_dates", [todayStr]);
    }

    if (onStreakChange) {
      onStreakChange(newStreak);
    }

    // Trigger visual screen mode transition
    setScreenMode("completion");
  };

  const handleResetStreak = () => {
    // Hidden debug helper
    StorageUtil.set("dayone_streak", 4);
    StorageUtil.set("dayone_completed_today_date", "");
    StorageUtil.remove("dayone_cached_concept_today");
    StorageUtil.remove("dayone_cached_concept_date");
    setStreak(4);
    setCompletedToday(false);
    setScreenMode("card");
    fetchConcept();
    if (onStreakChange) {
      onStreakChange(4);
    }
  };

  const handleShare = () => {
    if (!concept) return;
    const cleanExplanation = concept.explanation.replace(/\*\*/g, "");
    const textToCopy = `📚 My Daily Wisdom Drop from DayOne (Day ${streak}):\n\n` +
      `✨ Concept: ${concept.conceptName}\n` +
      `💡 Key Insight: ${cleanExplanation}\n\n` +
      `🔥 Show up every day. Build solid compound knowledge. Can't wait for tomorrow's teaser: "${concept.tomorrowTeaser?.conceptName || 'The Unknown'}"\n\n` +
      `#DayOne #Microlearning #Consistency #ContinuousGrowth`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy lesson to clipboard", err);
      });
  };

  const formatText = (text: string) => {
    // Bold markup parsing with theme-adaptive visual treatment
    return text.split(/\*\*(.*?)\*\*/g).map((part, idx) => {
      if (idx % 2 === 1) {
        return (
          <span key={idx} className="text-theme-accent-soft font-semibold font-sans">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Format topic labels beautifully
  const formatTopic = (slug: string) => {
    return slug
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col justify-center gap-6" id="editorial-card-wrapper">
      
      {/* CARD BODY WITH GLASSMORPHIC GLOW */}
      <AnimatePresence mode="wait">
        {loading && !completedToday ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="w-full bg-theme-surface/50 backdrop-blur-3xl border border-theme-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-5"
          >
            {/* Ambient pulse decoration */}
            <div className="absolute top-0 left-0 right-0 h-[80px] bg-gradient-to-b from-theme-accent/5 to-transparent pointer-events-none" />

            {/* Header Badge Skeleton */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-24 h-5 bg-theme-text-secondary/15 rounded-md animate-pulse" />
                <div className="w-12 h-5 bg-theme-text-secondary/10 rounded-md animate-pulse hidden sm:block" />
              </div>
              <div className="w-16 h-5 bg-orange-500/10 rounded-full border border-orange-500/10 animate-pulse" />
            </div>

            {/* Concept Title Skeleton */}
            <div className="space-y-2 mb-2">
              <div className="w-2/3 h-7 bg-theme-text-secondary/20 rounded-lg animate-pulse" />
              <div className="w-1/2 h-7 bg-theme-text-secondary/20 rounded-lg animate-pulse" />
            </div>

            {/* Explanation Body Skeleton */}
            <div className="space-y-2.5 mb-4">
              <div className="w-full h-4 bg-theme-text-secondary/10 rounded-md animate-pulse" />
              <div className="w-11/12 h-4 bg-theme-text-secondary/10 rounded-md animate-pulse" />
              <div className="w-4/5 h-4 bg-theme-text-secondary/10 rounded-md animate-pulse" />
              <div className="w-5/6 h-4 bg-theme-text-secondary/10 rounded-md animate-pulse" />
            </div>

            {/* Divider */}
            <div className="border-t border-theme-border pt-4 space-y-4">
              {/* Example box skeleton */}
              <div className="bg-theme-surface/30 border border-theme-border p-4 rounded-2xl flex flex-col gap-2">
                <div className="w-20 h-3 bg-theme-accent/20 rounded-md animate-pulse" />
                <div className="w-full h-3 bg-theme-text-secondary/10 rounded-md animate-pulse" />
                <div className="w-5/6 h-3 bg-theme-text-secondary/10 rounded-md animate-pulse" />
              </div>

              {/* Action box skeleton */}
              <div className="bg-theme-accent/5 border border-theme-accent/15 p-4 rounded-2xl flex flex-col gap-2">
                <div className="w-32 h-3 bg-theme-accent-soft/20 rounded-md animate-pulse" />
                <div className="w-11/12 h-3 bg-theme-text-secondary/10 rounded-md animate-pulse" />
              </div>
            </div>

            {/* Loading text status indicator */}
            <div className="flex flex-col items-center justify-center pt-2 mt-1">
              <div className="w-full h-11 bg-theme-accent/20 rounded-2xl animate-pulse" />
              <span className="text-[10px] text-theme-text-secondary font-mono tracking-widest uppercase mt-4.5 animate-pulse flex items-center justify-center gap-1.5 w-full text-center">
                <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-ping" />
                {loadingText}
              </span>
            </div>
          </motion.div>
        ) : error && !concept ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full min-h-[300px] bg-red-500/[0.03] backdrop-blur-2xl border border-red-500/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 flex items-center justify-center mb-4">
              <RotateCcw size={20} className="animate-spin" />
            </div>
            <h4 className="text-theme-text-primary font-semibold text-base mb-2">Synthesis Interrupted</h4>
            <p className="text-xs text-theme-text-secondary max-w-xs mb-6">{error}</p>
            <button
              onClick={fetchConcept}
              className="bg-theme-surface hover:bg-theme-surface/80 text-theme-text-primary font-semibold text-xs py-2.5 px-6 rounded-xl border border-theme-border transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw size={12} /> Retry Generator
            </button>
          </motion.div>
        ) : concept && screenMode === "card" && !completedToday ? (
          <motion.div
            key="concept"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full bg-theme-surface/50 backdrop-blur-3xl border border-theme-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Top glassmorphic gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-[80px] bg-gradient-to-b from-theme-accent/5 to-transparent pointer-events-none" />

            {/* Offline Safe-Mode Banner */}
            {error && error.startsWith("using_fallback") && (
              <div className="mb-6 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 animate-pulse">
                <div className="flex items-center gap-2">
                  <WifiOff size={14} className="text-amber-400 stroke-[2] shrink-0" />
                  <span className="font-medium leading-normal text-left">
                    {error === "using_fallback_yesterday" 
                      ? "Offline recovery active: reviewing yesterday's loaded concept so your streak stays active!" 
                      : "Offline default active: reviewing active track foundation blueprint."}
                  </span>
                </div>
                <button
                  onClick={fetchConcept}
                  disabled={loading}
                  className="text-[10px] uppercase font-bold tracking-wider font-mono bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-0 px-3 py-1.5 rounded-xl cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 self-end sm:self-auto"
                >
                  <RotateCcw size={10} className={loading ? "animate-spin" : ""} />
                  Sync Live
                </button>
              </div>
            )}

            {/* Topic & Metadata Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-wider text-theme-accent bg-theme-accent/10 border border-theme-accent/20 rounded px-2.5 py-1">
                  {formatTopic(topic)} • DAY {streak}
                </span>
                <span className="text-theme-text-secondary text-[10px] font-mono hidden sm:inline">• CURATED TRACK</span>
              </div>
              <div className="flex items-center gap-1.5 text-orange-400 font-mono text-xs font-bold bg-orange-500/10 border border-orange-500/15 rounded-full px-2.5 py-1">
                <Flame size={12} className="animate-pulse" />
                <span>🔥 {streak}d</span>
              </div>
            </div>

            {/* Concept Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-theme-text-primary tracking-tight mb-4 leading-tight">
              {concept.conceptName}
            </h1>

            {/* Content Body: Explanation */}
            <div className="text-sm md:text-base leading-relaxed text-theme-text-primary font-sans antialiased space-y-4 mb-6">
              <p className="font-light">{formatText(concept.explanation)}</p>
            </div>

            {/* Interactive Grid: Real World Example */}
            <div className="space-y-4 pt-5 border-t border-theme-border">
              
              {/* Example Block */}
              <div className="bg-theme-surface/30 border border-theme-border p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-[9px] font-mono tracking-widest text-[#6C63FF]/70 uppercase font-bold">
                  IN ACTION (EXAMPLE)
                </span>
                <p className="text-xs leading-relaxed text-theme-text-secondary">
                  {concept.realWorldExample}
                </p>
              </div>

              {/* Try this today section */}
              <div className="bg-theme-accent/5 border border-theme-accent/15 p-4 rounded-2xl flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-theme-accent/5 rounded-full blur-xl" />
                <span className="text-[9px] font-mono tracking-widest text-theme-accent-soft uppercase font-bold flex items-center gap-1">
                  <Sparkles size={10} className="text-theme-accent-soft" /> TRY THIS TODAY (MICRO-ACTION)
                </span>
                <p className="text-xs leading-relaxed text-theme-text-primary">
                  {concept.tryThisToday}
                </p>
              </div>

            </div>

            {/* BUTTON FOOTER */}
            <div className="mt-8 flex flex-col items-center gap-4 animate-fade-in">
              {!completedToday ? (
                <button
                  onClick={handleCompleteToday}
                  className="w-full bg-theme-accent hover:bg-theme-accent-soft text-white py-3 px-6 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all duration-300 transform active:scale-[0.98] shadow-xl shadow-theme-accent/10 hover:shadow-theme-accent/20 cursor-pointer flex items-center justify-center gap-2 group border-0"
                >
                  Got It <Check size={14} className="group-hover:scale-125 transition-transform" />
                </button>
              ) : (
                <div className="w-full space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-theme-success/10 border border-theme-success/20 px-4 py-3 rounded-2xl text-center text-xs text-theme-success font-mono font-medium flex items-center justify-center gap-2"
                  >
                    <Check size={14} className="text-theme-success stroke-[3px]" />
                    <span>CONCEPT COMPLETED FOR TODAY</span>
                  </motion.div>
                  <button
                    onClick={() => setScreenMode("completion")}
                    className="w-full bg-theme-surface hover:bg-theme-surface/80 text-theme-text-primary py-3 px-6 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:border-theme-accent/20 border border-theme-border cursor-pointer flex items-center justify-center gap-2"
                  >
                    View Completion Teaser <Sparkles size={12} className="text-theme-accent-soft" />
                  </button>
                </div>
              )}

              {/* Reset shortcut hidden trigger or tiny links */}
              <div className="w-full flex justify-between items-center text-[9px] text-[#444452] font-mono transition-colors hover:text-[#7c7c8f] px-1">
                <span>DAYONE MV3 EXTENSION PAGE</span>
                <button
                  onClick={handleResetStreak}
                  className="hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-0 text-[#444452] hover:text-theme-text-secondary"
                >
                  Reset Streak (Debug)
                </button>
              </div>
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="completion"
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.99 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full bg-theme-surface/50 backdrop-blur-3xl border border-theme-border rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center text-theme-text-primary"
          >
            {/* Elegant particle sparks */}
            <CelestialConfetti />

            {/* Glowing outer backdrop circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/[0.04] rounded-full blur-[60px] pointer-events-none animate-pulse" />

            {/* Gold/Orange streak update aura */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 100 }}
              className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6 shadow-[0_0_24px_rgba(245,158,11,0.08)]"
            >
              <Flame size={38} className="text-orange-400 stroke-[2]" />
              <div className="absolute -top-0.5 -right-0.5 bg-green-500 rounded-full p-1 border-2 border-theme-surface">
                <Check size={9} className="text-theme-surface stroke-[4]" />
              </div>
            </motion.div>

            {/* Completion Header Message */}
            <h2 className="text-xl md:text-2xl font-extrabold text-theme-text-primary tracking-tight leading-snug mb-3">
              You showed up today.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-accent via-theme-accent-soft to-indigo-500 font-sans">
                That's what matters.
              </span>
            </h2>

            <p className="text-xs text-theme-text-secondary max-w-xs mb-8 leading-relaxed font-sans">
              Daily effort compounding quietly. You've successfully secured your{" "}
              <strong className="text-orange-400 font-mono font-bold">{streak}-day streak</strong>.
            </p>

            {/* Tomorrow's Teaser Box: Cliffhanger design */}
            <div className="w-full bg-theme-surface/30 border border-theme-border rounded-2xl p-5 mb-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-theme-accent" />
              
              <div className="flex items-center gap-1.5 mb-2 justify-center">
                <Sparkles size={11} className="text-theme-accent-soft animate-pulse" />
                <span className="text-[9px] font-mono tracking-widest text-theme-accent-soft uppercase font-bold">
                  TOMORROW DETECTOR
                </span>
              </div>

              {!concept ? (
                <div className="space-y-2 py-1 max-w-sm mx-auto">
                  <div className="w-2/3 h-4 bg-theme-text-secondary/15 rounded-md animate-pulse mx-auto" />
                  <div className="w-5/6 h-3 bg-theme-text-secondary/10 rounded-md animate-pulse mx-auto" />
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-theme-text-primary mb-1.5">
                    Tomorrow: {concept.tomorrowTeaser?.conceptName || "The Secret Milestone"}
                  </h3>

                  <p className="text-[11px] text-theme-text-secondary italic leading-relaxed max-w-sm mx-auto">
                    "{concept.tomorrowTeaser?.teaserText || "Get ready to unlock tomorrow's master concept."}"
                  </p>
                </>
              )}
            </div>

            {/* SHARE / RETURN TO CONCEPTS FOOTER */}
            <div className="w-full space-y-3.5">
              <button
                onClick={handleShare}
                className={`w-full py-3 px-6 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-lg border-0 ${
                  shared 
                    ? "bg-emerald-600/15 text-emerald-300 border border-emerald-500/25 shadow-emerald-500/5"
                    : "bg-theme-surface hover:bg-theme-surface/80 text-theme-text-primary border border-theme-border shadow-black/30"
                }`}
              >
                {shared ? (
                  <>✓ Snippet Copied to Clipboard!</>
                ) : (
                  <>Share Today's Lesson</>
                )}
              </button>

              <button
                onClick={() => setScreenMode("card")}
                className="text-[10px] text-theme-text-secondary font-mono tracking-wider hover:text-theme-text-primary transition-colors cursor-pointer block mx-auto py-1 bg-transparent border-0"
              >
                ← Review Today's Concept
              </button>
            </div>

            {/* Debug reset */}
            <div className="mt-8 text-[9px] text-[#444452] font-mono w-full text-right px-1">
              <button
                onClick={handleResetStreak}
                className="hover:underline cursor-pointer bg-transparent border-0 text-[#444452] hover:text-theme-text-secondary"
              >
                Reset Streak (Debug)
              </button>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

