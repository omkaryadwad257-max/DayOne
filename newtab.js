/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Global Curated Learning Database for Offline/Chrome Extension Standalone mode
const staticBites = {
  "computer science": {
    topic: "V8 JavaScript Engine Architecture & JIT Compilation",
    category: "Computer Science",
    explanation: "Google's <b>V8 engine</b>, which powers Chrome and Node.js, uses an advanced strategy called <b>Just-In-Time (JIT) Compilation</b> to run JavaScript at near-native speeds. Instead of simply interpreting code line by line, V8 compiles JavaScript directly into machine code before execution. It uses two key compilers: <b>Ignition</b>, a fast register-based bytecode interpreter, and <b>Turbofan</b>, an optimizing compiler. As code runs, V8 identifies 'hot' or heavily repeated functions and hands them to Turbofan, which transforms them into highly optimized machine code. If a variable's data type suddenly changes, Turbofan 'de-optimizes' back to bytecode gracefully, preserving accuracy.",
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
  "astrophysics": {
    topic: "Dark Matter and Gravitational Lensing",
    category: "Astrophysics",
    explanation: "Although <b>dark matter</b> makes up about 85% of the universe's total matter, it interacts neither with light nor electromagnetic fields. We cannot observe it directly, but we prove its existence through <b>gravitational lensing</b>. According to Einstein's General Relativity, immense gravity bends the fabric of spacetime. When light from an extremely distant galaxy passes near a massive pocket of unseen dark matter, the light curves and distorts, creating a cosmic magnifying glass. This bending reveals the exact mass and position of the dark matter, allowing astronomers to map out the ghost skeleton of our cosmos.",
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
  "design": {
    topic: "Fitts's Law in Modern UX Design",
    category: "UX/UI Design",
    explanation: "In product design, <b>Fitts's Law</b> is a predictive model that states the time required to move to a target is a function of the <b>target's size</b> and <b>distance to target</b>. In other words: the closer and larger an interactive element is, the faster and easier it is to click or tap. This is why primary Actions (like 'Sign Up') use large, high-contrast buttons, and why 'destructive' buttons (like 'Delete Account') are typically placed away from common targets. This physical principle is also why top and bottom corners are the most powerful spatial real estate on desktop monitors — the cursor can be slung there without worry of overshoot, creating an infinitely tall target boundary.",
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
        "They should have high border radius and match the dark canvas closely"
      ],
      correctIndex: 1,
      explanation: "Making targets reasonably larger and placing them near common layout flows minimises access friction and speeds up interaction."
    }
  },
  "default": {
    topic: "The Pareto Principle of Cognitive Focus",
    category: "Psychology & Optimization",
    explanation: "Also known as the <b>80/20 Rule</b>, the <b>Pareto Principle</b> suggests that approximately 80% of outcomes result from 20% of inputs. In cognitive and professional environments, this means identifying the minimal subset of critical tasks that account for nearly all of the growth, and focusing attention solely on them. In micro-learning, for instance, learning the 20% core vocabulary and base grammar structure of a new language enables you to understand 80% of common daily speech. The key challenge lies not in working longer, but in building the discipline to audit your inputs and cut away the low-yield 80% noise.",
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

// Storage utility wrapping both Chrome Extensions Storage API and LocalStorage
const StorageUtil = {
  get: function(key, defaultValue, callback) {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([key], (result) => {
        if (result[key] !== undefined) {
          callback(result[key]);
        } else {
          callback(defaultValue);
        }
      });
    } else {
      const val = localStorage.getItem(key);
      callback(val ? JSON.parse(val) : defaultValue);
    }
  },
  set: function(key, value) {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      const obj = {};
      obj[key] = value;
      chrome.storage.local.set(obj);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
};

// State Variables
let currentCategory = "computer science";
let selectedOptionIndex = null;
let isQuizSubmitted = false;
let focusItems = [];

// DOM Elements
const timeDisplay = document.getElementById("time-display");
const dateDisplay = document.getElementById("date-display");
const usernameDisplay = document.getElementById("username-display");
const editNameBtn = document.getElementById("edit-name-btn");
const focusForm = document.getElementById("focus-form");
const focusInput = document.getElementById("focus-input");
const focusList = document.getElementById("focus-list");
const focusMetrics = document.getElementById("focus-metrics");
const tracksContainer = document.getElementById("tracks-container");

// Article and Quiz Dom
const artCategory = document.getElementById("article-category");
const artTitle = document.getElementById("article-title");
const artText = document.getElementById("article-text");
const artTakeaways = document.getElementById("article-takeaways");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options-container");
const submitQuizBtn = document.getElementById("submit-quiz-btn");
const feedbackBox = document.getElementById("quiz-feedback-box");
const feedbackEmoji = document.getElementById("feedback-emoji");
const feedbackHeadline = document.getElementById("feedback-headline");
const feedbackText = document.getElementById("feedback-text");

// Modal Elements
const renameModal = document.getElementById("rename-modal");
const renameInput = document.getElementById("rename-input");
const cancelRenameBtn = document.getElementById("cancel-rename-btn");
const saveRenameBtn = document.getElementById("save-rename-btn");

// 1. CLOCK LOGIC
function updateClock() {
  const now = new Date();
  
  // Hours, minutes, seconds formatted
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  
  if (timeDisplay) {
    timeDisplay.textContent = `${hh}:${mm}:${ss}`;
  }
  
  // Date display
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  if (dateDisplay) {
    dateDisplay.innerHTML = `<span class="badge-dot"></span> ${now.toLocaleDateString('en-US', options).toUpperCase()}`;
  }
}
setInterval(updateClock, 1000);
updateClock();

// 2. NAME CUSTOMIZATION FLOW
StorageUtil.get("dayone_user_name", "Omkar", (savedName) => {
  if (usernameDisplay) usernameDisplay.textContent = savedName;
});

if (editNameBtn) {
  editNameBtn.addEventListener("click", () => {
    StorageUtil.get("dayone_user_name", "Omkar", (savedName) => {
      if (renameInput) renameInput.value = savedName;
      if (renameModal) renameModal.classList.remove("hidden");
    });
  });
}

if (cancelRenameBtn) {
  cancelRenameBtn.addEventListener("click", () => {
    if (renameModal) renameModal.classList.add("hidden");
  });
}

if (saveRenameBtn) {
  saveRenameBtn.addEventListener("click", () => {
    const newName = renameInput.value.trim();
    if (newName) {
      if (usernameDisplay) usernameDisplay.textContent = newName;
      StorageUtil.set("dayone_user_name", newName);
    }
    if (renameModal) renameModal.classList.add("hidden");
  });
}

// 3. STRATEGY FOCUS CHECKS FLOW
function renderFocusList() {
  if (!focusList) return;
  focusList.innerHTML = "";
  
  let activeCount = 0;
  
  focusItems.forEach((item) => {
    if (!item.completed) activeCount++;
    
    const div = document.createElement("div");
    div.className = `check-item ${item.completed ? 'completed' : ''}`;
    
    div.innerHTML = `
      <div class="check-left" data-id="${item.id}">
        <div class="checkbox-custom">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="check-text">${item.text}</span>
      </div>
      <button class="delete-btn" data-id="${item.id}" title="Remove checkpoint">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    `;
    
    // Toggle completion listener
    div.querySelector(".check-left").addEventListener("click", () => {
      toggleFocusItem(item.id);
    });
    
    // Delete listener
    div.querySelector(".delete-btn").addEventListener("click", () => {
      deleteFocusItem(item.id);
    });
    
    focusList.appendChild(div);
  });
  
  if (focusMetrics) {
    const total = focusItems.length;
    const completedPercent = total === 0 ? 0 : Math.round(((total - activeCount) / total) * 100);
    focusMetrics.textContent = `${activeCount} PENDING CHECKS • ${completedPercent}% COMPLETE`;
  }
}

function loadFocusItems() {
  StorageUtil.get("dayone_focus_items", [
    { id: "1", text: "Study dynamic programming recursion parameters", completed: false }
  ], (items) => {
    focusItems = items;
    renderFocusList();
  });
}

function saveFocusItems() {
  StorageUtil.set("dayone_focus_items", focusItems);
  renderFocusList();
}

function toggleFocusItem(id) {
  focusItems = focusItems.map(item => 
    item.id === id ? { ...item, completed: !item.completed } : item
  );
  saveFocusItems();
}

function deleteFocusItem(id) {
  focusItems = focusItems.filter(item => item.id !== id);
  saveFocusItems();
}

if (focusForm) {
  focusForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!focusInput) return;
    const text = focusInput.value.trim();
    if (!text) return;
    
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: text,
      completed: false
    };
    
    focusItems.push(newItem);
    focusInput.value = "";
    saveFocusItems();
  });
}

