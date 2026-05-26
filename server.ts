/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with custom option and lazy guard
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables. Please add it via Settings > Secrets.");
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': "aistudio-build",
        }
      }
    });
  }
  return ai;
}

// Curated static learning bites as high-quality fallbacks when API is unreachable or key is missing
const fallbackLearningBites: Record<string, any> = {
  "astrophysics": {
    topic: "Dark Matter and Gravitational Lensing",
    category: "Astrophysics",
    explanation: "Although **dark matter** makes up about 85% of the universe's total matter, it interacts neither with light nor electromagnetic fields. We cannot observe it directly, but we prove its existence through **gravitational lensing**. According to Einstein's General Relativity, immense gravity bends the fabric of spacetime. When light from an extremely distant galaxy passes near a massive pocket of unseen dark matter, the light curves and distorts, creating a cosmic magnifying glass. This bending reveals the exact mass and position of the dark matter, allowing astronomers to map out the ghost skeleton of our cosmos.",
    takeaway: [
      "Dark matter makes up the vast majority of the matter in the universe but does not emit or absorb light.",
      "Gravitational lensing occurs when massive structures warp spacetime, bending the path of passing light.",
      "Lensing lets scientists measure and map invisible matter distribution directly."
    ],
    quiz: {
      question: "How do astronomers primarily map the location of invisible dark matter?",
      options: [
        "By measuring electromagnetic radio wave emissions",
        "By analyzing the distortion of light from background galaxies (gravitational lensing)",
        "By tracking black hole collisions",
        "By capturing dark matter particles in ultra-sensitive light detectors"
      ],
      correctIndex: 1,
      explanation: "Gravitational lensing is the key method; because dark matter has mass, its gravity bends passing light from behind it, creating visible arcs and distortions that reveal its footprint."
    }
  },
  "computer science": {
    topic: "V8 JavaScript Engine Architecture & JIT Compilation",
    category: "Computer Science",
    explanation: "Google's **V8 engine**, which powers Chrome and Node.js, uses an advanced strategy called **Just-In-Time (JIT) Compilation** to run JavaScript at near-native speeds. Instead of simply interpreting code line by line, V8 compiles JavaScript directly into machine code before execution. It uses two key compilers: **Ignition**, a fast register-based bytecode interpreter, and **Turbofan**, an optimizing compiler. As code runs, V8 identifies 'hot' or heavily repeated functions and hands them to Turbofan, which transforms them into highly optimized machine code. If a variable's data type suddenly changes, Turbofan 'de-optimizes' back to bytecode gracefully, preserving accuracy.",
    takeaway: [
      "V8 bypasses traditional line-by-line interpretation using Just-In-Time (JIT) compilation.",
      "Ignition generates bytecode instantly, while Turbofan builds optimized machine code for repeated loops.",
      "Dynamic types in JS mean that functions can de-optimize back to baseline bytecode if assumptions change."
    ],
    quiz: {
      question: "What is the primary role of the Turbofan compiler in the V8 engine?",
      options: [
        "To interpret plain JavaScript text files into raw bytecode",
        "To manage memory allocation and collect garbage objects in the background",
        "To generate highly optimized machine code for heavily repeated 'hot' functions",
        "To securely sandbox browser processes from the operating system"
      ],
      correctIndex: 2,
      explanation: "Turbofan is V8's optimization engine; it focuses solely on analyzing executing runtime profiles and compiling 'hot' sections of code into high-speed native assembly."
    }
  },
  "design": {
    topic: "Fitts's Law in Modern UX Design",
    category: "UX/UI Design",
    explanation: "In product design, **Fitts's Law** is a predictive model that states the time required to move to a target is a function of the **target's size** and **distance to target**. In other words: the closer and larger an interactive element is, the faster and easier it is to click or tap. This is why primary Actions (like 'Sign Up') use large, high-contrast buttons, and why 'destructive' buttons (like 'Delete Account') are typically placed away from common targets. This physical principle is also why top and bottom corners are the most powerful spatial real estate on desktop monitors — the cursor can be slung there without worry of overshoot, creating an infinitely tall target boundary.",
    takeaway: [
      "User movement speed and accuracy depend directly on target size and proximity.",
      "Interactive targets should be large enough to target comfortably, mitigating micro-friction.",
      "Edge and corner boundaries on flat screens are the fastest reachable zones on desktop interfaces."
    ],
    quiz: {
      question: "According to Fitts's Law, how should critical interactive elements be styled?",
      options: [
        "They should be smaller and placed at the absolute center to ensure alignment",
        "They should be larger and positioned within natural reach zones",
        "They should flash continuously to draw attention",
        "They should have high border radius and match the dark canvas closely"
      ],
      correctIndex: 1,
      explanation: "Making targets reasonably larger and placing them near common layout flows minimises access friction and speeds up interaction."
    }
  },
  "default": {
    topic: "The Pareto Principle of Cognitive Focus",
    category: "Psychology & Optimization",
    explanation: "Also known as the **80/20 Rule**, the **Pareto Principle** suggests that approximately 80% of outcomes result from 20% of inputs. In cognitive and professional environments, this means identifying the minimal subset of critical tasks that account for nearly all of the growth, and focusing attention solely on them. In micro-learning, for instance, learning the 20% core vocabulary and base grammar structure of a new language enables you to understand 80% of common daily speech. The key challenge lies not in working longer, but in building the discipline to audit your inputs and cut away the low-yield 80% noise.",
    takeaway: [
      "A small fraction of efforts (20%) produces the vast majority of tangible outputs (80%).",
      "Focusing on foundational high-leverage concepts accelerates mastery of any new subject.",
      "Regularly audit and prune low-priority projects to avoid split-focus and decision fatigue."
    ],
    quiz: {
      question: "How can the Pareto Principle be applied to micro-learning a new skill?",
      options: [
        "By spending exactly 8 hours a day reading reference manuals",
        "By identifying and mastering the core 20% concepts that unlock 80% of situations",
        "By ignoring visual layouts and focusing solely on backend architecture",
        "By testing random variables sequentially until a perfect score is reached"
      ],
      correctIndex: 1,
      explanation: "Mastering the foundational 20% of a paradigm provides the leverage to interpret and execute the majority of typical daily scenarios with minimal initial friction."
    }
  }
};