// 4. CORE MICRO-LEARNING ENGINE AND API SYNCHRONIZATION
let activeBiteData = null; // hold current active generated or fallback bite object

function renderBiteData(bite) {
  activeBiteData = bite;
  
  const articleContainer = document.getElementById("article-container");
  if (articleContainer) {
    const categoryName = (bite.category || "General").toUpperCase();
    articleContainer.innerHTML = `
      <div class="article-meta">
        <span class="category-tag" id="article-category">${categoryName}</span>
        <span class="read-time font-mono">• 3 MIN STUDY</span>
      </div>
      <h2 class="article-title" id="article-title">${bite.topic}</h2>
      <p class="article-body" id="article-text">${bite.explanation}</p>
    `;
  }
  
  // Render Takeaways list
  if (artTakeaways) {
    artTakeaways.innerHTML = `
      <h4 class="footer-label font-mono text-muted" style="margin-bottom: 8px;">KEY INSIGHTS</h4>
    `;
    const takeaways = bite.takeaway || bite.takeaways || [];
    takeaways.forEach((point, i) => {
      const p = document.createElement("p");
      p.className = "takeaway-point";
      p.innerHTML = `<span class="takeaway-no">${i+1}.</span> <span>${point}</span>`;
      artTakeaways.appendChild(p);
    });
  }
  
  // Render Quiz Question
  if (quizQuestion && bite.quiz) {
    quizQuestion.textContent = bite.quiz.question;
  }
  
  // Render Quiz Options
  if (quizOptions && bite.quiz) {
    quizOptions.innerHTML = "";
    selectedOptionIndex = null;
    isQuizSubmitted = false;
    if (submitQuizBtn) {
      submitQuizBtn.disabled = true;
      submitQuizBtn.textContent = "SUBMIT ANSWER";
      submitQuizBtn.style.display = "block";
    }
    if (feedbackBox) feedbackBox.classList.add("hidden");
    
    const options = bite.quiz.options || [];
    options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-opt-btn";
      btn.innerHTML = `
        <span class="opt-letter">${String.fromCharCode(65 + idx)}</span>
        <span>${opt}</span>
      `;
      
      btn.addEventListener("click", () => {
        if (isQuizSubmitted) return;
        
        // Remove selection style from other items
        const siblings = quizOptions.querySelectorAll(".quiz-opt-btn");
        siblings.forEach(s => s.classList.remove("selected"));
        
        // Mark selected
        btn.classList.add("selected");
        selectedOptionIndex = idx;
        if (submitQuizBtn) submitQuizBtn.disabled = false;
      });
      
      quizOptions.appendChild(btn);
    });
  }
}

function loadLearningBite(categoryKey) {
  currentCategory = categoryKey;
  
  // Display clean custom skeleton shimmers
  const articleContainer = document.getElementById("article-container");
  if (articleContainer) {
    articleContainer.innerHTML = `
      <div style="margin-top:10px;">
        <div class="skeleton-title"></div>
        <div class="skeleton-text" style="width: 100%;"></div>
        <div class="skeleton-text" style="width: 95%;"></div>
        <div class="skeleton-text" style="width: 80%;"></div>
      </div>
    `;
  }
  
  if (artTakeaways) {
    artTakeaways.innerHTML = `
      <div class="skeleton-line" style="width: 90%;"></div>
      <div class="skeleton-line" style="width: 70%;"></div>
    `;
  }
  
  if (quizOptions) {
    quizOptions.innerHTML = `
      <div class="skeleton-line" style="height:35px; width:100%; margin-bottom: 8px;"></div>
      <div class="skeleton-line" style="height:35px; width:100%;"></div>
    `;
  }
  
  if (submitQuizBtn) submitQuizBtn.style.display = "none";
  if (feedbackBox) feedbackBox.classList.add("hidden");
  
  const formattedKey = categoryKey.toLowerCase();
  
  // Try to generate dynamic learning content on /api/learning/generate
  fetch("/api/learning/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: categoryKey })
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("API build failure or off");
      const bite = await res.json();
      renderBiteData(bite);
    })
    .catch((err) => {
      console.warn("Using offline standalone backup concept for category:", categoryKey, err);
      const bite = staticBites[formattedKey] || staticBites["default"];
      renderBiteData(bite);
    });
}