// API Endpoint to generate micro-learning content via Gemini
app.post("/api/learning/generate", async (req, res) => {
  const { topic } = req.body;
  const targetTopic = (topic || "").trim().toLowerCase();

  try {
    // Attempt to parse/initialize Gemini
    const client = getGeminiClient();

    const systemInstruction = 
      "You are DayOne, an elite personal learning assistant for high-performance learners. " +
      "Your goal is to explain complex concepts in an ultra-clear, concise, and mind-expanding way. " +
      "Format the explanation concisely (around 150-200 words). Use bold font (markdown **) for key vocabulary, names, or concepts. " +
      "Do NOT use structural Markdown headings inside the explanation field (e.g. do not write '#', '##', or '###'). Write it as cohesive, flowing paragraphs. " +
      "Create an engaging 4-option multiple choice quiz to test the user's comprehension of the concepts, along with a helpful explanation. " +
      "Pick a specific, fascinating micro-topic related to the user's prompt.";

    const promptText = `Generate an inspiring micro-learning bite about: "${topic || "Surprise Me (Interesting modern facts/science)"}" but tailor it specifically to deep learning.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { 
              type: Type.STRING,
              description: "The targeted, beautiful modern topic title (keep it crisp, 4-8 words)" 
            },
            category: { 
              type: Type.STRING, 
              description: "General high-level field of study, e.g. Quantum Physics, Philosophy, Fine Art, Systems Engineering" 
            },
            explanation: { 
              type: Type.STRING,
              description: "A gorgeous 150-200 word summary, using bold markup for focus words. Break it into 1-2 smooth paragraphs. No headings allowed." 
            },
            takeaway: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 ultra-sharp, actionable bullet takeaways summary"
            },
            quiz: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "Highly engaging conceptual question about the explanation above" },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 4 distinct, plausible multiple-choice options"
                },
                correctIndex: { type: Type.INTEGER, description: "The 0-based index of the single correct option (0 to 3)" },
                explanation: { type: Type.STRING, description: "A brief clarifying sentence shown once answered" }
              },
              required: ["question", "options", "correctIndex", "explanation"]
            }
          },
          required: ["topic", "category", "explanation", "takeaway", "quiz"]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty response returned from Gemini API");
    }

    const learningBite = JSON.parse(outputText.trim());
    return res.json(learningBite);

  } catch (error: any) {
    console.warn("Gemini Generation failed or was unconfigured. Falling back to rich static dataset. Error:", error.message);
    
    // Select the best match from the fallbacks
    let selectedFallback = fallbackLearningBites["default"];
    for (const key of Object.keys(fallbackLearningBites)) {
      if (targetTopic.includes(key) || key.includes(targetTopic)) {
        selectedFallback = fallbackLearningBites[key];
        break;
      }
    }
    
    // If user typed a custom topic and we are falling back, customize the title slightly
    if (topic && topic.length > 2 && selectedFallback === fallbackLearningBites["default"]) {
      return res.json({
        topic: `Foundational study of: ${topic}`,
        category: "Focused Curiosity",
        explanation: `We've crafted a study focus about **${topic}**. To unlock infinite real-time server-side Gemini generation on this and any other query, please activate and add your own **GEMINI_API_KEY** via the **Settings > Secrets** panel in AI Studio! Once added, our server will dynamically summarize any custom scientific, coding, or historical topic instantly.\n\n` +
          `In the meantime, let's explore this foundational concept: **Interleaving & Deliberate Practice**. Applying dynamic mental switching between topics increases your overall neural retention by up to 40% compared to typical repetitive study. When you challenge your brain to load and exit different concepts, you force synapses to reinforce the retrieval pathway, mimicking actual performance settings.`,
        takeaway: [
          "Deliberate practice means tackling targets just outside your current comfort threshold.",
          "Interleaving boosts brain retrieval retention by context-switching between different concepts.",
          "Add your GEMINI_API_KEY in the Secrets panel to activate instantaneous dynamic explanations on any query."
        ],
        quiz: {
          question: "According to learning science, why is 'interleaving' more efficient than solid block practice?",
          options: [
            "It is significantly easier on the eyes during late night study sessions",
            "It requires zero recall practice because you only study easy material",
            "It forces the brain to actively reload retrieval paths during context changes, solidifying long-term memory",
            "It bypasses the brain completely and automates storage to short-term cycles"
          ],
          correctIndex: 2,
          explanation: "Iterative context switching forces your brain to work harder to recall information, creating deep pathways and solidifying retrieval for long-term usage."
        }
      });
    }

    return res.json(selectedFallback);
  }
});