// Submit Quiz Answer Evaluation
if (submitQuizBtn) {
  submitQuizBtn.addEventListener("click", () => {
    if (selectedOptionIndex === null || isQuizSubmitted) return;
    isQuizSubmitted = true;
    
    const bite = activeBiteData || staticBites[currentCategory] || staticBites["default"];
    if (!bite || !bite.quiz) return;

    const correctIdx = bite.quiz.correctIndex;
    const optionBtns = quizOptions.querySelectorAll(".quiz-opt-btn");
    
    // Evaluate options styles
    optionBtns.forEach((btn, idx) => {
      if (idx === correctIdx) {
        btn.classList.add("correct");
        btn.classList.remove("selected");
      } else if (idx === selectedOptionIndex) {
        btn.classList.add("incorrect");
        btn.classList.remove("selected");
      }
    });
    
    // Hide submit button, showcase feedbacks card
    submitQuizBtn.style.display = "none";
    if (feedbackBox) {
      feedbackBox.classList.remove("hidden");
      
      if (selectedOptionIndex === correctIdx) {
        feedbackEmoji.textContent = "✨";
        feedbackHeadline.textContent = "Comprehended Successfully!";
        feedbackHeadline.style.color = "#4caf50";
      } else {
        feedbackEmoji.textContent = "💡";
        feedbackHeadline.textContent = "A Learning Event!";
        feedbackHeadline.style.color = "#ffc107";
      }
      
      if (feedbackText) feedbackText.textContent = bite.quiz.explanation;
    }
    
    // Increment completed counts
    if (selectedOptionIndex === correctIdx) {
      StorageUtil.get("dayone_quiz_count", 3, (count) => {
        StorageUtil.set("dayone_quiz_count", count + 1);
      });
    }
  });
}

function renderTracksContainer(selectedTopics) {
  if (!tracksContainer) return;
  tracksContainer.innerHTML = "";
  
  const iconMap = {
    marketing: "📢",
    design: "🎨",
    coding: "💻",
    finance: "💵",
    sales: "📈",
    writing: "✍️",
    leadership: "👑",
    ai_automation: "🤖",
    public_speaking: "🎤",
    productivity: "⚡",
    "computer science": "💻"
  };

  selectedTopics.forEach((topic, idx) => {
    const btn = document.createElement("button");
    const label = topicLabelsMap[topic] || topic;
    const icon = iconMap[topic.toLowerCase()] || "🧠";
    
    btn.className = `track-pill ${idx === 0 ? 'active' : ''}`;
    btn.setAttribute("data-category", topic);
    btn.innerHTML = `${icon} ${label}`;
    
    btn.addEventListener("click", () => {
      const pills = tracksContainer.querySelectorAll(".track-pill");
      pills.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      loadLearningBite(topic);
    });
    
    tracksContainer.appendChild(btn);
  });
}

// 5. ONBOARDING STATE FLOW (SCREEN 1 & SCREEN 2)
let selectedOnboardingTopics = [];
let customOnboardingTopics = [];
let currentQuestionIdx = 0;
let assessmentQuestions = [];
let assessmentAnswers = {
  experience: "",
  level: "Beginner",
  goal: ""
};

const topicLabelsMap = {
  marketing: "Marketing",
  design: "Design",
  coding: "Coding",
  finance: "Finance",
  sales: "Sales",
  writing: "Writing",
  leadership: "Leadership",
  ai_automation: "AI & Automation",
  public_speaking: "Public Speaking",
  productivity: "Productivity"
};

const onboardingView = document.getElementById("onboarding-view");
const dashboardView = document.getElementById("dashboard-view");
const onboardingStartBtn = document.getElementById("onboarding-start-btn");
const onboardingCustomForm = document.getElementById("onboarding-custom-form");
const onboardingCustomInput = document.getElementById("onboarding-custom-input");
const onboardingChipsDrawer = document.getElementById("onboarding-chips-drawer");
const resetOnboardingBtn = document.getElementById("reset-onboarding-btn");

const stepSelection = document.getElementById("onboarding-step-selection");
const stepAssessment = document.getElementById("onboarding-step-assessment");
const stepSummary = document.getElementById("onboarding-step-summary");

const assessmentBackBtn = document.getElementById("assessment-back-btn");
const assessmentNextBtn = document.getElementById("assessment-next-btn");
const summaryFinishBtn = document.getElementById("summary-finish-btn");