// API Endpoint to generate progressive concept editorial cards via Claude (or Gemini fallback)
app.post("/api/learning/editorial", async (req, res) => {
  const { topic, level, goal, dayNumber } = req.body;
  const targetTopic = (topic || "General Knowledge").trim();
  const targetLevel = (level || "Beginner").trim();
  const targetGoal = (goal || "maximize personal micro-learning productivity").trim();
  const day = Number(dayNumber) || 1;

  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (anthropicKey) {
    try {
      const systemInstruction = 
        "You are DayOne, an elite growth coach and master educator. " +
        "You explain complex topics clearly and beautifully in brief editorial cards. " +
        "You must respond with raw JSON in the following format: " +
        "{\n" +
        "  \"conceptName\": \"A beautiful, crisp, provocative concept title (3-5 words)\",\n" +
        "  \"explanation\": \"A 3-5 sentence explanation of this concept written in beautiful, clear, simple language with zero jargon. Use basic markdown bolding (**words**) to highlight the core mechanism, no other formatting.\",\n" +
        "  \"realWorldExample\": \"A vivid, fascinating real-world example of this concept in action (1-2 sentences).\",\n" +
        "  \"tryThisToday\": \"An immediate, simple, micro-action the user can perform today in less than 5 minutes to experience the concept (1-2 sentences).\",\n" +
        "  \"tomorrowTeaser\": {\n" +
        "    \"conceptName\": \"An elegant, extremely intriguing, cliffhanger title for tomorrow's lesson (2-4 words)\",\n" +
        "    \"teaserText\": \"A single, highly dramatic cliffhanger sentence that triggers intense curiosity and creates genuine anticipation for tomorrow. Do not synthesize today's concept, instead make it feel like a missing link or complete mystery they must unlock.\"\n" +
        "  }\n" +
        "}";

      const promptText = `Generate day ${day} of our comprehensive progressive learning track.
Topic of focus: ${targetTopic}
User's experience level: ${targetLevel}
Self-reported goal: ${targetGoal}

Please construct a concept that logically builds on earlier basic foundation steps, suitable specifically for Day ${day}. Make it look like a high-end article snippet, completely jargon-free, deeply intuitive and engaging. Give us a cliffhanger teaser for day ${day + 1}.`;

      let response;
      try {
        response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemInstruction,
            messages: [{ role: "user", content: promptText }]
          })
        });
      } catch (err: any) {
        console.warn("Claude 4 failed, trying fallback model claude-3-5-sonnet-20241022. Error:", err.message);
        response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            system: systemInstruction,
            messages: [{ role: "user", content: promptText }]
          })
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic API responded with error status ${response.status}: ${errText}`);
      }

      const resJson = await response.json();
      const contentText = resJson.content?.[0]?.text;
      if (!contentText) {
        throw new Error("Empty content returned from Anthropic");
      }

      const parsed = JSON.parse(contentText.trim());
      return res.json(parsed);

    } catch (error: any) {
      console.warn("Claude Generation failed, falling back to Gemini. Error:", error.message);
    }
  }

  // Fallback or default structure using Gemini
  try {
    const client = getGeminiClient();

    const systemInstruction = 
      "You are DayOne, an elite growth coach and master educator. " +
      "You explain complex topics clearly and beautifully in brief editorial cards.";

    const promptText = `Generate day ${day} of our progressive learning track.
Topic of focus: "${targetTopic}"
User's experience level: "${targetLevel}"
Self-reported goal: "${targetGoal}"

Please construct a concept specifically for Day ${day} that logically builds on previous steps.
Also generate a teaser for Day ${day + 1} that feels like a suspenseful cliffhanger.
Respond with JSON matching the following schema structure. Make the card feel like a beautifully designed editorial piece, not a chatbot response. No generic AI bullet points or preambles. Check that the explanation is exactly 3-5 sentences written simply with zero jargon. Use bold markdown (**word**) for key words.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conceptName: { 
              type: Type.STRING,
              description: "A beautiful, crisp, provocative concept title (3-5 words)" 
            },
            explanation: { 
              type: Type.STRING,
              description: "A 3-5 sentence explanation of this concept written in beautiful, clear, simple language with zero jargon. Use basic markdown bolding (**words**) to highlight the core mechanism." 
            },
            realWorldExample: { 
              type: Type.STRING, 
              description: "A vivid, fascinating real-world example of this concept in action (1-2 sentences)." 
            },
            tryThisToday: { 
              type: Type.STRING,
              description: "An immediate, simple, micro-action the user can perform today in less than 5 minutes to experience the concept (1-2 sentences)." 
            },
            tomorrowTeaser: {
              type: Type.OBJECT,
              properties: {
                conceptName: {
                  type: Type.STRING,
                  description: "An elegant, intriguing title for tomorrow's concept (2-4 words)"
                },
                teaserText: {
                  type: Type.STRING,
                  description: "A single, highly intriguing, cliffhanger-style sentence that creates extreme anticipation for tomorrow."
                }
              },
              required: ["conceptName", "teaserText"]
            }
          },
          required: ["conceptName", "explanation", "realWorldExample", "tryThisToday", "tomorrowTeaser"]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty response returned from Gemini API");
    }

    const parsed = JSON.parse(outputText.trim());
    return res.json(parsed);

  } catch (error: any) {
    console.warn("Gemini Generation also failed. Returning static high-quality mock backup.", error.message);
    
    // Curated high quality back-up concepts based on topic
    const backupConceptsIndex: Record<string, any> = {
      coding: {
        conceptName: "The Art of Syntactic Sugar",
        explanation: "In programming, **syntactic sugar** refers to language features designed to make code easier to read or write. It does not introduce new capabilities, but rather wraps complex instructions in a more intuitive, human-friendly syntax. Behind the scenes, the runtimes de-sugar these sweet structures into traditional nested constructs. This reduces overall cognitive strain and mitigates common typing errors during rapid development.",
        realWorldExample: "Modern async/await syntax in JavaScript is syntactic sugar built over traditional Promise objects and callback chains.",
        tryThisToday: "Take a simple 'for' loop in your code and refactor it into an elegant '.map()' or '.forEach()' array iteration.",
        tomorrowTeaser: {
          conceptName: "The Cost of Indirection",
          teaserText: "Every layer of abstraction promises peace, but carries a hidden structural tax. Tomorrow, we reveal the silent cost of writing clean code."
        }
      },
      marketing: {
        conceptName: "Hook, Story, and Offer",
        explanation: "Every successful ad campaign relies on the foundational framework of **Hook, Story, and Offer**. The hook catches the user's attention in the first three seconds of infinite scrolling. The story builds empathy and friction by framing a struggle they relate to. Finally, the offer presents a logical vector of resolution that is too valuable to ignore. Mastering this trifecta ensures your copy converts curiosity into action.",
        realWorldExample: "Duolingo's viral social posts serve as hooks, telling a funny story about the green owl's persistence, before offering a free language lesson.",
        tryThisToday: "Draft 3 headline hooks for your project using the 'fear of missing out' or 'unexpected curiosity' templates.",
        tomorrowTeaser: {
          conceptName: "The Paradox of Choice",
          teaserText: "Offer your target audience more options, and they will buy nothing at all. Tomorrow, we explore why restricting user choices triggers instant conversions."
        }
      },
      design: {
        conceptName: "The Rule of Spatial Proximity",
        explanation: "According to Gestalt psychology, the **Rule of Proximity** states that items close to each other are perceived as a single unified group. On an interface, this implies that related controls should nest tightly together, while unrelated items need generous negative whitespace boundaries. When spacing is uniform, users struggle to visually map functional hierarchies, inducing micro-cognitive friction. Proper clustering guides the eye effortlessly through your design.",
        realWorldExample: "In elegant dashboards, inputs and their corresponding labels are grouped with a 4px gap, while separate cards are divided by 32px margins.",
        tryThisToday: "Open your favorite web app, blur your eyes slightly, and notice how elements cluster into distinct functional islands.",
        tomorrowTeaser: {
          conceptName: "Subliminal Chromatic Priming",
          teaserText: "Colors do not just decorate a canvas—they hijack human neural pathways. Tomorrow, we study the invisible chromatic hues that command instant authority."
        }
      },
      default: {
        conceptName: "The Power of Deliberate Friction",
        explanation: "While designers strive to create frictionless systems, in cognitive science we find that **deliberate friction** is essential for high performance. Adding small barriers at critical junctions forces the brain to exit automatic, semi-conscious autopilot and enter a state of high-alert critical reasoning. This makes users think twice before taking destructive actions or committing to high-fidelity choices. When applied selectively, friction constructs pathways of deep comprehension and mindfulness.",
        realWorldExample: "GitHub forces you to manually type your folder name into a field before allowing database deletion to prevent catastrophic accidents.",
        tryThisToday: "Put your most distracting application inside a nested folder to add a 2-second deliberate friction step to opening it.",
        tomorrowTeaser: {
          conceptName: "The Zeigarnik Suspense",
          teaserText: "The human mind cannot rest with an uncompleted arc. Tomorrow, we hack your attention span by leaving open loops."
        }
      }
    };

    let selectedBackup = backupConceptsIndex["default"];
    const t = targetTopic.toLowerCase();
    for (const key of Object.keys(backupConceptsIndex)) {
      if (t.includes(key) || key.includes(t)) {
        selectedBackup = backupConceptsIndex[key];
        break;
      }
    }

    return res.json(selectedBackup);
  }
});

// Setup Vite & Static Assets Server serving routes
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DayOne server booted successfully. Listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