function getQuestionsList(topicId, topicLabel) {
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
  // Default/fallback
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

function updateOnboardingCta() {
  if (!onboardingStartBtn) return;
  const hasSelection = selectedOnboardingTopics.length > 0;
  onboardingStartBtn.disabled = !hasSelection;
}

function renderOnboardingChips() {
  if (!onboardingChipsDrawer) return;
  onboardingChipsDrawer.innerHTML = "";

  customOnboardingTopics.forEach((topic) => {
    const chip = document.createElement("div");
    chip.className = "onboarding-chip";
    chip.innerHTML = `<span>${topic}</span> <span style="opacity:0.6; font-size:9px;">×</span>`;
    
    chip.addEventListener("click", () => {
      customOnboardingTopics = customOnboardingTopics.filter(t => t !== topic);
      selectedOnboardingTopics = selectedOnboardingTopics.filter(t => t !== topic);
      renderOnboardingChips();
      updateOnboardingCta();
    });

    onboardingChipsDrawer.appendChild(chip);
  });
}

function updateAssessmentNextBtn() {
  if (!assessmentNextBtn) return;
  const question = assessmentQuestions[currentQuestionIdx];
  if (!question) return;

  if (question.type === "text") {
    assessmentNextBtn.removeAttribute("disabled");
    assessmentNextBtn.innerText = currentQuestionIdx === assessmentQuestions.length - 1 ? "GENERATE GROWTH PLAN →" : "CONTINUE →";
  } else {
    const hasValue = !!assessmentAnswers[question.id];
    if (hasValue) {
      assessmentNextBtn.removeAttribute("disabled");
      assessmentNextBtn.innerText = currentQuestionIdx === assessmentQuestions.length - 1 ? "GENERATE GROWTH PLAN →" : "CONTINUE →";
    } else {
      assessmentNextBtn.setAttribute("disabled", "true");
      assessmentNextBtn.innerText = "SELECT AN OPTION";
    }
  }
}

function renderAssessmentQuestion() {
  if (!stepAssessment) return;
  
  if (stepSelection) stepSelection.classList.add("hidden");
  if (stepSummary) stepSummary.classList.add("hidden");
  stepAssessment.classList.remove("hidden");

  const question = assessmentQuestions[currentQuestionIdx];
  if (!question) return;

  // Render question text
  const qTitle = document.getElementById("assessment-question-title");
  if (qTitle) qTitle.innerText = question.text;

  // Render badge/topic label
  const primaryTopic = selectedOnboardingTopics[0] || "coding";
  const primaryTopicLabel = topicLabelsMap[primaryTopic] || primaryTopic;
  const badge = document.getElementById("assessment-topic-badge");
  if (badge) badge.innerText = `${primaryTopicLabel.toUpperCase()} ASSESSMENT`;

  // Update question index label
  const countLabel = document.getElementById("assessment-q-count");
  if (countLabel) countLabel.innerText = `Q ${currentQuestionIdx + 1} OF ${assessmentQuestions.length}`;

  // Update dots
  const dotsContainer = document.getElementById("assessment-progress-dots");
  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    for (let i = 0; i < assessmentQuestions.length; i++) {
      const dot = document.createElement("div");
      dot.style.height = "6px";
      dot.style.borderRadius = "10px";
      dot.style.transition = "all 0.3s";
      if (i === currentQuestionIdx) {
        dot.style.width = "24px";
        dot.style.backgroundColor = "#6C63FF";
      } else if (i < currentQuestionIdx) {
        dot.style.width = "10px";
        dot.style.backgroundColor = "rgba(108, 99, 255, 0.5)";
      } else {
        dot.style.width = "6px";
        dot.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
      }
      dotsContainer.appendChild(dot);
    }
  }

  // Render inputs options container
  const optionsContainer = document.getElementById("assessment-options-container");
  if (!optionsContainer) return;
  optionsContainer.innerHTML = "";

  if (question.type === "select" && question.options) {
    question.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "onboard-card";
      btn.style.width = "100%";
      btn.style.flexDirection = "row";
      btn.style.justifyContent = "space-between";
      btn.style.padding = "16px";
      btn.style.textAlign = "left";
      btn.style.fontSize = "12px";

      const chosen = assessmentAnswers[question.id] === opt.value;
      if (chosen) {
        btn.classList.add("active");
      }

      btn.innerHTML = `
        <span>${opt.label}</span>
        ${chosen ? '<div style="width:8px; height:8px; border-radius:50%; background:#6C63FF; box-shadow:0 0 8px #6C63FF;"></div>' : ''}
      `;

      btn.addEventListener("click", () => {
        assessmentAnswers[question.id] = opt.value;
        StorageUtil.set(`dayone_assessment_${question.id}`, opt.value);
        renderAssessmentQuestion();
        
        if (question.id === "experience") {
          setTimeout(() => {
            currentQuestionIdx = 1;
            renderAssessmentQuestion();
          }, 250);
        }
      });
      optionsContainer.appendChild(btn);
    });
  } else if (question.type === "choice" && question.options) {
    question.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "onboard-card";
      btn.style.width = "100%";
      btn.style.flexDirection = "row";
      btn.style.justifyContent = "space-between";
      btn.style.padding = "16px";
      btn.style.textAlign = "left";
      btn.style.fontSize = "12px";

      const chosen = assessmentAnswers[question.id] === opt.value;
      if (chosen) {
        btn.classList.add("active");
      }

      btn.innerHTML = `
        <span>${opt.label}</span>
        <span class="font-mono" style="font-size: 8px; font-weight: bold; background: rgba(108, 99, 255, 0.15); color: #6C63FF; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">${opt.value}</span>
      `;

      btn.addEventListener("click", () => {
        assessmentAnswers[question.id] = opt.value;
        StorageUtil.set(`dayone_assessment_${question.id}`, opt.value);
        renderAssessmentQuestion();
      });
      optionsContainer.appendChild(btn);
    });
  } else if (question.type === "text") {
    const textWrapper = document.createElement("div");
    textWrapper.style.display = "flex";
    textWrapper.style.flexDirection = "column";
    textWrapper.style.gap = "8px";
    textWrapper.style.width = "100%";

    const textarea = document.createElement("textarea");
    textarea.style.width = "100%";
    textarea.style.height = "110px";
    textarea.style.backgroundColor = "#0a0a0f";
    textarea.style.border = "1px solid rgba(255, 255, 255, 0.1)";
    textarea.style.borderRadius = "12px";
    textarea.style.padding = "12px";
    textarea.style.color = "white";
    textarea.style.fontSize = "12px";
    textarea.style.lineHeight = "1.5";
    textarea.style.resize = "none";
    textarea.style.boxSizing = "border-box";
    textarea.placeholder = question.placeholder || "";
    textarea.value = assessmentAnswers[question.id] || "";

    textarea.addEventListener("input", (e) => {
      assessmentAnswers[question.id] = e.target.value;
      StorageUtil.set(`dayone_assessment_${question.id}`, e.target.value);
      updateAssessmentNextBtn();
    });

    const tip = document.createElement("p");
    tip.style.fontSize = "10px";
    tip.style.color = "rgba(255, 255, 255, 0.35)";
    tip.style.margin = "0";
    tip.style.lineHeight = "1.4";
    tip.innerText = "This goal will customize your study points, learning card bites, and targeted strategies in the DayOne tab dashboard.";

    textWrapper.appendChild(textarea);
    textWrapper.appendChild(tip);
    optionsContainer.appendChild(textWrapper);
  }

  updateAssessmentNextBtn();
}

function renderSummaryPhase() {
  if (stepAssessment) stepAssessment.classList.add("hidden");
  if (stepSummary) stepSummary.classList.remove("hidden");

  const primaryTopic = selectedOnboardingTopics[0] || "coding";
  const primaryTopicLabel = topicLabelsMap[primaryTopic] || primaryTopic;
  const chosenLevel = assessmentAnswers.level || "Beginner";
  const chosenGoal = assessmentAnswers.goal ? assessmentAnswers.goal.trim() : `mastering core concepts of ${primaryTopicLabel}`;

  const levelBadge = document.getElementById("summary-level-badge");
  const goalItalic = document.getElementById("summary-goal-italic");

  if (levelBadge) levelBadge.innerText = chosenLevel;
  if (goalItalic) goalItalic.innerText = `"${chosenGoal}"`;
}

function initOnboarding() {
  const onboardCards = document.querySelectorAll(".onboard-card");
  onboardCards.forEach((card) => {
    card.addEventListener("click", () => {
      const topicId = card.getAttribute("data-topic");
      if (!topicId) return; // ignore dynamically rendered cards helper
      
      if (selectedOnboardingTopics.includes(topicId)) {
        selectedOnboardingTopics = selectedOnboardingTopics.filter(id => id !== topicId);
        card.classList.remove("active");
      } else {
        selectedOnboardingTopics.push(topicId);
        card.classList.add("active");
      }
      
      updateOnboardingCta();
    });
  });

  if (onboardingCustomForm && onboardingCustomInput) {
    onboardingCustomForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = onboardingCustomInput.value.trim();
      if (text && !customOnboardingTopics.includes(text)) {
        customOnboardingTopics.push(text);
        if (!selectedOnboardingTopics.includes(text)) {
          selectedOnboardingTopics.push(text);
        }
        onboardingCustomInput.value = "";
        renderOnboardingChips();
        updateOnboardingCta();
      }
    });
  }

  // LET'S BEGIN start button transitions to Step 2
  if (onboardingStartBtn) {
    onboardingStartBtn.addEventListener("click", () => {
      if (selectedOnboardingTopics.length === 0) return;
      StorageUtil.set("dayone_selected_topics", selectedOnboardingTopics);
      
      const primaryTopic = selectedOnboardingTopics[0] || "coding";
      const primaryTopicLabel = topicLabelsMap[primaryTopic] || primaryTopic;
      
      assessmentQuestions = getQuestionsList(primaryTopic, primaryTopicLabel);
      currentQuestionIdx = 0;
      assessmentAnswers = {
        experience: "",
        level: "Beginner",
        goal: ""
      };
      
      renderAssessmentQuestion();
    });
  }

  // Back button on Step 2
  if (assessmentBackBtn) {
    assessmentBackBtn.addEventListener("click", () => {
      if (currentQuestionIdx > 0) {
        currentQuestionIdx--;
        renderAssessmentQuestion();
      } else {
        if (stepAssessment) stepAssessment.classList.add("hidden");
        if (stepSelection) stepSelection.classList.remove("hidden");
      }
    });
  }

  // Next button on Step 2
  if (assessmentNextBtn) {
    assessmentNextBtn.addEventListener("click", () => {
      const question = assessmentQuestions[currentQuestionIdx];
      if (!question) return;

      if (currentQuestionIdx < assessmentQuestions.length - 1) {
        currentQuestionIdx++;
        renderAssessmentQuestion();
      } else {
        renderSummaryPhase();
      }
    });
  }

  // Finish button on Step 3
  if (summaryFinishBtn) {
    summaryFinishBtn.addEventListener("click", () => {
      StorageUtil.set("dayone_completed_onboarding", true);
      
      // Dynamically initialize the custom goals & targets
      StorageUtil.get("dayone_assessment_goal", "", (goalText) => {
        const defaultFocusText = goalText && goalText.trim() !== "" 
          ? `Calibrate milestone: ${goalText}` 
          : "Study daily milestone";
          
        focusItems = [{ id: "1", text: defaultFocusText, completed: false }];
        StorageUtil.set("dayone_focus_items", focusItems);
        renderFocusList();
      });

      StorageUtil.get("dayone_selected_topics", ["coding"], (topics) => {
        selectedOnboardingTopics = topics;
        renderTracksContainer(topics);
        loadLearningBite(topics[0] || "coding");
      });

      if (onboardingView) onboardingView.classList.add("hidden");
      if (dashboardView) dashboardView.classList.remove("hidden");
    });
  }

  // Dashboard Reset button
  if (resetOnboardingBtn) {
    resetOnboardingBtn.addEventListener("click", () => {
      StorageUtil.set("dayone_completed_onboarding", false);
      selectedOnboardingTopics = [];
      customOnboardingTopics = [];
      
      onboardCards.forEach(c => c.classList.remove("active"));
      if (onboardingChipsDrawer) onboardingChipsDrawer.innerHTML = "";
      updateOnboardingCta();
      
      if (stepAssessment) stepAssessment.classList.add("hidden");
      if (stepSummary) stepSummary.classList.add("hidden");
      if (stepSelection) stepSelection.classList.remove("hidden");
      
      if (dashboardView) dashboardView.classList.add("hidden");
      if (onboardingView) onboardingView.classList.remove("hidden");
    });
  }
}

// 6. BOOTSTRAPPING
document.addEventListener("DOMContentLoaded", () => {
  initOnboarding();

  // Load theme and set attribute
  StorageUtil.get("dayone_color_theme", "dark", (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  });

  // Load custom onboarding topics dynamically
  StorageUtil.get("dayone_selected_topics", ["coding"], (topics) => {
    selectedOnboardingTopics = topics;
    renderTracksContainer(topics);
    loadLearningBite(topics[0] || "coding");
  });

  // Load custom goal and pre-populate first milestone list if empty
  StorageUtil.get("dayone_assessment_goal", "", (goalText) => {
    const defaultFocusText = goalText && goalText.trim() !== "" 
      ? `Calibrate milestone: ${goalText}` 
      : "Study dynamic programming recursion parameters";

    StorageUtil.get("dayone_focus_items", null, (items) => {
      if (items === null) {
        focusItems = [{ id: "1", text: defaultFocusText, completed: false }];
        StorageUtil.set("dayone_focus_items", focusItems);
      } else {
        focusItems = items;
      }
      renderFocusList();
    });
  });

  // Route screen based on completed status
  StorageUtil.get("dayone_completed_onboarding", false, (completed) => {
    if (completed) {
      if (onboardingView) onboardingView.classList.add("hidden");
      if (dashboardView) dashboardView.classList.remove("hidden");
    } else {
      if (onboardingView) onboardingView.classList.remove("hidden");
      if (dashboardView) dashboardView.classList.add("hidden");
    }
  });
});
