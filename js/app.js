// ==============================================================================
// MYTH DSA APPLICATION ENGINE - PRODUCTION GRADE
// Dual-Language (C++ & Java) • Multi-Tone • Dark/Light Neo-Brutalist • Auth Gatekeeper
// Performance Analytics • Realtime Multi-User Leaderboard • Master DSA Modules
// ==============================================================================

import { FIREBASE_CONFIG } from "./firebase-config.js";
import { CloudDB } from "./cloud-db.js";
import { COURSE_DATA } from "./content.js";
import { visualizerInstance } from "./visualizer.js";
import { mascotEngineInstance } from "./mascot-system.js";
import { raceArenaInstance } from "./race-arena.js";
import { calculateCompositePoints, calculateConsecutiveStreak } from "./scoring.js";

document.addEventListener("DOMContentLoaded", () => {
  // Ensure globals exist for inline handlers & cross-module helpers
  window.COURSE_DATA = COURSE_DATA;
  window.CloudDB = CloudDB;
  window.visualizerInstance = visualizerInstance;
  window.MascotEngine = mascotEngineInstance;
  window.RaceArenaInstance = raceArenaInstance;

  // Storage Keys
  const KEY_AUTH = "myth_auth_session_v4";
  const KEY_THEME = "myth_theme_preference_v4";
  const KEY_LANG = "myth_language_mode_v4";
  const KEY_CODE_MODE = "myth_code_mode_v4"; // 'cpp' | 'java'
  const KEY_SOUND = "myth_sound_enabled_v4";
  const KEY_PROGRESS = "myth_completed_topics_v4";
  const KEY_SOLVED_PROBS = "myth_solved_problems_v4";
  const KEY_BOOKMARKS = "myth_bookmarked_problems_v4";
  const KEY_NOTES = "myth_problem_notes_v4";
  const KEY_SCRATCHPAD = "myth_scratchpad_v4";
  const KEY_LEADERBOARD = "myth_global_leaderboard_v4";
  const KEY_ATTEMPTS = "myth_user_attempts_v4";
  const KEY_LC_CACHE = "myth_lc_cache_v4";
  const KEY_ACTIVITY = "myth_submission_activity_v4";

  // App State
  let currentTheme = localStorage.getItem(KEY_THEME) || "dark";
  let currentLang = localStorage.getItem(KEY_LANG) || "hinglish";
  let currentCodeMode = localStorage.getItem(KEY_CODE_MODE) || "cpp";
  let soundEnabled = localStorage.getItem(KEY_SOUND) !== "false";
  let activeTopicIdx = 0;
  let activeTab = "concept"; // 'modules' | 'concept' | 'visualizer' | 'practice' | 'analytics' | 'arena' | 'leaderboard'
  let practiceFilter = "all"; // 'all' | 'unsolved' | 'solved' | 'bookmarked'

  // Auth & User Data
  let authSession = null;
  try {
    authSession = JSON.parse(localStorage.getItem(KEY_AUTH) || "null");
  } catch (e) {
    authSession = null;
  }

  let completedTopics = new Set();
  let solvedProblems = new Set();
  let bookmarkedProblems = new Set();

  // ============================================================================
  // WEB AUDIO TACTILE SOUND ENGINE (Zero-dependency, browser-autoplay safe)
  // ============================================================================
  const SoundFX = {
    ctx: null,
    _ensureCtx() {
      if (!soundEnabled || typeof window === "undefined") return null;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.ctx) this.ctx = new AudioCtx();
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      return this.ctx;
    },
    playTone(freq, duration = 0.06, type = "sine", gainVal = 0.04) {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {}
    },
    click() { this.playTone(540, 0.04, "triangle", 0.025); },
    success() {
      this.playTone(523.25, 0.09, "triangle", 0.045);
      setTimeout(() => this.playTone(659.25, 0.09, "triangle", 0.045), 75);
      setTimeout(() => this.playTone(783.99, 0.14, "triangle", 0.05), 150);
    },
    error() { this.playTone(210, 0.12, "sawtooth", 0.03); }
  };

  // ============================================================================
  // DOM ELEMENTS
  // ============================================================================
  const appViewportLayout = document.getElementById("appViewportLayout");
  const conceptLandingScreen = document.getElementById("conceptLandingScreen");
  const landingGetStartedBtn = document.getElementById("landingGetStartedBtn");
  const landingHeaderSignInBtn = document.getElementById("landingHeaderSignInBtn");
  const landingThemeToggleBtn = document.getElementById("landingThemeToggleBtn");
  const authGatekeeperModal = document.getElementById("authGatekeeperModal");
  const authBackToLandingBtn = document.getElementById("authBackToLandingBtn");
  const authInputName = document.getElementById("authInputName");
  const authInputRoll = document.getElementById("authInputRoll");
  const authInputGender = document.getElementById("authInputGender");
  const authInputLeetCode = document.getElementById("authInputLeetCode");
  const authInputLangTrack = document.getElementById("authInputLangTrack");
  const authInputTargetGoal = document.getElementById("authInputTargetGoal");
  const authErrorAlert = document.getElementById("authErrorAlert");

  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const soundToggleBtn = document.getElementById("soundToggleBtn");
  const toneSelector = document.getElementById("toneSelector");
  const codeModeCppBtn = document.getElementById("codeModeCppBtn");
  const codeModeJavaBtn = document.getElementById("codeModeJavaBtn");

  const brandHomeBtn = document.getElementById("brandHomeBtn");
  const topbarTrackBtn = document.getElementById("topbarTrackBtn");
  const profileOpenBtn = document.getElementById("profileOpenBtn");
  const deployGuideBtn = document.getElementById("deployGuideBtn");
  const profileModal = document.getElementById("profileModal");
  const deployModal = document.getElementById("deployModal");
  const roadmapModal = document.getElementById("roadmapModal");
  const closeProfileModal = document.getElementById("closeProfileModal");
  const closeProfileModalBtn = document.getElementById("closeProfileModalBtn");
  const logoutProfileBtn = document.getElementById("logoutProfileBtn");
  const closeDeployModal = document.getElementById("closeDeployModal");
  const closeRoadmapModal = document.getElementById("closeRoadmapModal");

  const topbarProfileName = document.getElementById("topbarProfileName");
  const topbarProfileAvatar = document.getElementById("topbarProfileAvatar");

  const curriculumSidebar = document.getElementById("curriculumSidebar");
  const sidebarList = document.getElementById("sidebarTopicsList");
  const sidebarModulesCount = document.getElementById("sidebarModulesCount");
  const searchInput = document.getElementById("sidebarSearchInput");
  const mobileCurriculumBtn = document.getElementById("mobileCurriculumBtn");
  const closeMobileSidebarBtn = document.getElementById("closeMobileSidebarBtn");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  const mainContentArea = document.getElementById("mainContentArea");
  const overallProgressBar = document.getElementById("overallProgressBar");
  const overallProgressLabel = document.getElementById("overallProgressLabel");

  const tabModulesBtn = document.getElementById("tabModulesBtn");
  const tabConceptBtn = document.getElementById("tabConceptBtn");
  const tabVisualizerBtn = document.getElementById("tabVisualizerBtn");
  const tabPracticeBtn = document.getElementById("tabPracticeBtn");
  const tabAnalyticsBtn = document.getElementById("tabAnalyticsBtn");
  const tabLeaderboardBtn = document.getElementById("tabLeaderboardBtn");
  const tabRaceArenaBtn = document.getElementById("tabRaceArenaBtn");
  const tabAboutBtn = document.getElementById("tabAboutBtn");

  const FOUNDER_LINKEDIN_URL = "https://www.linkedin.com/in/kartik-kumar955";
  document.querySelectorAll("[data-founder-linkedin]").forEach(el => {
    el.setAttribute("href", FOUNDER_LINKEDIN_URL);
  });

  const mascotStudioBtn = document.getElementById("mascotStudioBtn");
  const mascotStudioModal = document.getElementById("mascotStudioModal");
  const closeMascotStudioModal = document.getElementById("closeMascotStudioModal");
  const closeMascotStudioBtn = document.getElementById("closeMascotStudioBtn");
  const equipMascotBtn = document.getElementById("equipMascotBtn");
  const mascotPreviewMount = document.getElementById("mascotPreviewMount");
  const mascotPreviewName = document.getElementById("mascotPreviewName");
  const mascotPreviewRole = document.getElementById("mascotPreviewRole");
  const mascotPreviewRarity = document.getElementById("mascotPreviewRarity");
  const mascotPreviewQuote = document.getElementById("mascotPreviewQuote");
  const mascotPalettePicker = document.getElementById("mascotPalettePicker");
  const mascotSelectorGrid = document.getElementById("mascotSelectorGrid");
  const mascotModalAuraHalo = document.getElementById("mascotModalAuraHalo");

  const comingSoonModal = document.getElementById("comingSoonModal");
  const closeComingSoonModal = document.getElementById("closeComingSoonModal");
  const closeComingSoonBtn = document.getElementById("closeComingSoonBtn");
  const comingSoonModalTitle = document.getElementById("comingSoonModalTitle");
  const comingSoonModalDesc = document.getElementById("comingSoonModalDesc");
  const comingSoonTopicsList = document.getElementById("comingSoonTopicsList");

  const cloudSyncStatusBtn = document.getElementById("cloudSyncStatusBtn");
  const cloudSetupModal = document.getElementById("cloudSetupModal");
  const closeCloudSetupModal = document.getElementById("closeCloudSetupModal");

  // Apply Theme & Sound Initial State
  document.body.classList.toggle("dark", currentTheme === "dark");
  updateSoundButton();

  // ============================================================================
  // HELPERS: HTML ESCAPING, INLINE CODE FORMATTING, TOAST & ACTIVITY LOGGER
  // ============================================================================
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatInlineContent(str) {
    if (!str) return "";
    return String(str)
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function extractComplexity(prob) {
    const code = (currentCodeMode === "java" && prob.solution_java)
      ? prob.solution_java
      : (prob.solution_cpp || prob.solution_java || "");
    const timeMatch = code.match(/Time:\s*([^|\n]+)/i);
    const spaceMatch = code.match(/Space:\s*([^\n]+)/i);
    return {
      time: prob.time_complexity || (timeMatch ? timeMatch[1].trim() : "O(N)"),
      space: prob.space_complexity || (spaceMatch ? spaceMatch[1].trim() : "O(1)")
    };
  }

  function getCurriculumProblemTotals() {
    let total = 0, easy = 0, medium = 0, hard = 0;
    COURSE_DATA.forEach(t => {
      (t.problems || []).forEach(p => {
        total++;
        if (p.difficulty === "Easy") easy++;
        else if (p.difficulty === "Medium") medium++;
        else if (p.difficulty === "Hard") hard++;
      });
    });
    return { total: total || 42, easy: easy || 14, medium: medium || 14, hard: hard || 14 };
  }

  function showNotification(msg) {
    let toast = document.getElementById("mythAppToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "mythAppToast";
      toast.style.cssText = "position:fixed; bottom:24px; right:24px; z-index:99999; background:var(--bg-surface); border:var(--border-thick); border-radius:var(--radius-boxy); box-shadow:var(--shadow-tactile-lg); padding:0.75rem 1.1rem; font-family:var(--font-mono); font-size:0.8rem; font-weight:800; color:var(--text-main); display:none; align-items:center; gap:0.5rem; transition:transform 0.22s ease, opacity 0.22s ease;";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>⚡</span> <span>${escapeHtml(msg)}</span>`;
    toast.style.display = "flex";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }, 10);
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => { toast.style.display = "none"; }, 240);
    }, 3200);
  }
  window.showNotification = showNotification;

  function recordActivityEvent() {
    if (!authSession) return;
    const today = new Date().toISOString().split("T")[0];
    const key = `${KEY_ACTIVITY}_${authSession.roll}`;
    const activityMap = JSON.parse(localStorage.getItem(key) || "{}");
    activityMap[today] = (activityMap[today] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(activityMap));
  }

  function updateSoundButton() {
    if (!soundToggleBtn) return;
    soundToggleBtn.innerText = soundEnabled ? "🔊" : "🔇";
    soundToggleBtn.title = soundEnabled ? "Sound Effects On (Click to Mute)" : "Sound Effects Muted (Click to Enable)";
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem(KEY_SOUND, String(soundEnabled));
      updateSoundButton();
      if (soundEnabled) SoundFX.click();
      showNotification(soundEnabled ? "UI Sound Effects Enabled" : "UI Sound Effects Muted");
    });
  }

  // Mobile Sidebar Drawer Helpers
  function openMobileSidebar() {
    if (curriculumSidebar) curriculumSidebar.classList.add("mobile-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.add("active");
  }

  function closeMobileSidebar() {
    if (curriculumSidebar) curriculumSidebar.classList.remove("mobile-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
  }

  if (mobileCurriculumBtn) mobileCurriculumBtn.addEventListener("click", openMobileSidebar);
  if (closeMobileSidebarBtn) closeMobileSidebarBtn.addEventListener("click", closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeMobileSidebar);

  // ============================================================================
  // CLOUD SYNC ENGINE (Automatic silent Firestore sync for verified cohort)
  // ============================================================================

  // ============================================================================
  // REAL LEETCODE LIVE ACCOUNT CONNECT & SYNC ENGINE
  // ============================================================================
  function extractLeetCodeUsername(input) {
    if (!input) return "";
    let clean = input.trim().replace(/\/$/, "");
    if (clean.includes("leetcode.com")) {
      const parts = clean.split("/");
      return parts[parts.length - 1] || "";
    }
    return clean.replace(/[@#]/g, "");
  }

  function getLeetCodeLiveStats(username) {
    if (!username) return null;
    const cacheKey = `${KEY_LC_CACHE}_${username}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return {
      username,
      isConnected: false,
      ranking: 0,
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      acceptanceRate: 0,
      rating: 0,
      tier: "Unrated",
      lastSynced: "Awaiting Sync",
      recentSubmissions: [],
      submissionCalendar: {},
      streak: 0
    };
  }

  async function syncLeetCodeLiveProfile(username, btnElement) {
    if (!username) return null;
    if (btnElement) btnElement.classList.add("syncing");
    const cacheKey = `${KEY_LC_CACHE}_${username}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const [profileRes, subRes, calRes] = await Promise.allSettled([
        fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(username)}`, { signal: controller.signal }),
        fetch(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(username)}/acSubmission`, { signal: controller.signal }),
        fetch(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(username)}/calendar`, { signal: controller.signal })
      ]);
      clearTimeout(timeoutId);

      let profileData = null;
      let submissionsData = [];
      let calendarData = {};
      let streak = 0;

      if (profileRes.status === "fulfilled" && profileRes.value.ok) {
        profileData = await profileRes.value.json();
      }
      if (subRes.status === "fulfilled" && subRes.value.ok) {
        const subJson = await subRes.value.json();
        submissionsData = Array.isArray(subJson.submission) ? subJson.submission : [];
      }
      if (calRes.status === "fulfilled" && calRes.value.ok) {
        const calJson = await calRes.value.json();
        streak = calJson.streak || 0;
        calendarData = calJson.submissionCalendar || {};
        if (typeof calendarData === "string") {
          try { calendarData = JSON.parse(calendarData); } catch (e) { calendarData = {}; }
        }
      }

      if (profileData && profileData.totalSolved !== undefined) {
        const formattedSubmissions = submissionsData.slice(0, 8).map(s => {
          let relTime = "Recently";
          if (s.timestamp) {
            const sec = Math.floor((Date.now() / 1000) - parseInt(s.timestamp, 10));
            if (sec < 3600) relTime = `${Math.max(1, Math.floor(sec / 60))}m ago`;
            else if (sec < 86400) relTime = `${Math.floor(sec / 3600)}h ago`;
            else relTime = `${Math.floor(sec / 86400)}d ago`;
          }
          return {
            title: s.title || "Algorithm Problem",
            status: s.statusDisplay || "Accepted",
            lang: (s.lang || "C++").toUpperCase(),
            time: relTime
          };
        });

        const rankNum = profileData.ranking || 0;
        const estRating = rankNum > 0 ? Math.max(1200, Math.min(2400, Math.round(2800 - Math.log10(rankNum) * 280))) : 1500;
        const totalSolved = profileData.totalSolved || 0;
        let tier = "Specialist";
        if (totalSolved >= 600) tier = "Guardian";
        else if (totalSolved >= 250) tier = "Knight";

        const stats = {
          username,
          isConnected: true,
          ranking: rankNum,
          totalSolved,
          easySolved: profileData.easySolved || 0,
          mediumSolved: profileData.mediumSolved || 0,
          hardSolved: profileData.hardSolved || 0,
          acceptanceRate: profileData.acceptanceRate || 0,
          reputation: profileData.reputation || 0,
          rating: estRating,
          tier,
          lastSynced: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          recentSubmissions: formattedSubmissions,
          submissionCalendar: calendarData,
          streak
        };

        localStorage.setItem(cacheKey, JSON.stringify(stats));
        return stats;
      }
    } catch (err) {
      console.warn("LeetCode live API fetch attempt:", err.message);
    } finally {
      if (btnElement) btnElement.classList.remove("syncing");
    }

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }

    return {
      username,
      isConnected: false,
      ranking: 0,
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      acceptanceRate: 0,
      rating: 0,
      tier: "Unrated",
      lastSynced: "Could not reach LeetCode",
      recentSubmissions: [],
      submissionCalendar: {},
      streak: 0,
      error: "Profile not found or LeetCode service unreachable."
    };
  }

  window.connectLeetCodeFromAnalytics = async () => {
    const input = document.getElementById("analyticsInputLeetCode");
    const btn = document.getElementById("btnConnectLeetCodeAnalytics");
    if (!input || !authSession) return;
    if (!isCohortVerifiedUser()) {
      SoundFX.error();
      showNotification("Verification required: Contact admin for verification, then you can connect your LeetCode.");
      alert("Verification Required:\nContact admin for verification, then you can connect your LeetCode.\n\n(You still have full access to all platform units, visualizer, practice arena, and analytics!)");
      return;
    }
    const raw = input.value.trim();
    if (!raw) {
      authSession.leetcodeUser = "";
      localStorage.setItem(KEY_AUTH, JSON.stringify(authSession));
      syncCurrentUserLeaderboard();
      renderAnalyticsView();
      showNotification("LeetCode account disconnected.");
      return;
    }
    const newUsername = extractLeetCodeUsername(raw);
    const stats = await syncLeetCodeLiveProfile(newUsername, btn);

    if (stats && stats.isConnected) {
      authSession.leetcodeUser = newUsername;
      localStorage.setItem(KEY_AUTH, JSON.stringify(authSession));
      if (CloudDB.isCloudActive && authSession.rosterVerified) {
        CloudDB.saveUserProfile({ ...authSession, leetcodeUser: newUsername });
      }
      syncCurrentUserLeaderboard();
      renderAnalyticsView();
      SoundFX.success();
      showNotification(`LeetCode @${newUsername} connected! ${stats.totalSolved} solved questions verified.`);
    } else {
      SoundFX.error();
      alert(`Could not find LeetCode account "${newUsername}". Please verify your username on leetcode.com.`);
    }
  };

  window.updateAndSyncLeetCode = async () => {
    const modalInputLeetCode = document.getElementById("modalInputLeetCode");
    if (!modalInputLeetCode || !authSession) return;
    if (!isCohortVerifiedUser()) {
      SoundFX.error();
      showNotification("Verification required: Contact admin for verification, then you can connect your LeetCode.");
      alert("Verification Required:\nContact admin for verification, then you can connect your LeetCode.\n\n(You still have full access to all platform units, visualizer, practice arena, and analytics!)");
      return;
    }
    const raw = modalInputLeetCode.value.trim();
    if (!raw) {
      authSession.leetcodeUser = "";
      localStorage.setItem(KEY_AUTH, JSON.stringify(authSession));
      syncCurrentUserLeaderboard();
      updateProfileDisplay();
      showNotification("LeetCode account disconnected.");
      return;
    }
    const newUsername = extractLeetCodeUsername(raw);
    const stats = await syncLeetCodeLiveProfile(newUsername);
    if (stats && stats.isConnected) {
      authSession.leetcodeUser = newUsername;
      localStorage.setItem(KEY_AUTH, JSON.stringify(authSession));
      if (CloudDB.isCloudActive && authSession.rosterVerified) {
        CloudDB.saveUserProfile({ ...authSession, leetcodeUser: newUsername });
      }
      syncCurrentUserLeaderboard();
      updateProfileDisplay();
      if (activeTab === "analytics") renderAnalyticsView();
      else if (activeTab === "leaderboard") renderLeaderboardView();
      SoundFX.success();
      showNotification(`LeetCode @${newUsername} connected! ${stats.totalSolved} solved questions verified.`);
    } else {
      SoundFX.error();
      alert(`Could not verify LeetCode account "${newUsername}". Please check username.`);
    }
  };

  // ============================================================================
  // MASTER DSA ROADMAP DEFINITION
  // ============================================================================
  const MASTER_ROADMAP = [
    {
      id: "linked_list",
      moduleNum: "01",
      title: "Linked Lists & Pointer Architecture",
      icon: "🔗",
      status: "active",
      modulesCount: COURSE_DATA.length,
      problemsCount: getCurriculumProblemTotals().total,
      desc: "Zero-to-hero mastery of memory nodes, iterative/recursive reversals, cycle detection, Tortoise & Hare, and ListNode patterns in C++ and Java.",
      tags: ["Pointers", "Memory", "Two Pointers", "Fast & Slow", "Recursion"],
      topics: [
        "Pointers, References & Dynamic Memory (new/delete vs GC)",
        "Singly Linked List Creation, Traversal & Printing",
        "Insertion & Deletion Operations (Head, Tail, Pos, Val)",
        "3-Pointer Iterative & Recursive In-Place Reversal",
        "Tortoise & Hare (Fast & Slow Pointer) & Floyd Cycle",
        "Merge Sorted Lists, Palindrome & Intersection",
        "Doubly & Circular Linked Lists Implementation"
      ]
    },
    {
      id: "arrays_strings",
      moduleNum: "02",
      title: "Arrays, Strings & Two Pointers",
      icon: "📊",
      status: "coming_soon",
      modulesCount: 18,
      problemsCount: 38,
      desc: "Kadane's algorithm, sliding window dynamic bounds, prefix sums, 2Sum/3Sum, Dutch National Flag, and Boyer-Moore Voting.",
      tags: ["Sliding Window", "Prefix Sum", "Two Pointers", "Binary Search"],
      topics: [
        "Kadane's Algorithm for Maximum Subarray Sum",
        "Two Pointers: 2Sum, 3Sum & Container With Most Water",
        "Sliding Window (Fixed & Variable Length Substrings)",
        "Prefix Sum & 2D Matrix Range Queries",
        "Dutch National Flag 3-Way Partitioning (Sort Colors)",
        "Trapping Rain Water (Two Pointers vs Prefix Arrays)"
      ]
    },
    {
      id: "stacks_queues",
      moduleNum: "03",
      title: "Stacks, Queues & Monotonic Deques",
      icon: "🥞",
      status: "coming_soon",
      modulesCount: 12,
      problemsCount: 28,
      desc: "Monotonic stacks, Next Greater Element, Largest Rectangle in Histogram, Min Stack, sliding window maximum, and LRU Cache.",
      tags: ["Monotonic Stack", "LRU Cache", "Queue", "Deque"],
      topics: [
        "Stack & Queue Implementations using Array & List",
        "Monotonic Stack: Next Greater Element I & II",
        "Largest Rectangle in Histogram & Maximal Rectangle",
        "Min Stack with O(1) Time & Space Optimizations",
        "Sliding Window Maximum using Monotonic Deque",
        "LRU Cache & LFU Cache Design with Hash + DLL"
      ]
    },
    {
      id: "binary_trees",
      moduleNum: "04",
      title: "Binary Trees & Binary Search Trees",
      icon: "🌲",
      status: "coming_soon",
      modulesCount: 20,
      problemsCount: 45,
      desc: "DFS & BFS traversals, Lowest Common Ancestor (LCA), boundary traversal, Morris traversal, Tree serialization, and BST invariants.",
      tags: ["DFS", "BFS", "Recursion", "BST"],
      topics: [
        "Preorder, Inorder, Postorder & Level-Order BFS",
        "Lowest Common Ancestor (LCA) in Binary Tree & BST",
        "Boundary Traversal & Vertical Order Views",
        "Morris Inorder Traversal in O(1) Extra Space",
        "Serialize and Deserialize Binary Tree",
        "Validate BST, BST Iterator & Kth Smallest Element"
      ]
    },
    {
      id: "heaps_greedy",
      moduleNum: "05",
      title: "Heaps, Priority Queues & Greedy",
      icon: "⛰️",
      status: "coming_soon",
      modulesCount: 10,
      problemsCount: 24,
      desc: "Min/Max heaps from scratch, Top K Frequent Elements, Find Median from Data Stream, Merge K Sorted Lists, and Task Scheduler.",
      tags: ["Min-Heap", "Greedy", "Priority Queue"],
      topics: [
        "Binary Heap Construction & Sift-Up/Sift-Down",
        "Top K Frequent Elements & Kth Largest in Array",
        "Find Median from Data Stream (Two Heaps)",
        "Merge K Sorted Lists using Min-Heap",
        "Greedy Interval Scheduling & Non-overlapping Intervals",
        "Task Scheduler with Cool-down Periods"
      ]
    },
    {
      id: "graphs_dsu",
      moduleNum: "06",
      title: "Graphs, BFS/DFS & Disjoint Sets",
      icon: "🕸️",
      status: "coming_soon",
      modulesCount: 16,
      problemsCount: 36,
      desc: "Adjacency matrix/list, Kahn's Topological Sort, Dijkstra shortest path, Bellman-Ford, Disjoint Set Union (DSU) by rank & path compression.",
      tags: ["Dijkstra", "BFS", "DFS", "DSU", "Topological Sort"],
      topics: [
        "BFS & DFS Graph Traversals & Cycle Detection",
        "Kahn's Algorithm for Topological Sort & Course Schedule",
        "Dijkstra's Shortest Path Algorithm (Priority Queue)",
        "Bellman-Ford Algorithm for Negative Weight Cycles",
        "Disjoint Set Union (DSU) with Path Compression & Union by Rank",
        "Bridges & Articulation Points (Tarjan's Algorithm)"
      ]
    },
    {
      id: "dp_mastery",
      moduleNum: "07",
      title: "Dynamic Programming (0 to Master)",
      icon: "🧩",
      status: "coming_soon",
      modulesCount: 22,
      problemsCount: 50,
      desc: "State definition, memoization vs tabulation, 1D DP, 2D Grid DP, 0/1 Knapsack, Longest Common Subsequence, and DP on Trees.",
      tags: ["Memoization", "Tabulation", "Knapsack", "Subsequences"],
      topics: [
        "State Space Definition & Recursion to Memoization & Tabulation",
        "1D DP: Climbing Stairs, House Robber, Coin Change",
        "2D Grid DP: Unique Paths, Minimum Path Sum",
        "0/1 Knapsack & Unbounded Knapsack Patterns",
        "Longest Common Subsequence (LCS) & Edit Distance",
        "Longest Increasing Subsequence (LIS) in O(N log N)",
        "Dynamic Programming on Trees & Bitmask DP"
      ]
    },
    {
      id: "trie_strings",
      moduleNum: "08",
      title: "Trie & String Pattern Matching",
      icon: "🔤",
      status: "coming_soon",
      modulesCount: 8,
      problemsCount: 20,
      desc: "Prefix Trees, Auto-complete engines, Word Search II, KMP string matching, and Rabin-Karp rolling hashes.",
      tags: ["Trie", "Prefix Tree", "KMP", "Strings"],
      topics: [
        "Trie Node Architecture, Insertion & Prefix Search",
        "Word Search II (Backtracking with Trie Pruning)",
        "Maximum XOR of Two Numbers in an Array",
        "KMP String Matching Algorithm (LPS Array)",
        "Rabin-Karp Rolling Hash Algorithm"
      ]
    },
    {
      id: "bit_math",
      moduleNum: "09",
      title: "Bit Manipulation & Mathematics",
      icon: "⚡",
      status: "coming_soon",
      modulesCount: 9,
      problemsCount: 22,
      desc: "Bitwise operators, two's complement, power sets, Sieve of Eratosthenes, and modular inverse.",
      tags: ["Bitwise", "XOR", "Math", "Number Theory"],
      topics: [
        "Bitwise Fundamentals: AND, OR, XOR, NOT, Bit Shifts",
        "Power of Two, Counting Set Bits (Brian Kernighan's Algorithm)",
        "Single Number I, II & III using XOR properties",
        "Subsets Generation using Bitmasking",
        "Sieve of Eratosthenes for Prime Factorization",
        "Modular Arithmetic & Fast Exponentiation (O(log N))"
      ]
    }
  ];

  // ============================================================================
  // MASTER DSA MODULES HUB
  // ============================================================================
  function renderModulesHub() {
    const totalTopics = COURSE_DATA.length;
    const completedCount = completedTopics.size;
    const llPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    mainContentArea.innerHTML = `
      <div class="roadmap-view-container">
        <div class="roadmap-header-hero">
          <div style="display:inline-flex; align-items:center; gap:0.4rem; background:var(--accent-yellow); color:#000; font-family:var(--font-mono); font-size:0.74rem; font-weight:900; padding:0.24rem 0.65rem; border:1.5px solid #000; box-shadow:2px 2px 0px #000; border-radius:4px; margin-bottom:0.85rem; text-transform:uppercase;">
            <span>📦</span> TASKMESH DSA • ${MASTER_ROADMAP.length} MODULES
          </div>
          <h1>TaskMesh DSA — Modules Hub</h1>
          <p>
            Pick an active DSA module below, learn pointers & memory diagrams, trace live nodes, solve coding challenges, or ask Messy AI anytime.
          </p>
        </div>

        <div class="roadmap-domains-grid">
          ${MASTER_ROADMAP.map(module => {
            const isActive = module.status === "active";
            return `
              <div class="roadmap-domain-card ${isActive ? "active-track" : ""}" style="cursor:pointer;" onclick="window.handleModuleCardClick('${module.id}')">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem;">
                    <span class="${isActive ? "module-badge-active" : "module-badge-coming-soon"}">
                      ${isActive ? "🟢 ACTIVE MODULE" : "🔒 COMING SOON"}
                    </span>
                    <span style="font-family:var(--font-mono); font-size:0.72rem; font-weight:900; color:var(--text-muted);">
                      MODULE ${module.moduleNum}
                    </span>
                  </div>

                  <div class="roadmap-card-title">
                    <span style="font-size:1.5rem;">${module.icon}</span>
                    <span>${escapeHtml(module.title)}</span>
                  </div>

                  <p class="roadmap-card-desc">${escapeHtml(module.desc)}</p>

                  <div class="roadmap-meta-chips">
                    <span class="roadmap-chip">📚 ${module.modulesCount} Units</span>
                    <span class="roadmap-chip">🎯 ${module.problemsCount} Problems</span>
                    ${module.tags.map(t => `<span class="roadmap-chip" style="color:var(--accent-yellow);">#${escapeHtml(t)}</span>`).join("")}
                  </div>

                  ${isActive ? `
                    <div style="margin:0.85rem 0;">
                      <div style="display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:0.72rem; font-weight:800; color:var(--text-muted); margin-bottom:0.3rem;">
                        <span>Learning Progress</span>
                        <span style="color:var(--accent-lime);">${llPct}% (${completedCount}/${totalTopics} Completed)</span>
                      </div>
                      <div class="diff-bar-track">
                        <div class="diff-bar-fill easy" style="width:${llPct}%;"></div>
                      </div>
                    </div>
                  ` : `
                    <div style="margin:0.85rem 0; padding:0.55rem 0.8rem; background:var(--bg-panel-elevated); border:1px solid var(--border-color); border-radius:4px; font-family:var(--font-mono); font-size:0.74rem; color:var(--text-muted);">
                      Status: Under active production with visualizers
                    </div>
                  `}
                </div>

                <div style="margin-top:0.85rem;">
                  ${isActive ? `
                    <button type="button" class="tactile-btn btn-yellow btn-full btn-lg" onclick="event.stopPropagation(); window.switchDsaModule('linked_list')">
                      ENTER MODULE 🚀
                    </button>
                  ` : `
                    <button type="button" class="tactile-btn btn-full btn-lg" onclick="event.stopPropagation(); window.previewComingSoonModule('${module.id}')">
                      Preview Syllabus (Coming Soon) 🔍
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  window.handleModuleCardClick = (moduleId) => {
    SoundFX.click();
    if (moduleId === "linked_list") window.switchDsaModule("linked_list");
    else window.previewComingSoonModule(moduleId);
  };

  window.switchDsaModule = (moduleId) => {
    if (moduleId === "linked_list") {
      if (comingSoonModal) comingSoonModal.classList.remove("active");
      switchTab("concept");
    }
  };

  window.previewComingSoonModule = (moduleId) => {
    const mod = MASTER_ROADMAP.find(m => m.id === moduleId);
    if (!mod) return;
    if (comingSoonModalTitle) comingSoonModalTitle.innerText = `Module ${mod.moduleNum}: ${mod.title}`;
    if (comingSoonModalDesc) comingSoonModalDesc.innerText = mod.desc;
    if (comingSoonTopicsList) {
      comingSoonTopicsList.innerHTML = (mod.topics || []).map(t => `
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="color:var(--accent-yellow); font-weight:900;">•</span>
          <span>${escapeHtml(t)}</span>
        </div>
      `).join("");
    }
    if (comingSoonModal) comingSoonModal.classList.add("active");
  };

  if (closeComingSoonModal) closeComingSoonModal.addEventListener("click", () => comingSoonModal?.classList.remove("active"));
  if (closeComingSoonBtn) closeComingSoonBtn.addEventListener("click", () => comingSoonModal?.classList.remove("active"));

  // ============================================================================
  // AUTHENTICATION & GATEKEEPER ENGINE (Compulsory Login • Zero Demo)
  // ============================================================================
  const COHORT_LEETCODE_HANDLES = {
    "2501640100454": "Kartik_kumar_29",
    "2501640100471": "KrishChaddha106",
    "2501640100254": "avan_tika2776",
    "2501640100447": "Kanika_Dwii",
    "2501640100481": "1729kshitij",
    "2501640100477": "KrishnaKumarGaur"
  };

  const COHORT_GENDERS = {
    "2501640100454": "male",
    "2501640100471": "male",
    "2501640100254": "female",
    "2501640100447": "female",
    "2501640100481": "male",
    "2501640100477": "male"
  };

  function getStudentFirstName(session = authSession) {
    const raw = String(session?.name || "").trim();
    if (!raw) return "Student";
    return raw.split(/\s+/)[0] || "Student";
  }

  function getStudentGender(session = authSession) {
    if (!session) return "male";
    const roll = String(session.roll || "").trim();
    const g = String(session.gender || COHORT_GENDERS[roll] || "male").toLowerCase();
    return g === "female" ? "female" : "male";
  }

  function getStudentHonorific() {
    return "ji";
  }

  function isCohortVerifiedUser(session = authSession) {
    if (!session) return false;
    const roll = String(session.roll || "").trim();
    return Boolean(
      session.rosterVerified === true ||
      (roll && Object.prototype.hasOwnProperty.call(COHORT_LEETCODE_HANDLES, roll))
    );
  }

  function showConceptLandingScreen() {
    if (conceptLandingScreen) {
      conceptLandingScreen.style.display = "block";
      conceptLandingScreen.scrollTop = 0;
    }
    if (authGatekeeperModal) authGatekeeperModal.style.display = "none";
  }

  function openAuthGatekeeperFromLanding() {
    if (conceptLandingScreen) conceptLandingScreen.style.display = "none";
    if (authGatekeeperModal) authGatekeeperModal.style.display = "flex";
    SoundFX.click();
  }

  async function checkAuthAndInitialize() {
    if (!authSession || !authSession.isLoggedIn) {
      showConceptLandingScreen();
      return false;
    }

    if (conceptLandingScreen) conceptLandingScreen.style.display = "none";
    if (authGatekeeperModal) authGatekeeperModal.style.display = "none";

    const verified = isCohortVerifiedUser(authSession);

    // Auto-link verified cohort LeetCode handle; keep LeetCode unlinked for unverified users
    if (verified) {
      if (!authSession.leetcodeUser && authSession.roll && COHORT_LEETCODE_HANDLES[authSession.roll]) {
        authSession.leetcodeUser = COHORT_LEETCODE_HANDLES[authSession.roll];
        localStorage.setItem(KEY_AUTH, JSON.stringify(authSession));
      }
    } else if (authSession.leetcodeUser) {
      authSession.leetcodeUser = "";
      localStorage.setItem(KEY_AUTH, JSON.stringify(authSession));
    }

    // Load local user data first so UI renders immediately
    loadUserData();
    updateProfileDisplay();
    updateThemeButton();
    updateCodeModeButtons();
    if (toneSelector) toneSelector.value = currentLang;
    if (sidebarModulesCount) sidebarModulesCount.innerText = `${COURSE_DATA.length} UNITS`;

    // Restore cross-device progress if Firebase CloudDB is active & user is roster-verified
    if (CloudDB && CloudDB.isCloudActive && verified) {
      try {
        const cloudProgress = await CloudDB.loadProgress(authSession.roll);
        if (cloudProgress) {
          (cloudProgress.completedTopics || []).forEach(t => completedTopics.add(t));
          (cloudProgress.solvedProblems || []).forEach(p => solvedProblems.add(p));
          (cloudProgress.bookmarkedProblems || []).forEach(b => bookmarkedProblems.add(b));
          localStorage.setItem(`${KEY_PROGRESS}_${authSession.roll}`, JSON.stringify(Array.from(completedTopics)));
          localStorage.setItem(`${KEY_SOLVED_PROBS}_${authSession.roll}`, JSON.stringify(Array.from(solvedProblems)));
          localStorage.setItem(`${KEY_BOOKMARKS}_${authSession.roll}`, JSON.stringify(Array.from(bookmarkedProblems)));
        }
      } catch (err) {
        console.warn("[CloudDB] Could not fetch remote progress:", err);
      }
    }

    syncCurrentUserLeaderboard();
    updateProgress();
    renderSidebar();
    switchTab(activeTab);

    // Auto-sync LeetCode live stats on startup only for verified cohort members
    if (verified && authSession.leetcodeUser && typeof syncLeetCodeLiveProfile === "function") {
      const cached = getLeetCodeLiveStats(authSession.leetcodeUser);
      if (!cached || !cached.isConnected) {
        syncLeetCodeLiveProfile(authSession.leetcodeUser).then(stats => {
          if (stats && stats.isConnected) {
            syncCurrentUserLeaderboard();
            updateProfileDisplay();
            if (activeTab === "analytics") renderAnalyticsView();
            else if (activeTab === "leaderboard") renderLeaderboardView();
          }
        }).catch(() => {});
      }
    }

    return true;
  }

  window.handleAuthLogin = () => {
    const name = authInputName ? authInputName.value.trim() : "";
    const roll = authInputRoll ? authInputRoll.value.trim() : "";
    const selectedGender = authInputGender ? authInputGender.value : "";
    const langTrack = authInputLangTrack ? authInputLangTrack.value : "cpp";
    const targetGoal = authInputTargetGoal ? authInputTargetGoal.value : "FAANG / Tier-1 SDE";
    const rawLc = authInputLeetCode ? authInputLeetCode.value.trim() : "";

    if (!name || !roll) {
      if (authErrorAlert) authErrorAlert.style.display = "block";
      SoundFX.error();
      return;
    }

    if (authErrorAlert) authErrorAlert.style.display = "none";

    const verified = Object.prototype.hasOwnProperty.call(COHORT_LEETCODE_HANDLES, roll);
    const leetcodeUser = verified
      ? (extractLeetCodeUsername(rawLc) || COHORT_LEETCODE_HANDLES[roll] || "")
      : "";
    const gender = (selectedGender === "female" || selectedGender === "male")
      ? selectedGender
      : (COHORT_GENDERS[roll] || "male");

    authSession = {
      name,
      roll,
      gender,
      langTrack,
      targetGoal,
      rosterVerified: verified,
      leetcodeUser,
      isLoggedIn: true,
      loggedInAt: new Date().toISOString()
    };

    localStorage.setItem(KEY_AUTH, JSON.stringify(authSession));
    currentCodeMode = langTrack;
    localStorage.setItem(KEY_CODE_MODE, currentCodeMode);
    SoundFX.success();
    checkAuthAndInitialize();
    if (!verified) {
      showNotification("Full platform access granted! Contact admin for verification, then you can connect your LeetCode.");
    }
  };

  window.handleGoogleAuth = async () => {
    if (CloudDB && CloudDB.isCloudActive && CloudDB.auth) {
      try {
        const user = await CloudDB.loginWithGoogle();
        if (user) {
          const googleName = user.displayName || "";
          const googleEmail = (user.email || "").toLowerCase().trim();
          const rosterRec = await CloudDB.getRosterRecordByEmail();
          let roll = (rosterRec && rosterRec.roll) ? String(rosterRec.roll).trim() : (localStorage.getItem(`myth_roll_by_email_${googleEmail}`) || "");
          if (!roll) {
            roll = prompt(`Google Sign-in Successful!\nWelcome, ${googleName}.\nPlease enter your Student Roll Number / ID to link your curriculum:`);
            if (roll) roll = roll.trim();
          }
          if (roll) {
            localStorage.setItem(`myth_roll_by_email_${googleEmail}`, roll);
            let verifiedRoster = null;
            let isRosterVerified = false;
            try {
              verifiedRoster = await CloudDB.verifyRosterClaim(roll);
              isRosterVerified = Boolean(verifiedRoster);
            } catch (claimErr) {
              // Full platform access still granted; only CloudDB roster sync & LeetCode stay locked
              verifiedRoster = null;
              isRosterVerified = false;
            }

            const existingProfile = isRosterVerified ? await CloudDB.loadUserProfile(roll) : null;
            const canonicalName = (verifiedRoster && verifiedRoster.name) || googleName || "Student";
            const canUseLeetCode = isRosterVerified || Object.prototype.hasOwnProperty.call(COHORT_LEETCODE_HANDLES, roll);
            const resolvedLeetCode = canUseLeetCode
              ? ((existingProfile && existingProfile.leetcodeUser) || (verifiedRoster && verifiedRoster.leetcodeUser) || COHORT_LEETCODE_HANDLES[roll] || "")
              : "";

            const resolvedGender = (existingProfile && existingProfile.gender)
              || COHORT_GENDERS[roll]
              || localStorage.getItem(`myth_gender_by_email_${googleEmail}`)
              || "male";

            authSession = {
              name: canonicalName,
              roll,
              gender: resolvedGender,
              uid: user.uid,
              email: googleEmail,
              authProvider: "google",
              rosterVerified: isRosterVerified,
              langTrack: (existingProfile && existingProfile.langTrack) || currentCodeMode || "cpp",
              targetGoal: (existingProfile && existingProfile.targetGoal) || "FAANG / Tier-1 SDE",
              leetcodeUser: resolvedLeetCode,
              isLoggedIn: true,
              loggedInAt: new Date().toISOString()
            };
            localStorage.setItem(KEY_AUTH, JSON.stringify(authSession));

            if (isRosterVerified) {
              await CloudDB.saveUserProfile(authSession);
              if (authSession.leetcodeUser) {
                syncLeetCodeLiveProfile(authSession.leetcodeUser).catch(() => {});
              }
            } else {
              showNotification("Full platform access granted! Contact admin for verification, then you can connect your LeetCode.");
            }

            SoundFX.success();
            checkAuthAndInitialize();
            return;
          }
        }
      } catch (err) {
        console.warn("[CloudDB] Firebase popup auth error:", err);
        if (err && err.code && err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
          showNotification(`Google Sign-in error: ${err.message || err.code}`);
        }
        return;
      }
    }
    const googleAuthModal = document.getElementById("googleAuthModal");
    if (googleAuthModal) googleAuthModal.classList.add("active");
  };

  const closeGoogleAuthModal = document.getElementById("closeGoogleAuthModal");
  if (closeGoogleAuthModal) {
    closeGoogleAuthModal.addEventListener("click", () => {
      document.getElementById("googleAuthModal")?.classList.remove("active");
    });
  }

  window.submitDirectGoogleAuth = async () => {
    const nameInput = document.getElementById("googleInputName");
    const emailInput = document.getElementById("googleInputEmail");
    const rollInput = document.getElementById("googleInputRoll");
    const genderInput = document.getElementById("googleInputGender");
    const lcInput = document.getElementById("googleInputLeetCode");

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const roll = rollInput ? rollInput.value.trim() : "";
    const selectedGender = genderInput ? genderInput.value : "";
    const rawLc = lcInput ? lcInput.value.trim() : "";

    if (!name || !roll || !email) {
      alert("Please enter Name, Email and Student Roll Number to proceed.");
      return;
    }

    const verified = Object.prototype.hasOwnProperty.call(COHORT_LEETCODE_HANDLES, roll);
    const leetcodeUser = verified
      ? (extractLeetCodeUsername(rawLc) || COHORT_LEETCODE_HANDLES[roll] || "")
      : "";
    const gender = (selectedGender === "female" || selectedGender === "male")
      ? selectedGender
      : (COHORT_GENDERS[roll] || "male");

    authSession = {
      name,
      roll,
      gender,
      email,
      authProvider: "google",
      rosterVerified: verified,
      langTrack: currentCodeMode || "cpp",
      targetGoal: "FAANG / Tier-1 SDE",
      leetcodeUser,
      isLoggedIn: true,
      loggedInAt: new Date().toISOString()
    };

    localStorage.setItem(KEY_AUTH, JSON.stringify(authSession));
    if (CloudDB && CloudDB.isCloudActive && verified) {
      await CloudDB.saveUserProfile(authSession);
    }

    document.getElementById("googleAuthModal")?.classList.remove("active");
    SoundFX.success();
    checkAuthAndInitialize();
    if (!verified) {
      showNotification("Full platform access granted! Contact admin for verification, then you can connect your LeetCode.");
    }
  };

  async function logoutUser() {
    localStorage.removeItem(KEY_AUTH);
    authSession = null;
    completedTopics.clear();
    solvedProblems.clear();
    bookmarkedProblems.clear();
    if (CloudDB) {
      try { await CloudDB.logout(); } catch (e) {}
    }
    if (profileModal) profileModal.classList.remove("active");
    closeKavishAI();
    if (authInputName) authInputName.value = "";
    if (authInputRoll) authInputRoll.value = "";
    if (authInputLeetCode) authInputLeetCode.value = "";
    showConceptLandingScreen();
  }

  function loadUserData() {
    if (!authSession) return;
    const roll = authSession.roll;
    try {
      completedTopics = new Set(JSON.parse(localStorage.getItem(`${KEY_PROGRESS}_${roll}`) || "[]"));
      solvedProblems = new Set(JSON.parse(localStorage.getItem(`${KEY_SOLVED_PROBS}_${roll}`) || "[]"));
      bookmarkedProblems = new Set(JSON.parse(localStorage.getItem(`${KEY_BOOKMARKS}_${roll}`) || "[]"));
    } catch (e) {
      completedTopics = new Set();
      solvedProblems = new Set();
      bookmarkedProblems = new Set();
    }
  }

  function updateProfileDisplay() {
    if (!authSession) return;
    if (topbarProfileName) topbarProfileName.innerText = authSession.name;
    if (topbarProfileAvatar) topbarProfileAvatar.innerText = authSession.name.charAt(0).toUpperCase();

    const modalProfileAvatar = document.getElementById("modalProfileAvatar");
    const modalProfileName = document.getElementById("modalProfileName");
    const modalProfileRoll = document.getElementById("modalProfileRoll");
    const modalProfileTrack = document.getElementById("modalProfileTrack");
    const modalProfileTarget = document.getElementById("modalProfileTarget");
    const modalGoogleBadge = document.getElementById("modalGoogleBadge");
    const modalInputLeetCode = document.getElementById("modalInputLeetCode");
    const modalLeetCodeStatus = document.getElementById("modalLeetCodeStatus");
    const modalMascotAvatarMount = document.getElementById("modalMascotAvatarMount");
    const modalMascotTitle = document.getElementById("modalMascotTitle");

    if (modalProfileAvatar) modalProfileAvatar.innerText = authSession.name.charAt(0).toUpperCase();
    if (modalProfileName) modalProfileName.innerText = authSession.name;
    if (modalProfileRoll) modalProfileRoll.innerText = `Roll: ${authSession.roll}`;
    if (modalProfileTrack) modalProfileTrack.innerText = (currentCodeMode || authSession.langTrack || "cpp").toUpperCase();
    if (modalProfileTarget) modalProfileTarget.innerText = authSession.targetGoal || "FAANG Placements";
    const modalGenderSelect = document.getElementById("modalGenderSelect");
    if (modalGenderSelect) {
      modalGenderSelect.value = getStudentGender(authSession);
    }
    if (modalGoogleBadge) {
      modalGoogleBadge.style.display = (authSession.authProvider === "google") ? "inline-flex" : "none";
    }
    const verifiedForLc = isCohortVerifiedUser(authSession);
    const modalLeetCodeSyncBtn = document.getElementById("profileLeetCodeSyncBtn");
    const modalLeetCodeVerifyNotice = document.getElementById("modalLeetCodeVerifyNotice");
    if (modalInputLeetCode) {
      modalInputLeetCode.value = verifiedForLc ? (authSession.leetcodeUser || "") : "";
      modalInputLeetCode.disabled = !verifiedForLc;
      modalInputLeetCode.placeholder = verifiedForLc ? "Username or LeetCode URL" : "Admin verification required";
    }
    if (modalLeetCodeSyncBtn) {
      modalLeetCodeSyncBtn.disabled = !verifiedForLc;
      modalLeetCodeSyncBtn.title = verifiedForLc ? "Sync LeetCode Account" : "Contact admin for verification, then you can connect your LeetCode.";
    }
    if (modalLeetCodeVerifyNotice) {
      modalLeetCodeVerifyNotice.style.display = verifiedForLc ? "none" : "block";
    }
    if (modalLeetCodeStatus) {
      if (!verifiedForLc) {
        modalLeetCodeStatus.innerText = "🔒 Verification Required";
        modalLeetCodeStatus.style.color = "var(--accent-yellow)";
      } else if (authSession.leetcodeUser) {
        modalLeetCodeStatus.innerText = `🟢 @${authSession.leetcodeUser}`;
        modalLeetCodeStatus.style.color = "var(--accent-lime)";
      } else {
        modalLeetCodeStatus.innerText = "⚪ Not Linked";
        modalLeetCodeStatus.style.color = "var(--text-muted)";
      }
    }

    if (mascotEngineInstance) {
      const eq = mascotEngineInstance.getEquipped(authSession.roll);
      const ch = mascotEngineInstance.getCharacter(eq.charId);
      if (modalMascotAvatarMount) modalMascotAvatarMount.innerHTML = mascotEngineInstance.renderSvg(eq.charId, eq.colorHex, 44, true);
      if (modalMascotTitle) modalMascotTitle.innerText = `${ch.name} (${ch.badge})`;
    }
  }

  // ============================================================================
  // LEADERBOARD ENGINE (Realtime Multi-Student Ranking & 80/20 Scoring)
  // ============================================================================
  function getLeaderboardRegistry() {
    const data = localStorage.getItem(KEY_LEADERBOARD);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      // Deduplicate: same person may have multiple entries from different auth
      // Identify by normalized name; keep the entry with the highest composite score
      const dedupMap = new Map();
      for (const entry of parsed) {
        const nameKey = (entry.name || "").trim().toLowerCase();
        if (!nameKey) continue;
        const existing = dedupMap.get(nameKey);
        if (!existing) {
          dedupMap.set(nameKey, entry);
        } else {
          // Merge: keep the one with higher score; copy roll/LC if the winner is missing them
          const winner = (entry.score || 0) >= (existing.score || 0) ? entry : existing;
          const loser = winner === entry ? existing : entry;
          // Prefer the record that has a roll number
          if (!winner.roll && loser.roll) winner.roll = loser.roll;
          // Prefer the record that has a LeetCode handle
          if (!winner.leetcodeUser && loser.leetcodeUser) winner.leetcodeUser = loser.leetcodeUser;
          // Prefer higher streak
          if ((loser.streak || 0) > (winner.streak || 0)) winner.streak = loser.streak;
          dedupMap.set(nameKey, winner);
        }
      }

      return Array.from(dedupMap.values());
    } catch (e) {
      return [];
    }
  }

  function computeCohortStats(registry) {
    if (!registry || !Array.isArray(registry) || registry.length === 0) {
      return { totalAccepted: 0, totalAttempts: 0, avgAcceptance: 100, totalStudents: 0 };
    }
    let totalAccepted = 0;
    let totalAttempts = 0;
    registry.forEach(u => {
      const acc = u.acceptedSubmissions !== undefined ? u.acceptedSubmissions : ((u.mythEasy || 0) + (u.mythMedium || 0) + (u.mythHard || 0));
      const att = u.totalAttempts !== undefined ? u.totalAttempts : Math.max(acc, 0);
      totalAccepted += acc;
      totalAttempts += att;
    });
    const avgAcceptance = totalAttempts > 0 ? Math.round((totalAccepted / totalAttempts) * 100) : 100;
    return { totalAccepted, totalAttempts, avgAcceptance, totalStudents: registry.length };
  }

  function calculateUserScore() {
    let easyCount = 0;
    let medCount = 0;
    let hardCount = 0;

    solvedProblems.forEach(probId => {
      COURSE_DATA.forEach(topic => {
        const found = (topic.problems || []).find(p => p.id === probId);
        if (found) {
          if (found.difficulty === "Easy") easyCount++;
          else if (found.difficulty === "Medium") medCount++;
          else if (found.difficulty === "Hard") hardCount++;
        }
      });
    });

    const topicBonus = completedTopics.size * 40;
    const totalScore = (easyCount * 10) + (medCount * 25) + (hardCount * 50) + topicBonus;
    return { easyCount, medCount, hardCount, totalScore };
  }

  function syncCurrentUserLeaderboard() {
    if (!authSession) return;
    const stats = calculateUserScore();
    const registry = getLeaderboardRegistry();
    const totals = getCurriculumProblemTotals();

    const userAttemptsKey = `${KEY_ATTEMPTS}_${authSession.roll}`;
    let userAttempts = parseInt(localStorage.getItem(userAttemptsKey) || "0", 10);
    const totalSolved = solvedProblems.size;
    if (userAttempts < totalSolved) {
      userAttempts = totalSolved;
      localStorage.setItem(userAttemptsKey, String(userAttempts));
    }
    const userAccuracy = userAttempts > 0 ? Math.round((totalSolved / userAttempts) * 100) : 100;

    const lcUser = authSession.leetcodeUser || "";
    const lcStats = lcUser ? getLeetCodeLiveStats(lcUser) : null;
    const isLcConnected = Boolean(lcStats && lcStats.isConnected);

    const lcSolved = isLcConnected ? (lcStats.totalSolved || 0) : 0;
    const lcEasy = isLcConnected ? (lcStats.easySolved || 0) : 0;
    const lcMedium = isLcConnected ? (lcStats.mediumSolved || 0) : 0;
    const lcHard = isLcConnected ? (lcStats.hardSolved || 0) : 0;
    const lcPoints = (lcEasy * 10) + (lcMedium * 25) + (lcHard * 50);

    const compositeResult = calculateCompositePoints(
      { easy: lcEasy, medium: lcMedium, hard: lcHard },
      { easy: stats.easyCount, medium: stats.medCount, hard: stats.hardCount, completedTopics: completedTopics.size }
    );
    const compositeScore = compositeResult.compositeScore;
    const mythPoints = compositeResult.mythPoints;

    const historyKey = `myth_activity_history_${authSession.roll}`;
    let rawHistory = [];
    try {
      rawHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
    } catch (e) {
      rawHistory = [];
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    if (!rawHistory.includes(todayStr) && totalSolved > 0) {
      rawHistory.push(todayStr);
      try { localStorage.setItem(historyKey, JSON.stringify(rawHistory)); } catch (e) {}
    }
    let calculatedStreak = calculateConsecutiveStreak(rawHistory);
    if (isLcConnected && lcStats && lcStats.streak) {
      calculatedStreak = Math.max(calculatedStreak, lcStats.streak);
    }

    const nameNorm = (authSession.name || "").trim().toLowerCase();
    const existingIdx = registry.findIndex(u =>
      u.roll === authSession.roll ||
      (nameNorm && (u.name || "").trim().toLowerCase() === nameNorm)
    );
    const currentUserRecord = {
      name: authSession.name,
      roll: authSession.roll,
      track: currentCodeMode || authSession.langTrack || "cpp",
      leetcodeUser: lcUser,
      authProvider: authSession.authProvider || "credentials",
      lcSolved,
      lcEasy,
      lcMedium,
      lcHard,
      lcPoints,
      mythSolved: totalSolved,
      mythEasy: stats.easyCount,
      mythMedium: stats.medCount,
      mythHard: stats.hardCount,
      mythPoints,
      platformSolved: totalSolved,
      score: compositeScore,
      compositePoints: compositeScore,
      acceptedSubmissions: totalSolved,
      totalAttempts: userAttempts,
      streak: calculatedStreak,
      accuracy: userAccuracy
    };

    if (existingIdx >= 0) registry[existingIdx] = currentUserRecord;
    else registry.push(currentUserRecord);

    registry.sort((a, b) => (b.score - a.score) || (b.accuracy - a.accuracy));
    localStorage.setItem(KEY_LEADERBOARD, JSON.stringify(registry));

    if (CloudDB && CloudDB.isCloudActive && authSession.rosterVerified) {
      CloudDB.syncLeaderboardRecord(currentUserRecord);
      CloudDB.syncProgress(authSession.roll, {
        completedTopics: Array.from(completedTopics),
        solvedProblems: Array.from(solvedProblems),
        bookmarkedProblems: Array.from(bookmarkedProblems)
      });
    }

    const rank = registry.findIndex(u => u.roll === authSession.roll) + 1;
    const modalStatSolved = document.getElementById("modalStatSolved");
    const modalStatPoints = document.getElementById("modalStatPoints");
    const modalStatRank = document.getElementById("modalStatRank");
    const modalStatAcceptance = document.getElementById("modalStatAcceptance");
    if (modalStatSolved) modalStatSolved.innerText = `${solvedProblems.size}/${totals.total}`;
    if (modalStatPoints) modalStatPoints.innerText = compositeScore;
    if (modalStatRank) modalStatRank.innerText = `#${rank > 0 ? rank : 1}`;
    if (modalStatAcceptance) modalStatAcceptance.innerText = `${userAccuracy}%`;
  }

  function renderLeaderboardView() {
    syncCurrentUserLeaderboard();
    const registry = getLeaderboardRegistry();
    const cohortStats = computeCohortStats(registry);
    const totals = getCurriculumProblemTotals();

    const top1 = registry[0] || null;
    const top2 = registry[1] || null;
    const top3 = registry[2] || null;

    mainContentArea.innerHTML = `
      <div class="leaderboard-view-container">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; background:var(--bg-surface); border:var(--border-thick); border-radius:var(--radius-boxy); padding:0.75rem 1.1rem; box-shadow:var(--shadow-tactile);">
          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; font-family:var(--font-mono); font-size:0.78rem; font-weight:900; color:var(--text-main);">
            <span style="color:#f89f1b;">⚖️</span>
            <span>HYBRID RANKING FORMULA:</span>
            <span style="color:var(--accent-yellow);">80% LeetCode Solved</span> + 
            <span style="color:var(--accent-lime);">20% MYTH Platform Mastery</span>
          </div>
          <span style="font-family:var(--font-mono); font-size:0.72rem; color:var(--text-muted);">
            Rank points = round(0.80 × LC_Pts + 0.20 × MYTH_Pts)
          </span>
        </div>

        <div class="leaderboard-podium-row">
          <div class="podium-card rank-2" style="${!top2 ? "opacity:0.6; border-style:dashed;" : ""}">
            <div class="podium-trophy-badge">🥈</div>
            ${top2 && mascotEngineInstance ? `<div style="display:flex; justify-content:center; margin-bottom:0.35rem;">${mascotEngineInstance.renderSvg(mascotEngineInstance.getEquipped(top2.roll).charId, mascotEngineInstance.getEquipped(top2.roll).colorHex, 48, true)}</div>` : ""}
            <div class="podium-student-name">${top2 ? escapeHtml(top2.name) : "Open Rank #2"}</div>
            <div class="podium-student-roll">${top2 ? `Roll: ${escapeHtml(top2.roll)} • ${(top2.track || "cpp").toUpperCase()}` : "Awaiting Peer"}</div>
            <div class="podium-score-pill">
              ${top2 ? `${top2.score ?? 0} PTS (LC: ${top2.lcSolved ?? 0} • MYTH: ${top2.mythSolved ?? 0}/${totals.total})` : "0 PTS"}
            </div>
          </div>

          <div class="podium-card rank-1" style="${!top1 ? "opacity:0.6; border-style:dashed;" : ""}">
            <div class="podium-trophy-badge">👑</div>
            ${top1 && mascotEngineInstance ? `<div style="display:flex; justify-content:center; margin-bottom:0.35rem;">${mascotEngineInstance.renderSvg(mascotEngineInstance.getEquipped(top1.roll).charId, mascotEngineInstance.getEquipped(top1.roll).colorHex, 54, true)}</div>` : ""}
            <div class="podium-student-name">${top1 ? escapeHtml(top1.name) : "Open Rank #1"}</div>
            <div class="podium-student-roll">${top1 ? `Roll: ${escapeHtml(top1.roll)} • ${(top1.track || "cpp").toUpperCase()}` : "Solve problems to claim"}</div>
            <div class="podium-score-pill" style="background:var(--accent-yellow);">
              ${top1 ? `${top1.score ?? 0} PTS (LC: ${top1.lcSolved ?? 0} • MYTH: ${top1.mythSolved ?? 0}/${totals.total})` : "0 PTS"}
            </div>
          </div>

          <div class="podium-card rank-3" style="${!top3 ? "opacity:0.6; border-style:dashed;" : ""}">
            <div class="podium-trophy-badge">🥉</div>
            ${top3 && mascotEngineInstance ? `<div style="display:flex; justify-content:center; margin-bottom:0.35rem;">${mascotEngineInstance.renderSvg(mascotEngineInstance.getEquipped(top3.roll).charId, mascotEngineInstance.getEquipped(top3.roll).colorHex, 48, true)}</div>` : ""}
            <div class="podium-student-name">${top3 ? escapeHtml(top3.name) : "Open Rank #3"}</div>
            <div class="podium-student-roll">${top3 ? `Roll: ${escapeHtml(top3.roll)} • ${(top3.track || "cpp").toUpperCase()}` : "Awaiting Peer"}</div>
            <div class="podium-score-pill">
              ${top3 ? `${top3.score ?? 0} PTS (LC: ${top3.lcSolved ?? 0} • MYTH: ${top3.mythSolved ?? 0}/${totals.total})` : "0 PTS"}
            </div>
          </div>
        </div>

        <div class="leaderboard-table-card">
          <div class="leaderboard-table-controls">
            <div>
              <h2 style="font-size:1.2rem; font-weight:900; color:var(--text-main);">Live Student Hall of Fame</h2>
              <p style="font-size:0.8rem; color:var(--text-muted); font-family:var(--font-mono);">
                Ranked across ${cohortStats.totalStudents} student${cohortStats.totalStudents === 1 ? "" : "s"} • Cohort Acceptance Avg: <strong style="color:var(--accent-lime);">${cohortStats.avgAcceptance}%</strong>
              </p>
            </div>
            <input 
              type="text" 
              id="leaderboardFilterInput" 
              class="leaderboard-search-input" 
              placeholder="Filter by student name or roll..."
              oninput="window.filterLeaderboardTable(this.value)"
            >
          </div>

          <div class="leaderboard-table-wrapper">
            <table class="table-brutalist">
              <thead>
                <tr>
                  <th style="width:72px;">Rank</th>
                  <th>Student Name</th>
                  <th>Roll / ID</th>
                  <th>Track</th>
                  <th>LeetCode (80%)</th>
                  <th>MYTH (${totals.total})</th>
                  <th>Acceptance</th>
                  <th>Streak</th>
                  <th>Score</th>
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody id="leaderboardTableBody">
                ${renderLeaderboardRows(registry, cohortStats, "", totals.total)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  window.filterLeaderboardTable = (query) => {
    const tbody = document.getElementById("leaderboardTableBody");
    if (!tbody) return;
    const registry = getLeaderboardRegistry();
    const cohortStats = computeCohortStats(registry);
    const totals = getCurriculumProblemTotals();
    tbody.innerHTML = renderLeaderboardRows(registry, cohortStats, query, totals.total);
  };

  function renderLeaderboardRows(registry, cohortStats, query = "", totalProblems = 42) {
    const q = query.toLowerCase().trim();
    const ranked = registry.map((u, i) => ({ ...u, _rank: i + 1 }));
    const filtered = ranked.filter(u =>
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.roll && u.roll.toLowerCase().includes(q))
    );

    if (filtered.length === 0) {
      return `<tr><td colspan="10" style="text-align:center; padding:2rem; font-family:var(--font-mono); font-size:0.84rem; color:var(--text-muted);">No matching student records found.</td></tr>`;
    }

    const avgCohort = cohortStats && cohortStats.avgAcceptance ? cohortStats.avgAcceptance : 85;

    return filtered.map(user => {
      const isCurrentUser = Boolean(
        authSession && (
          (user.roll && authSession.roll && user.roll === authSession.roll) ||
          (user.uid && authSession.uid && user.uid === authSession.uid)
        )
      );
      const rankNum = user._rank;

      let rankBadge = `#${rankNum}`;
      if (rankNum === 1) rankBadge = "🥇 1st";
      else if (rankNum === 2) rankBadge = "🥈 2nd";
      else if (rankNum === 3) rankBadge = "🥉 3rd";

      const score = user.score ?? user.compositePoints ?? 0;
      let tierTag = "🛡️ Apprentice";
      if (score >= 1200) tierTag = "👑 Grandmaster";
      else if (score >= 700) tierTag = "⚔️ Specialist";

      const accuracy = user.accuracy !== undefined ? user.accuracy : 100;
      const isAboveAvg = accuracy >= avgCohort;

      const lcSolved = user.lcSolved ?? 0;
      const lcEasy = user.lcEasy ?? 0;
      const lcMedium = user.lcMedium ?? 0;
      const lcHard = user.lcHard ?? 0;

      const mythSolved = user.mythSolved ?? user.acceptedSubmissions ?? 0;
      const mythPoints = user.mythPoints ?? 0;

      return `
        <tr class="${isCurrentUser ? "current-user-row" : ""}">
          <td class="rank-badge-cell" style="${rankNum <= 3 ? "color:var(--accent-yellow);" : ""}">${rankBadge}</td>
          <td>
            <div style="display:flex; align-items:center; gap:0.55rem;">
              ${mascotEngineInstance ? `<div style="width:28px; height:28px; flex-shrink:0;">${mascotEngineInstance.renderSvg(mascotEngineInstance.getEquipped(user.roll).charId, mascotEngineInstance.getEquipped(user.roll).colorHex, 28, false)}</div>` : ""}
              <div>
                <span style="font-weight:900;">${escapeHtml(user.name)}</span>
                ${isCurrentUser ? `<span class="you-sticker-tag">YOU</span>` : ""}
                ${user.authProvider === "google" ? `<span class="google-verified-badge" style="font-size:0.65rem;">Google</span>` : ""}
                ${user.leetcodeUser ? `
                  <a href="https://leetcode.com/u/${encodeURIComponent(user.leetcodeUser)}/" target="_blank" rel="noopener noreferrer" style="font-family:var(--font-mono); font-size:0.68rem; color:var(--accent-yellow); margin-left:0.35rem; text-decoration:none; background:var(--bg-panel-elevated); padding:0.12rem 0.4rem; border-radius:3px; border:1px solid var(--border-color); display:inline-block;" title="View Live LeetCode Profile">
                    @${escapeHtml(user.leetcodeUser)} ↗
                  </a>` : ""}
              </div>
            </div>
          </td>
          <td style="font-family:var(--font-mono); font-size:0.78rem; color:var(--text-muted);">${escapeHtml(user.roll || "--")}</td>
          <td>
            <span style="font-family:var(--font-mono); font-size:0.74rem; font-weight:800; background:var(--bg-panel-elevated); padding:0.18rem 0.45rem; border:1px solid var(--border-color); border-radius:3px;">
              ${(user.track || "cpp").toUpperCase()}
            </span>
          </td>
          <td style="font-family:var(--font-mono); font-size:0.8rem;">
            <strong style="color:var(--text-main);">${lcSolved} Solved</strong>
            <span style="color:var(--text-muted); font-size:0.7rem; display:block;">
              (<span style="color:var(--accent-emerald);">${lcEasy}E</span> • 
              <span style="color:var(--accent-yellow);">${lcMedium}M</span> • 
              <span style="color:var(--accent-crimson);">${lcHard}H</span>)
            </span>
          </td>
          <td style="font-family:var(--font-mono); font-size:0.8rem;">
            <strong style="color:var(--accent-lime);">${mythSolved}/${totalProblems}</strong>
            <span style="color:var(--text-muted); font-size:0.7rem; display:block;">
              ${mythPoints} pts
            </span>
          </td>
          <td style="font-family:var(--font-mono); font-size:0.8rem;">
            <strong style="color:${isAboveAvg ? "var(--accent-emerald)" : "var(--accent-yellow)"};">${accuracy}%</strong>
          </td>
          <td style="font-family:var(--font-mono); font-weight:800; color:var(--accent-yellow);">🔥 ${user.streak ?? 0}d</td>
          <td style="font-family:var(--font-mono);">
            <div style="font-size:1rem; font-weight:900; color:var(--accent-yellow);">${score}</div>
          </td>
          <td>
            <span style="font-family:var(--font-mono); font-size:0.74rem; font-weight:800; color:var(--accent-lime); white-space:nowrap;">${tierTag}</span>
          </td>
        </tr>
      `;
    }).join("");
  }

  // ============================================================================
  // PERFORMANCE ANALYTICS VIEW
  // ============================================================================
  function renderAnalyticsView() {
    syncCurrentUserLeaderboard();
    const registry = getLeaderboardRegistry();
    const cohortStats = computeCohortStats(registry);
    const currentUserRecord = (authSession && registry.find(u => u.roll === authSession.roll)) || {};
    const currentUserRank = authSession ? Math.max(1, registry.findIndex(u => u.roll === authSession.roll) + 1) : 1;
    const userAccuracy = currentUserRecord.accuracy !== undefined ? currentUserRecord.accuracy : 100;
    const lcUser = (authSession && authSession.leetcodeUser) ? authSession.leetcodeUser : "";
    const lcStats = lcUser ? getLeetCodeLiveStats(lcUser) : null;
    const isLcConnected = Boolean(lcStats && lcStats.isConnected);

    const stats = calculateUserScore();
    const totals = getCurriculumProblemTotals();
    const totalPossible = totals.total;
    const easyTotal = totals.easy;
    const medTotal = totals.medium;
    const hardTotal = totals.hard;

    const easyPct = Math.round((stats.easyCount / easyTotal) * 100);
    const medPct = Math.round((stats.medCount / medTotal) * 100);
    const hardPct = Math.round((stats.hardCount / hardTotal) * 100);
    const overallPct = Math.round((solvedProblems.size / totalPossible) * 100);

    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (overallPct / 100) * circumference;
    const today = new Date();

    // Graph 1: MYTH 16-week activity matrix (112 cells)
    let mythHeatmapCellsHtml = "";
    let mythTotalSubmissions = 0;
    let mythActiveDays = 0;
    const actKey = authSession ? `${KEY_ACTIVITY}_${authSession.roll}` : KEY_ACTIVITY;
    const activityMap = JSON.parse(localStorage.getItem(actKey) || "{}");

    for (let i = 111; i >= 0; i--) {
      const cellDate = new Date(today);
      cellDate.setDate(today.getDate() - i);
      const key = cellDate.toISOString().split("T")[0];
      const dateStr = cellDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      let count = activityMap[key] || 0;
      if (i === 0 && count === 0 && solvedProblems.size > 0) count = solvedProblems.size;

      if (count > 0) {
        mythActiveDays++;
        mythTotalSubmissions += count;
      }

      let level = 0;
      if (count >= 4) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      mythHeatmapCellsHtml += `<div class="heatmap-cell level-${level}" title="${count} MYTH event${count === 1 ? "" : "s"} on ${dateStr}"></div>`;
    }

    // Graph 2: LeetCode 365-day monthly submission calendar (LeetCode-style separated month blocks)
    let lcTotalYearSubmissions = 0;
    let lcActiveDaysCount = 0;
    const calObj = (isLcConnected && lcStats.submissionCalendar) ? lcStats.submissionCalendar : {};
    const dateToCountMap = {};

    Object.keys(calObj).forEach(ts => {
      try {
        const d = new Date(parseInt(ts, 10) * 1000);
        const key = d.toISOString().split("T")[0];
        const val = typeof calObj[ts] === "number" ? calObj[ts] : parseInt(calObj[ts] || "1", 10);
        dateToCountMap[key] = (dateToCountMap[key] || 0) + val;
      } catch (err) {}
    });

    const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const startUtc = new Date(todayUtc);
    startUtc.setUTCDate(todayUtc.getUTCDate() - 364);

    const monthGroups = [];
    for (let d = new Date(startUtc); d <= todayUtc; d.setUTCDate(d.getUTCDate() + 1)) {
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth();
      const ymKey = `${y}-${String(m + 1).padStart(2, "0")}`;
      let group = monthGroups[monthGroups.length - 1];
      if (!group || group.ymKey !== ymKey) {
        group = {
          ymKey,
          label: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
          firstDayOfWeek: d.getUTCDay(),
          days: []
        };
        monthGroups.push(group);
      }

      const key = d.toISOString().split("T")[0];
      const dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
      });
      const count = dateToCountMap[key] || 0;

      if (count > 0) {
        lcActiveDaysCount++;
        lcTotalYearSubmissions += count;
      }

      let level = 0;
      if (count >= 6) level = 4;
      else if (count >= 4) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      group.days.push(`<div class="leetcode-cell lc-level-${level}" title="${count} LeetCode submission${count === 1 ? "" : "s"} on ${dateStr}"></div>`);
    }

    const lcMonthlyBlocksHtml = monthGroups.map(group => {
      const spacers = `<div class="leetcode-cell-spacer" aria-hidden="true"></div>`.repeat(group.firstDayOfWeek);
      const showLabel = group.days.length >= 10;
      return `
        <div class="leetcode-month-block">
          <div class="leetcode-month-grid">${spacers}${group.days.join("")}</div>
          <span class="leetcode-month-label">${showLabel ? escapeHtml(group.label) : ""}</span>
        </div>
      `;
    }).join("");

    mainContentArea.innerHTML = `
      <div class="analytics-view-container">
        <div class="analytics-top-banner">
          <div class="analytics-banner-profile">
            <div class="analytics-user-avatar">${escapeHtml(authSession ? authSession.name.charAt(0).toUpperCase() : "S")}</div>
            <div class="analytics-user-meta">
              <div class="analytics-name-row">
                <h1 class="analytics-user-name">${escapeHtml(authSession ? authSession.name : "Student Profile")}</h1>
                <span class="status-tag tag-verified">STUDENT SESSION</span>
                ${authSession && authSession.authProvider === "google" ? `<span class="google-verified-badge">Google Verified ✓</span>` : ""}
              </div>
              <div class="analytics-roll-sub">
                <span>Roll: ${escapeHtml(authSession ? authSession.roll : "--")}</span>
                <span>• Track: ${(currentCodeMode || "cpp").toUpperCase()}</span>
                <span>• Milestone: ${escapeHtml(authSession ? authSession.targetGoal : "FAANG SDE")}</span>
                ${lcUser ? `<span style="color:var(--accent-yellow);">• LC: @${escapeHtml(lcUser)}</span>` : `<span>• LC: Not Connected</span>`}
              </div>
            </div>
          </div>

          <div class="analytics-stat-chips-row">
            <div class="stat-metric-badge">
              <span class="metric-label">Units Done</span>
              <span class="metric-value">${completedTopics.size}/${COURSE_DATA.length}</span>
            </div>
            <div class="stat-metric-badge">
              <span class="metric-label">MYTH Solved</span>
              <span class="metric-value">${solvedProblems.size}/${totalPossible}</span>
            </div>
            <div class="stat-metric-badge">
              <span class="metric-label">Accuracy</span>
              <span class="metric-value" style="color:var(--accent-emerald);">${userAccuracy}%</span>
            </div>
            <div class="stat-metric-badge">
              <span class="metric-label">Rank</span>
              <span class="metric-value" style="color:var(--accent-yellow);">#${currentUserRank}</span>
            </div>
          </div>
        </div>

        <div class="heatmap-widget-card">
          <div class="heatmap-header-row">
            <div>
              <span class="heatmap-title-chip">⚡ MYTH PLATFORM ACTIVITY MATRIX (16 WEEKS)</span>
              <span class="heatmap-subtitle-text">Verified problem solves & platform activity logged per calendar day</span>
            </div>
            <div style="display:flex; gap:0.5rem; font-family:var(--font-mono); font-size:0.74rem;">
              <span class="status-tag" style="background:var(--bg-panel-elevated); border:1px solid var(--border-color); color:var(--accent-lime);">
                ${mythTotalSubmissions} Activity Events
              </span>
              <span class="status-tag" style="background:var(--bg-panel-elevated); border:1px solid var(--border-color); color:var(--accent-yellow);">
                ${mythActiveDays} Active Days
              </span>
            </div>
          </div>

          <div class="heatmap-calendar-scroll">
            <div class="heatmap-grid">${mythHeatmapCellsHtml}</div>
          </div>

          <div class="heatmap-legend-row">
            <span>Less</span>
            <span class="heatmap-legend-cell" style="background:var(--bg-panel-elevated);"></span>
            <span class="heatmap-legend-cell" style="background:rgba(163, 230, 53, 0.35);"></span>
            <span class="heatmap-legend-cell" style="background:rgba(163, 230, 53, 0.65);"></span>
            <span class="heatmap-legend-cell" style="background:#a3e635;"></span>
            <span class="heatmap-legend-cell" style="background:#fbbf24;"></span>
            <span>More</span>
          </div>
        </div>

        <div class="leetcode-sync-card">
          ${!isCohortVerifiedUser(authSession) ? `
            <div style="margin-bottom:0.85rem; padding:0.8rem 1rem; border:1px solid var(--accent-yellow); background:rgba(251, 191, 36, 0.08); border-radius:6px; font-family:var(--font-mono); font-size:0.78rem; color:var(--accent-yellow); font-weight:700; display:flex; align-items:center; justify-content:space-between; gap:0.75rem; flex-wrap:wrap;">
              <span>🔒 Verification Pending — Contact admin for verification, then you can connect your LeetCode.</span>
              <span style="font-size:0.7rem; color:var(--text-muted);">All DSA units, visualizer & practice arena remain 100% unlocked!</span>
            </div>
          ` : ""}
          <div class="leetcode-connect-bar">
            <div style="display:flex; align-items:center; gap:0.45rem;">
              <span class="leetcode-crest-badge">${isCohortVerifiedUser(authSession) ? (isLcConnected ? "LC SYNCED" : "LC LINK") : "LC LOCKED"}</span>
              <span style="font-family:var(--font-mono); font-size:0.76rem; font-weight:900; color:var(--text-main);">
                LEETCODE ACCOUNT:
              </span>
            </div>
            <input 
              type="text" 
              id="analyticsInputLeetCode" 
              class="leetcode-connect-input" 
              placeholder="${isCohortVerifiedUser(authSession) ? "Enter your real LeetCode username or URL" : "Contact admin for verification to link LeetCode"}" 
              value="${isCohortVerifiedUser(authSession) ? escapeHtml(lcUser) : ""}"
              ${isCohortVerifiedUser(authSession) ? "" : "disabled"}
            >
            <button type="button" class="tactile-btn btn-yellow" id="btnConnectLeetCodeAnalytics" onclick="window.connectLeetCodeFromAnalytics()">
              <span class="sync-spin-icon">⚡</span> ${isCohortVerifiedUser(authSession) ? (isLcConnected ? "Re-Sync Live Data" : "Connect & Sync") : "🔒 Request Verification"}
            </button>
            ${lcUser ? `
              <a href="https://leetcode.com/u/${encodeURIComponent(lcUser)}/" target="_blank" rel="noopener noreferrer" style="font-family:var(--font-mono); font-size:0.74rem; color:var(--accent-yellow); text-decoration:underline; margin-left:auto;">
                Profile @${escapeHtml(lcUser)} ↗
              </a>
            ` : ""}
          </div>

          <div class="leetcode-sync-stats-grid">
            <div class="leetcode-sync-stat-box">
              <span class="stat-label">Global Ranking</span>
              <div class="stat-number" style="color:var(--accent-cyan);">
                ${isLcConnected && lcStats.ranking ? "#" + lcStats.ranking.toLocaleString() : "—"}
              </div>
            </div>

            <div class="leetcode-sync-stat-box">
              <span class="stat-label">Total Solved on LeetCode</span>
              <div class="stat-number">
                ${isLcConnected ? lcStats.totalSolved : 0}
                <span style="font-size:0.74rem; color:var(--text-muted);">${isLcConnected ? "/ 3100+" : "(Not Connected)"}</span>
              </div>
              <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-muted); margin-top:0.2rem;">
                <span style="color:var(--accent-emerald); font-weight:800;">${isLcConnected ? lcStats.easySolved : 0}E</span> • 
                <span style="color:var(--accent-yellow); font-weight:800;">${isLcConnected ? lcStats.mediumSolved : 0}M</span> • 
                <span style="color:var(--accent-crimson); font-weight:800;">${isLcConnected ? lcStats.hardSolved : 0}H</span>
              </div>
            </div>

            <div class="leetcode-sync-stat-box">
              <span class="stat-label">Acceptance Rate</span>
              <div class="stat-number" style="color:var(--accent-emerald);">
                ${isLcConnected ? lcStats.acceptanceRate + "%" : "—"}
              </div>
            </div>

            <div class="leetcode-sync-stat-box">
              <span class="stat-label">Contest Rating & Tier</span>
              <div class="stat-number" style="color:var(--accent-yellow); font-size:1.2rem;">
                ${isLcConnected ? lcStats.rating : "—"}
                <span style="font-size:0.78rem; color:var(--accent-lime);">(${isLcConnected ? lcStats.tier : "Unrated"})</span>
              </div>
            </div>
          </div>

          <div class="leetcode-calendar-container">
            <div class="leetcode-calendar-header">
              <div>
                <span style="font-family:var(--font-mono); font-size:0.8rem; font-weight:900; color:#f89f1b; display:block;">
                  ⚡ LEETCODE 365-DAY SUBMISSION CALENDAR
                </span>
                <span style="font-family:var(--font-mono); font-size:0.72rem; color:#94a3b8;">
                  ${isLcConnected ? `Synced from public LeetCode activity for @${escapeHtml(lcUser)}` : "Connect your LeetCode profile above to populate your 365-day heatmap"}
                </span>
              </div>
              <div style="display:flex; gap:0.5rem; font-family:var(--font-mono); font-size:0.72rem;">
                <span style="background:#161b22; padding:0.2rem 0.5rem; border-radius:3px; border:1px solid #30363d; color:#a3e635;">
                  ${lcTotalYearSubmissions} Submissions
                </span>
                <span style="background:#161b22; padding:0.2rem 0.5rem; border-radius:3px; border:1px solid #30363d; color:#fbbf24;">
                  ${lcActiveDaysCount} Active Days
                </span>
              </div>
            </div>

            <div class="leetcode-calendar-scroll">
              <div class="leetcode-months-row">${lcMonthlyBlocksHtml}</div>
            </div>
            <div class="leetcode-calendar-legend" aria-hidden="true">
              <span>Less</span>
              <span class="leetcode-cell lc-level-0"></span>
              <span class="leetcode-cell lc-level-1"></span>
              <span class="leetcode-cell lc-level-2"></span>
              <span class="leetcode-cell lc-level-3"></span>
              <span class="leetcode-cell lc-level-4"></span>
              <span>More</span>
            </div>
          </div>

          <div class="leetcode-submissions-feed-box">
            <div class="leetcode-feed-header">
              <span>LIVE RECENT LEETCODE SUBMISSIONS</span>
              <span style="color:var(--accent-lime);">${isLcConnected ? "VERIFIED & LIVE" : "AWAITING CONNECTION"}</span>
            </div>
            <div class="leetcode-feed-list">
              ${(isLcConnected && lcStats.recentSubmissions && lcStats.recentSubmissions.length > 0) ? lcStats.recentSubmissions.map(sub => `
                <div class="leetcode-feed-item">
                  <span style="font-weight:800; font-size:0.82rem;">${escapeHtml(sub.title)}</span>
                  <div style="display:flex; align-items:center; gap:0.6rem;">
                    <span style="color:var(--accent-yellow); font-size:0.72rem;">${escapeHtml(sub.lang)}</span>
                    <span class="lc-status-accepted">${escapeHtml(sub.status)}</span>
                    <span style="color:#94a3b8; font-size:0.7rem;">${escapeHtml(sub.time)}</span>
                  </div>
                </div>
              `).join("") : `
                <div style="padding:1rem; text-align:center; font-family:var(--font-mono); font-size:0.78rem; color:#94a3b8;">
                  ${isLcConnected ? "No public recent submissions found for this profile." : "Connect your LeetCode profile above to synchronize your live accepted submissions."}
                </div>
              `}
            </div>
          </div>
        </div>

        <div class="analytics-core-grid">
          <div class="donut-card-container">
            <h3 style="font-size:1.05rem; font-weight:900; color:var(--text-main); margin-bottom:0.25rem;">Curriculum Problem Completion</h3>
            <p style="font-size:0.76rem; color:var(--text-muted); font-family:var(--font-mono); margin-bottom:0.85rem; text-align:center;">
              Verified solutions across ${totalPossible} Linked List problems
            </p>

            <div class="donut-chart-wrapper">
              <svg class="donut-svg-element" viewBox="0 0 160 160">
                <circle class="donut-circle-bg" cx="80" cy="80" r="${radius}"></circle>
                <circle 
                  class="donut-circle-fill" 
                  cx="80" 
                  cy="80" 
                  r="${radius}"
                  style="stroke-dasharray:${circumference}; stroke-dashoffset:${strokeDashoffset};"
                ></circle>
              </svg>
              <div class="donut-center-overlay">
                <span class="donut-percentage-display">${overallPct}%</span>
                <span class="donut-total-label">${solvedProblems.size}/${totalPossible} SOLVED</span>
              </div>
            </div>

            <div class="progress-bar-stack">
              <div class="progress-bar-meta">
                <span>Easy Difficulty</span>
                <span>${stats.easyCount}/${easyTotal} (${easyPct}%)</span>
              </div>
              <div class="difficulty-bar-track">
                <div class="difficulty-bar-fill fill-easy" style="width:${easyPct}%;"></div>
              </div>
            </div>

            <div class="progress-bar-stack">
              <div class="progress-bar-meta">
                <span>Medium Difficulty</span>
                <span>${stats.medCount}/${medTotal} (${medPct}%)</span>
              </div>
              <div class="difficulty-bar-track">
                <div class="difficulty-bar-fill fill-medium" style="width:${medPct}%;"></div>
              </div>
            </div>

            <div class="progress-bar-stack" style="margin-bottom:0;">
              <div class="progress-bar-meta">
                <span>Hard Difficulty</span>
                <span>${stats.hardCount}/${hardTotal} (${hardPct}%)</span>
              </div>
              <div class="difficulty-bar-track">
                <div class="difficulty-bar-fill fill-hard" style="width:${hardPct}%;"></div>
              </div>
            </div>
          </div>

          <div class="analytics-cohort-card">
            <h3 style="font-size:1.05rem; font-weight:900; color:var(--text-main); margin-bottom:0.25rem;">Cohort SDE Evaluation Matrix</h3>
            <p style="font-size:0.76rem; color:var(--text-muted); font-family:var(--font-mono); margin-bottom:1rem;">Peer metrics across registered students</p>

            <div class="cohort-metrics-list">
              <div class="cohort-metric-item">
                <div>
                  <span class="cohort-metric-title">80/20 Composite Rank</span>
                  <span class="cohort-metric-sub">80% LeetCode Verified + 20% MYTH Platform Mastery</span>
                </div>
                <div style="font-family:var(--font-mono); font-weight:900; font-size:1.1rem; color:var(--accent-yellow);">
                  #${currentUserRank}
                </div>
              </div>

              <div class="cohort-metric-item">
                <div>
                  <span class="cohort-metric-title">Registered Students in Cohort</span>
                  <span class="cohort-metric-sub">Authenticated peers tracked in cohort registry</span>
                </div>
                <div style="font-family:var(--font-mono); font-weight:900; font-size:1.1rem; color:var(--accent-cyan);">
                  ${cohortStats.totalStudents}
                </div>
              </div>

              <div class="cohort-metric-item">
                <div>
                  <span class="cohort-metric-title">Cohort Acceptance Average</span>
                  <span class="cohort-metric-sub">Calculated across verified test submissions</span>
                </div>
                <div style="font-family:var(--font-mono); font-weight:900; font-size:1.1rem; color:var(--accent-emerald);">
                  ${cohortStats.avgAcceptance}%
                </div>
              </div>

              <div class="cohort-metric-item">
                <div>
                  <span class="cohort-metric-title">Active Language Engine</span>
                  <span class="cohort-metric-sub">Compiler environment for code & solutions</span>
                </div>
                <div style="font-family:var(--font-mono); font-weight:900; font-size:1.1rem; color:var(--accent-lime);">
                  ${(currentCodeMode || "cpp").toUpperCase()}
                </div>
              </div>
            </div>

            <div style="display:flex; gap:0.65rem; margin-top:1.25rem;">
              <button type="button" class="tactile-btn btn-yellow btn-lg" onclick="window.switchTab('arena')" style="flex:1; justify-content:center;">
                🏃 Enter Race Arena
              </button>
              <button type="button" class="tactile-btn btn-lg" onclick="window.switchTab('leaderboard')" style="flex:1; justify-content:center;">
                🏆 View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function buildEcosystemVisionMarkup({ isInsideApp = false } = {}) {
    const linkedInUrl = escapeHtml(FOUNDER_LINKEDIN_URL);
    const ctaBtnHtml = isInsideApp
      ? `<button type="button" class="tactile-btn btn-yellow eco-cta-btn" id="aboutExploreModulesBtn">Explore DSA Modules</button>`
      : `<button type="button" class="tactile-btn btn-yellow eco-cta-btn" id="landingBottomGetStartedBtn">Start Learning Inside DSA Studio</button>`;

    return `
      <div class="ecosystem-open-canvas ${isInsideApp ? "is-inside-app" : ""}">
        <header class="ecosystem-editorial-head">
          <span class="ecosystem-editorial-kicker">🚀 TASKMESH ECOSYSTEM &amp; VISION</span>
          <h2>One Roof for Engineering Depth, Execution &amp; Communication</h2>
        </header>

        <!-- Centerpiece Borderless Portrait + 4 Dotted Arrow Callouts -->
        <div class="founder-constellation-stage">
          <div class="founder-stage-glow" aria-hidden="true"></div>

          <!-- Curved Dotted Vector Arrows Pointing Onto the Portrait -->
          <svg class="ecosystem-arrows-svg" viewBox="0 0 1120 560" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <marker id="ecoArrowCyan" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 1 2 L 8 5 L 1 8" fill="none" stroke="#22d3ee" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </marker>
              <marker id="ecoArrowAmber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 1 2 L 8 5 L 1 8" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </marker>
              <marker id="ecoArrowEmerald" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 1 2 L 8 5 L 1 8" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </marker>
              <marker id="ecoArrowViolet" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 1 2 L 8 5 L 1 8" fill="none" stroke="#a78bfa" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </marker>
            </defs>

            <!-- Top-Left: Dot at Left Shoulder -> Dotted Arrow Pointing Left to Text -->
            <circle cx="434" cy="176" r="8" fill="#22d3ee" opacity="0.22"/>
            <circle cx="434" cy="176" r="4.5" fill="#22d3ee"/>
            <path d="M 430 172 C 386 132, 360 74, 305 74" fill="none" stroke="#22d3ee" stroke-width="2.2" stroke-dasharray="2 7" stroke-linecap="round" marker-end="url(#ecoArrowCyan)"/>

            <!-- Mid-Left: Dot at Left Sleeve -> Dotted Arrow Pointing Left to Text -->
            <circle cx="418" cy="308" r="8" fill="#f59e0b" opacity="0.22"/>
            <circle cx="418" cy="308" r="4.5" fill="#f59e0b"/>
            <path d="M 412 305 C 374 284, 352 264, 305 264" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-dasharray="2 7" stroke-linecap="round" marker-end="url(#ecoArrowAmber)"/>

            <!-- Top-Right: Dot at Right Shoulder -> Dotted Arrow Pointing Right to Text -->
            <circle cx="686" cy="176" r="8" fill="#10b981" opacity="0.22"/>
            <circle cx="686" cy="176" r="4.5" fill="#10b981"/>
            <path d="M 690 172 C 734 132, 760 74, 815 74" fill="none" stroke="#10b981" stroke-width="2.2" stroke-dasharray="2 7" stroke-linecap="round" marker-end="url(#ecoArrowEmerald)"/>

            <!-- Mid-Right: Dot at Right Forearm -> Dotted Arrow Pointing Right to Text -->
            <circle cx="702" cy="308" r="8" fill="#a78bfa" opacity="0.22"/>
            <circle cx="702" cy="308" r="4.5" fill="#a78bfa"/>
            <path d="M 708 305 C 746 284, 768 264, 815 264" fill="none" stroke="#a78bfa" stroke-width="2.2" stroke-dasharray="2 7" stroke-linecap="round" marker-end="url(#ecoArrowViolet)"/>
          </svg>

          <!-- Giant Borderless Founder Cutout Portrait -->
          <a
            href="${linkedInUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="founder-hero-cutout-link"
            data-founder-linkedin="true"
            aria-label="Connect with Kartik Kumar on LinkedIn (opens in new tab)"
            title="Click anywhere on photo to open Kartik Kumar's LinkedIn in a new tab"
          >
            <img
              src="/founder-kartik.png"
              alt="Kartik Kumar — Founder and Lead Architect of TaskMesh"
              class="founder-hero-cutout-img"
            >
            <span class="founder-hover-connect-pill" aria-hidden="true">
              <span class="linkedin-glyph">in</span>
              <span class="hover-pill-text">
                <strong>Connect</strong>
                <small>LinkedIn ↗</small>
              </span>
            </span>
          </a>

          <!-- 4 Floating Dotted-Annotated TaskMesh Pillars (No heavy card boxes) -->
          <div class="eco-callouts-layer" aria-label="The 4 Core Pillars of TaskMesh">
            <article class="eco-callout pos-tl tone-cyan">
              <div class="eco-callout-title">
                <span class="eco-callout-emoji">🗣️</span>
                <h4>English &amp; Spoken Communication</h4>
              </div>
              <p>Vocab (30D), OWSP (59D), Technical Speech Drills &amp; Audio Recording.</p>
            </article>

            <article class="eco-callout pos-tr tone-emerald">
              <div class="eco-callout-title">
                <span class="eco-callout-emoji">💻</span>
                <h4>DSA &amp; Algorithmic Drills</h4>
              </div>
              <p>Daily Data Structures &amp; Algorithms problem-solving challenges.</p>
            </article>

            <article class="eco-callout pos-bl tone-amber">
              <div class="eco-callout-title">
                <span class="eco-callout-emoji">🛠️</span>
                <h4>Production Engineering &amp; Projects</h4>
              </div>
              <p>Real-world portfolio builds &amp; clean architecture drills.</p>
            </article>

            <article class="eco-callout pos-br tone-violet">
              <div class="eco-callout-title">
                <span class="eco-callout-emoji">✨</span>
                <h4>Messy AI &amp; Unified Competition</h4>
              </div>
              <p>Instant audio/code evaluation, global leaderboards &amp; friend rooms.</p>
            </article>
          </div>
        </div>

        <!-- Overlapping Signature + Bespoke LinkedIn Button + Message Flowing Up Over Lower Portrait -->
        <div class="founder-overlap-manifesto">
          <div class="founder-signature-bar">
            <div class="founder-signature-id">
              <span class="founder-quote-tagline">“A little learning. Every day.”</span>
              <h3 class="founder-signature-name">Kartik Kumar</h3>
              <p class="founder-signature-role">Founder &amp; Lead Architect • TaskMesh</p>
            </div>

            <a
              href="${linkedInUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="founder-linkedin-btn"
              data-founder-linkedin="true"
              aria-label="Connect with Kartik Kumar on LinkedIn (kartik-kumar955)"
            >
              <span class="li-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002ZM7 8.48H3V21h4V8.48Zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68Z"/>
                </svg>
              </span>
              <span class="li-copy">
                <strong>Connect on LinkedIn</strong>
                <small>in/kartik-kumar955</small>
              </span>
              <span class="li-arrow" aria-hidden="true">↗</span>
            </a>
          </div>

          <div class="founder-manifesto-body">
            <div class="founder-manifesto-label">💬 MESSAGE FROM THE FOUNDER</div>
            <blockquote class="founder-manifesto-quote">
              <p>
                "In today's competitive world, mastering just one skill isn't enough. A complete engineer or professional needs Technical Depth (DSA), Practical Execution (Projects), and Articulate Communication (English).
              </p>
              <p>
                Traditional courses make you passively watch 100-hour video playlists where you forget 90% of what you saw. TaskMesh was born to change this.
              </p>
              <p>
                TaskMesh brings every core discipline under one roof with a single golden rule: <strong>A little active practice, every single day.</strong>
              </p>
              <p>
                Whether you are speaking out loud, solving algorithmic problems, or building software—TaskMesh gives you the daily structure, instant AI evaluation, and peer community to become unstoppable."
              </p>
            </blockquote>

            <div class="founder-manifesto-foot">
              <span class="founder-signoff-line">— Kartik Kumar, Founder &amp; Lead Architect</span>
              ${ctaBtnHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderLandingFounderVision() {
    const mount = document.getElementById("landingFounderVision");
    if (!mount) return;
    mount.innerHTML = buildEcosystemVisionMarkup({ isInsideApp: false });
    mount.querySelector("#landingBottomGetStartedBtn")?.addEventListener("click", openAuthGatekeeperFromLanding);
  }

  function renderAboutView() {
    if (!mainContentArea) return;
    mainContentArea.innerHTML = `
      <section class="ecosystem-vision-stage is-inside-app" aria-label="About TaskMesh and Founder Vision">
        ${buildEcosystemVisionMarkup({ isInsideApp: true })}
      </section>
    `;
    document.getElementById("aboutExploreModulesBtn")?.addEventListener("click", () => switchTab("modules"));
  }

  // ============================================================================
  // TAB NAVIGATION & WORKSPACE VIEW SWITCHING
  // ============================================================================
  if (brandHomeBtn) brandHomeBtn.addEventListener("click", () => switchTab("concept"));
  if (tabModulesBtn) tabModulesBtn.addEventListener("click", () => switchTab("modules"));
  if (tabConceptBtn) tabConceptBtn.addEventListener("click", () => switchTab("concept"));
  if (tabVisualizerBtn) tabVisualizerBtn.addEventListener("click", () => switchTab("visualizer"));
  if (tabPracticeBtn) tabPracticeBtn.addEventListener("click", () => switchTab("practice"));
  if (tabRaceArenaBtn) tabRaceArenaBtn.addEventListener("click", () => switchTab("arena"));
  if (tabAnalyticsBtn) tabAnalyticsBtn.addEventListener("click", () => switchTab("analytics"));
  if (tabLeaderboardBtn) tabLeaderboardBtn.addEventListener("click", () => switchTab("leaderboard"));
  if (tabAboutBtn) tabAboutBtn.addEventListener("click", () => switchTab("about"));

  // Stealth screen-edge rail listeners
  document.querySelectorAll(".stealth-edge-btn[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
  });

  function switchTab(tabName) {
    SoundFX.click();
    activeTab = tabName;
    closeMobileSidebar();

    [tabModulesBtn, tabConceptBtn, tabVisualizerBtn, tabPracticeBtn, tabRaceArenaBtn, tabAnalyticsBtn, tabLeaderboardBtn, tabAboutBtn].forEach(btn => {
      if (btn) btn.classList.remove("active");
    });

    if (tabName === "modules" && tabModulesBtn) tabModulesBtn.classList.add("active");
    if (tabName === "concept" && tabConceptBtn) tabConceptBtn.classList.add("active");
    if (tabName === "visualizer" && tabVisualizerBtn) tabVisualizerBtn.classList.add("active");
    if (tabName === "practice" && tabPracticeBtn) tabPracticeBtn.classList.add("active");
    if (tabName === "arena" && tabRaceArenaBtn) tabRaceArenaBtn.classList.add("active");
    if (tabName === "analytics" && tabAnalyticsBtn) tabAnalyticsBtn.classList.add("active");
    if (tabName === "leaderboard" && tabLeaderboardBtn) tabLeaderboardBtn.classList.add("active");
    if (tabName === "about" && tabAboutBtn) tabAboutBtn.classList.add("active");

    document.querySelectorAll(".stealth-edge-btn[data-tab]").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
    });

    const isCurriculumTab = (tabName === "concept" || tabName === "visualizer" || tabName === "practice");
    if (appViewportLayout) {
      appViewportLayout.classList.toggle("sidebar-hidden", !isCurriculumTab);
    }

    if (tabName === "modules") {
      renderModulesHub();
    } else if (tabName === "arena") {
      if (raceArenaInstance) {
        raceArenaInstance.renderArenaView(mainContentArea, getLeaderboardRegistry(), authSession);
      }
    } else if (tabName === "analytics") {
      renderAnalyticsView();
    } else if (tabName === "leaderboard") {
      renderLeaderboardView();
    } else if (tabName === "about") {
      renderAboutView();
    } else {
      renderTopic(activeTopicIdx);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof refreshKavishContextUI === "function") refreshKavishContextUI();
  }
  window.switchTab = switchTab;

  // ============================================================================
  // TOPBAR CONTROLS: THEME, CODE MODE, TONE & PROFILE
  // ============================================================================
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      SoundFX.click();
      currentTheme = (currentTheme === "dark") ? "light" : "dark";
      document.body.classList.toggle("dark", currentTheme === "dark");
      localStorage.setItem(KEY_THEME, currentTheme);
      updateThemeButton();
      if (visualizerInstance) visualizerInstance.render();
    });
  }

  function updateThemeButton() {
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = (currentTheme === "dark")
        ? `<span>☀️</span> <span class="hide-on-lg">Light</span>`
        : `<span>🌙</span> <span class="hide-on-lg">Dark</span>`;
    }
    if (landingThemeToggleBtn) {
      landingThemeToggleBtn.textContent = (currentTheme === "dark") ? "☀️" : "🌙";
    }
  }

  if (landingThemeToggleBtn && themeToggleBtn) {
    landingThemeToggleBtn.addEventListener("click", () => themeToggleBtn.click());
  }

  if (codeModeCppBtn && codeModeJavaBtn) {
    codeModeCppBtn.addEventListener("click", () => switchCodeMode("cpp"));
    codeModeJavaBtn.addEventListener("click", () => switchCodeMode("java"));
  }

  function switchCodeMode(mode) {
    SoundFX.click();
    currentCodeMode = mode;
    localStorage.setItem(KEY_CODE_MODE, currentCodeMode);
    updateCodeModeButtons();
    if (authSession) {
      authSession.langTrack = mode;
      localStorage.setItem(KEY_AUTH, JSON.stringify(authSession));
    }
    syncCurrentUserLeaderboard();
    if (activeTab === "concept" || activeTab === "visualizer" || activeTab === "practice") {
      renderTopic(activeTopicIdx);
    } else if (activeTab === "analytics") {
      renderAnalyticsView();
    } else if (activeTab === "leaderboard") {
      renderLeaderboardView();
    }
  }

  function updateCodeModeButtons() {
    if (codeModeCppBtn && codeModeJavaBtn) {
      codeModeCppBtn.classList.toggle("active", currentCodeMode === "cpp");
      codeModeJavaBtn.classList.toggle("active", currentCodeMode === "java");
    }
  }

  if (toneSelector) {
    toneSelector.addEventListener("change", (e) => {
      SoundFX.click();
      currentLang = e.target.value;
      localStorage.setItem(KEY_LANG, currentLang);
      if (activeTab === "concept" || activeTab === "visualizer" || activeTab === "practice") {
        renderTopic(activeTopicIdx);
      }
    });
  }

  if (profileOpenBtn) {
    profileOpenBtn.addEventListener("click", () => {
      SoundFX.click();
      updateProfileDisplay();
      syncCurrentUserLeaderboard();
      if (profileModal) profileModal.classList.add("active");
    });
  }
  if (closeProfileModal) closeProfileModal.addEventListener("click", () => profileModal?.classList.remove("active"));
  if (closeProfileModalBtn) closeProfileModalBtn.addEventListener("click", () => profileModal?.classList.remove("active"));
  if (logoutProfileBtn) logoutProfileBtn.addEventListener("click", () => logoutUser());
  if (closeRoadmapModal) closeRoadmapModal.addEventListener("click", () => roadmapModal?.classList.remove("active"));

  // ============================================================================
  // SIDEBAR & TOPIC RENDERING
  // ============================================================================
  function updateProgress() {
    if (!authSession) return;
    const totalTopics = COURSE_DATA.length;
    const completedCount = completedTopics.size;
    const percentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    if (overallProgressBar) overallProgressBar.style.width = `${percentage}%`;
    if (overallProgressLabel) {
      overallProgressLabel.innerText = `${percentage}% • ${completedCount}/${totalTopics} (${solvedProblems.size} SOLVED)`;
    }
    localStorage.setItem(`${KEY_PROGRESS}_${authSession.roll}`, JSON.stringify(Array.from(completedTopics)));
  }

  window.toggleTopicCompletion = (topicId) => {
    if (completedTopics.has(topicId)) {
      completedTopics.delete(topicId);
      SoundFX.click();
    } else {
      completedTopics.add(topicId);
      SoundFX.success();
      recordActivityEvent();
    }
    updateProgress();
    syncCurrentUserLeaderboard();
    renderSidebar(searchInput ? searchInput.value : "");
    renderTopic(activeTopicIdx);
  };

  function renderSidebar(filterText = "") {
    if (!sidebarList) return;
    sidebarList.innerHTML = "";
    const filter = filterText.toLowerCase().trim();

    COURSE_DATA.forEach((topic, idx) => {
      if (filter && !topic.title.toLowerCase().includes(filter) && !topic.tag.toLowerCase().includes(filter)) {
        return;
      }

      const li = document.createElement("li");
      const isCompleted = completedTopics.has(topic.id);
      li.className = `curriculum-tile-item ${idx === activeTopicIdx ? "active" : ""} ${isCompleted ? "completed" : ""}`;

      li.innerHTML = `
        <div class="tile-checkbox">${isCompleted ? "✓" : ""}</div>
        <span class="tile-num-badge">${escapeHtml(topic.number)}</span>
        <span class="tile-label-span">${escapeHtml(topic.title)}</span>
      `;

      li.addEventListener("click", () => {
        activeTopicIdx = idx;
        renderSidebar(searchInput ? searchInput.value : "");
        if (activeTab !== "concept" && activeTab !== "visualizer" && activeTab !== "practice") {
          switchTab("concept");
        } else {
          SoundFX.click();
          closeMobileSidebar();
          renderTopic(activeTopicIdx);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });

      sidebarList.appendChild(li);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => renderSidebar(e.target.value));
  }

  function getPersonalizedIntuition(topic) {
    const firstName = getStudentFirstName(authSession);
    const honorific = getStudentHonorific();
    let text = topic.intuition_hinglish || "";
    if (currentLang === "en") text = topic.intuition_en || text;
    else if (currentLang === "tldr") text = topic.intuition_tldr || text;
    const standaloneReplacement = currentLang === "hinglish"
      ? `${escapeHtml(firstName)} ${honorific}`
      : escapeHtml(firstName);
    const localized = text
      .replace(/\{\{USER\}\}\s+bhai\b/gi, `${escapeHtml(firstName)} ${honorific}`)
      .replace(/\{\{USER\}\}/g, standaloneReplacement);
    return formatInlineContent(localized);
  }

  function renderTopic(index) {
    const topic = COURSE_DATA[index];
    if (!topic) return;

    const isTopicCompleted = completedTopics.has(topic.id);
    const codeSnippet = (currentCodeMode === "java" && topic.code_java) ? topic.code_java : topic.code_cpp;
    const personalizedIntuition = getPersonalizedIntuition(topic);

    const dryRunList = Array.isArray(topic.dry_run) ? topic.dry_run : [];
    const comparisonRows = Array.isArray(topic.c_vs_cpp) ? topic.c_vs_cpp : [];
    const pitfallsList = Array.isArray(topic.pitfalls) ? topic.pitfalls : [];
    const topicProblems = Array.isArray(topic.problems) ? topic.problems : [];

    // Filter problems in Practice Arena
    const filteredProblems = topicProblems.filter(p => {
      if (practiceFilter === "solved") return solvedProblems.has(p.id);
      if (practiceFilter === "unsolved") return !solvedProblems.has(p.id);
      if (practiceFilter === "bookmarked") return bookmarkedProblems.has(p.id);
      return true;
    });

    mainContentArea.innerHTML = `
      <!-- CONCEPT VIEW -->
      <section id="conceptViewSection" style="display:${activeTab === "concept" ? "block" : "none"};">
        <div class="module-breadcrumb-bar">
          <div class="module-breadcrumb-path">
            <a onclick="window.switchTab('modules')">📦 All Modules</a>
            <span class="separator">/</span>
            <span class="current">🔗 Linked Lists</span>
            <span class="separator">/</span>
            <span style="color:var(--accent-yellow);">Unit ${escapeHtml(topic.number)}: ${escapeHtml(topic.title)}</span>
          </div>
          <button type="button" class="tactile-btn btn-sm" onclick="window.switchTab('modules')">
            ← All Modules
          </button>
        </div>

        <div class="workspace-hero-header">
          <div class="topic-meta-row">
            <span class="topic-tag-pill">${escapeHtml(topic.tag)}</span>
            <span class="topic-standard-badge">UNIT ${escapeHtml(topic.number)} OF ${COURSE_DATA.length}</span>
            <span class="topic-standard-badge">MODE: ${currentCodeMode.toUpperCase()}</span>
          </div>

          <h1 class="topic-main-title">${escapeHtml(topic.title)}</h1>
          <p class="topic-sub-summary">${formatInlineContent(escapeHtml(topic.summary))}</p>
        </div>

        ${topic.leetcode_milestone ? `
          <div class="milestone-checkpoint-card">
            <div class="milestone-text-group">
              <div class="milestone-trophy-badge">🏆</div>
              <div>
                <div style="font-family:var(--font-mono); font-size:0.72rem; font-weight:900; color:var(--accent-lime);">
                  MILESTONE UNLOCK • LC #${topic.leetcode_milestone.number}
                </div>
                <div style="font-weight:900; font-size:0.98rem; color:var(--text-main);">
                  ${escapeHtml(topic.leetcode_milestone.name)}
                </div>
                <div style="font-size:0.84rem; color:var(--text-muted);">
                  ${escapeHtml(topic.leetcode_milestone.checkpoint)}
                </div>
              </div>
            </div>
            <a href="${escapeHtml(topic.leetcode_milestone.url)}" target="_blank" rel="noopener noreferrer" class="tactile-btn btn-lime">
              Solve LC #${topic.leetcode_milestone.number} ↗
            </a>
          </div>
        ` : ""}

        <!-- Bento Card: Mentor Intuition -->
        <div class="bento-card-block">
          <div class="bento-card-header">
            <span class="bento-badge-sticker">
              ${currentLang === "hinglish" ? "🎙️ MENTOR INTUITION" : (currentLang === "en" ? "👔 FAANG FORMAL SPEC" : "⚡ TL;DR FORMULA")}
            </span>
            <span style="font-family:var(--font-mono); font-size:0.72rem; font-weight:800; color:var(--text-muted);">
              PERSONA: ${currentLang.toUpperCase()}
            </span>
          </div>
          <div class="mentor-intuition-text">${personalizedIntuition}</div>
        </div>

        <!-- Bento Card: Memory Architecture & Dry Run -->
        <div class="bento-card-block">
          <div class="bento-card-header">
            <span class="bento-badge-sticker">🧠 MEMORY ARCHITECTURE & DRY RUN</span>
            <span style="font-family:var(--font-mono); font-size:0.72rem; font-weight:800; color:var(--accent-lime);">
              ${currentCodeMode.toUpperCase()} POINTER SAFETY
            </span>
          </div>
          
          <div class="code-terminal-viewer" style="margin-bottom:1.25rem;">
            <div class="terminal-bar">
              <div class="terminal-dots">
                <span class="terminal-dot red"></span>
                <span class="terminal-dot yellow"></span>
                <span class="terminal-dot green"></span>
              </div>
              <span class="terminal-title">RAM Node Memory Pointer Layout</span>
            </div>
            <pre class="terminal-code-body" style="color:var(--accent-yellow); font-size:0.82rem;">${escapeHtml(topic.diagram)}</pre>
          </div>

          <div style="font-size:0.9rem; font-weight:800; color:var(--text-main); margin-bottom:0.65rem;">
            Step-by-Step Execution Trace:
          </div>
          <div class="dry-run-stepper-cluster">
            ${dryRunList.map((stepText, idx) => `
              <div class="stepper-step-card">
                <div class="step-num-pill">${idx + 1}</div>
                <div class="step-desc-text">${formatInlineContent(escapeHtml(String(stepText).replace(/^\d+\.\s*/, "")))}</div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Bento Card: Comparative Matrix -->
        ${comparisonRows.length > 0 ? `
          <div class="bento-card-block">
            <div class="bento-card-header">
              <span class="bento-badge-sticker">⚖️ LANGUAGE COMPARATIVE MATRIX</span>
              <span style="font-family:var(--font-mono); font-size:0.72rem; font-weight:800; color:var(--text-muted);">
                C vs C++ & JAVA
              </span>
            </div>
            <div class="matrix-table-wrapper">
              <table class="matrix-table">
                <thead>
                  <tr>
                    <th>Concept</th>
                    <th>C (Procedural)</th>
                    <th>Modern C++ & Java Target</th>
                  </tr>
                </thead>
                <tbody>
                  ${comparisonRows.map(d => `
                    <tr>
                      <td><strong>${escapeHtml(d.feature || d.concept || "")}</strong></td>
                      <td style="color:var(--text-muted);">${formatInlineContent(escapeHtml(d.c || ""))}</td>
                      <td style="color:var(--accent-yellow); font-weight:700;">${formatInlineContent(escapeHtml(d.cpp || ""))}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        ` : ""}

        <!-- Bento Card: Production Implementation Code -->
        <div class="bento-card-block">
          <div class="bento-card-header">
            <span class="bento-badge-sticker">💻 VERIFIED ${currentCodeMode.toUpperCase()} IMPLEMENTATION</span>
            <button type="button" class="tactile-btn btn-sm" onclick="window.copyToClipboard('mainCodeBlock')">
              📋 Copy Code
            </button>
          </div>
          <div class="code-terminal-viewer">
            <div class="terminal-bar">
              <div class="terminal-dots">
                <span class="terminal-dot red"></span>
                <span class="terminal-dot yellow"></span>
                <span class="terminal-dot green"></span>
              </div>
              <span class="terminal-title">${currentCodeMode === "java" ? "Solution.java" : "solution.cpp"}</span>
            </div>
            <pre class="terminal-code-body" id="mainCodeBlock">${escapeHtml(codeSnippet)}</pre>
          </div>
        </div>

        <!-- Bento Card: Common Pitfalls -->
        ${pitfallsList.length > 0 ? `
          <div class="bento-card-block" style="border-left: 4px solid var(--accent-crimson);">
            <div class="bento-card-header">
              <span class="bento-badge-sticker" style="background:var(--accent-crimson); color:#fff; border-color:#000;">
                ⚠️ CRITICAL BUGS & MEMORY LEAKS
              </span>
            </div>
            <div class="pitfalls-cluster">
              ${pitfallsList.map(p => `
                <div class="pitfall-item-card">${formatInlineContent(p)}</div>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <!-- Sequential Next-Step Flow CTA -->
        <div class="next-step-flow-card">
          <div>
            <div style="font-family:var(--font-mono); font-size:0.72rem; font-weight:900; color:var(--accent-yellow);">NEXT RECOMMENDED STEP</div>
            <div style="font-weight:800; color:var(--text-main); font-size:0.95rem;">Trace pointers in Live Visualizer or jump straight to Practice problems</div>
          </div>
          <div style="display:flex; gap:0.65rem; flex-wrap:wrap;">
            <button type="button" class="tactile-btn btn-cyan" onclick="window.switchTab('visualizer')">
              ⚡ Step 3: Live Visualizer →
            </button>
            <button type="button" class="tactile-btn btn-yellow" onclick="window.switchTab('practice')">
              🎯 Step 4: Practice (${topicProblems.length}) →
            </button>
          </div>
        </div>

        <!-- Bottom Unit Stepper -->
        <div class="workspace-bottom-stepper">
          <button 
            type="button"
            class="tactile-btn" 
            onclick="window.navigateTopic(${index - 1})" 
            ${index === 0 ? "disabled" : ""}
          >
            ← Previous Unit
          </button>

          <button 
            type="button"
            class="tactile-btn ${isTopicCompleted ? "btn-lime" : "btn-yellow"}" 
            onclick="window.toggleTopicCompletion('${topic.id}')"
          >
            ${isTopicCompleted ? "✓ Unit Completed" : "Mark Unit Completed"}
          </button>

          <button 
            type="button"
            class="tactile-btn" 
            onclick="window.navigateTopic(${index + 1})" 
            ${index === COURSE_DATA.length - 1 ? "disabled" : ""}
          >
            Next Unit →
          </button>
        </div>
      </section>

      <!-- VISUALIZER VIEW -->
      <section id="visualizerViewSection" style="display:${activeTab === "visualizer" ? "block" : "none"};">
        <div class="module-breadcrumb-bar">
          <div class="module-breadcrumb-path">
            <a onclick="window.switchTab('concept')">📖 Theory & Code</a>
            <span class="separator">/</span>
            <span style="color:var(--accent-yellow);">⚡ Interactive Memory Visualizer</span>
          </div>
          <button type="button" class="tactile-btn btn-yellow btn-sm" onclick="window.switchTab('practice')">
            Next: Practice Arena →
          </button>
        </div>

        <div class="visualizer-card-wrapper">
          <div class="visualizer-top-banner">
            <div class="visualizer-banner-title">
              <span class="pulse-indicator"></span>
              <span>Interactive Memory Pointer Visualizer</span>
            </div>
            <span style="font-family:var(--font-mono); font-size:0.74rem; font-weight:800; color:var(--accent-yellow);">
              LIVE HEAP NODES • SEARCH • 3-POINTER REVERSAL
            </span>
          </div>

          <div class="visualizer-action-bar">
            <div class="viz-controls-row">
              <div class="viz-field-group">
                <label class="viz-field-label" for="vizValInput">Value</label>
                <input type="number" id="vizValInput" class="viz-input-number" value="45">
              </div>

              <div class="viz-field-group">
                <label class="viz-field-label" for="vizPosInput">Pos (0-idx)</label>
                <input type="number" id="vizPosInput" class="viz-input-number" value="1" min="0">
              </div>

              <button type="button" class="tactile-btn" onclick="window.handleVizInsertHead()">+ Insert Head</button>
              <button type="button" class="tactile-btn" onclick="window.handleVizInsertTail()">+ Insert Tail</button>
              <button type="button" class="tactile-btn" onclick="window.handleVizInsertPos()">+ Insert Pos</button>
              <button type="button" class="tactile-btn" onclick="window.handleVizSearchVal()">🔍 Search</button>
            </div>

            <div class="viz-controls-row">
              <button type="button" class="tactile-btn" onclick="window.handleVizDeleteHead()">- Delete Head</button>
              <button type="button" class="tactile-btn" onclick="window.handleVizDeleteTail()">- Delete Tail</button>
              <button type="button" class="tactile-btn" onclick="window.handleVizDeleteVal()">- Delete Val</button>
              <button type="button" class="tactile-btn btn-yellow" onclick="window.handleVizReverse()">⚡ Reverse List</button>
              <button type="button" class="tactile-btn" onclick="window.handleVizReset()">↺ Reset</button>

              <div class="viz-speed-control">
                <label for="vizSpeedSlider">Speed:</label>
                <input type="range" id="vizSpeedSlider" class="viz-speed-slider" min="200" max="1200" step="100" value="${visualizerInstance.speedMs}" oninput="window.handleVizSpeed(this.value)">
                <span id="vizSpeedLabel">${visualizerInstance.speedMs}ms</span>
              </div>
            </div>
          </div>

          <div class="viz-canvas-stage">
            <div class="viz-nodes-row" id="visualizerNodesTrack"></div>
          </div>

          <div class="viz-terminal-log-panel" id="visualizerLogTerminal"></div>
        </div>
      </section>

      <!-- PRACTICE ARENA VIEW -->
      <section id="practiceViewSection" style="display:${activeTab === "practice" ? "block" : "none"};">
        <div class="module-breadcrumb-bar">
          <div class="module-breadcrumb-path">
            <a onclick="window.switchTab('modules')">📦 All Modules</a>
            <span class="separator">/</span>
            <a onclick="window.switchTab('concept')">📖 Unit ${escapeHtml(topic.number)}</a>
            <span class="separator">/</span>
            <span style="color:var(--accent-yellow);">🎯 Practice Arena</span>
          </div>
          <button type="button" class="tactile-btn btn-sm" onclick="window.switchTab('concept')">
            ← Back to Theory
          </button>
        </div>

        <div class="workspace-hero-header">
          <div class="topic-meta-row">
            <span class="topic-tag-pill">PRACTICE ARENA</span>
            <span class="topic-standard-badge">${topicProblems.length} VERIFIED PROBLEM${topicProblems.length === 1 ? "" : "S"}</span>
          </div>
          <h1 class="topic-main-title">${escapeHtml(topic.title)} — Practice Arena</h1>
          <p class="topic-sub-summary">
            Write ${currentCodeMode.toUpperCase()} solutions, inspect test cases, reveal progressive hints, and submit to update your leaderboard rank.
          </p>
        </div>

        ${topicProblems.length > 0 ? `
          <div class="practice-filter-bar">
            <div class="practice-filter-pills">
              <button type="button" class="practice-filter-pill ${practiceFilter === "all" ? "active" : ""}" onclick="window.setPracticeFilter('all')">All (${topicProblems.length})</button>
              <button type="button" class="practice-filter-pill ${practiceFilter === "unsolved" ? "active" : ""}" onclick="window.setPracticeFilter('unsolved')">Unsolved (${topicProblems.filter(p => !solvedProblems.has(p.id)).length})</button>
              <button type="button" class="practice-filter-pill ${practiceFilter === "solved" ? "active" : ""}" onclick="window.setPracticeFilter('solved')">Solved (${topicProblems.filter(p => solvedProblems.has(p.id)).length})</button>
              <button type="button" class="practice-filter-pill ${practiceFilter === "bookmarked" ? "active" : ""}" onclick="window.setPracticeFilter('bookmarked')">Bookmarked ★ (${topicProblems.filter(p => bookmarkedProblems.has(p.id)).length})</button>
            </div>
            <span style="font-family:var(--font-mono); font-size:0.72rem; color:var(--text-muted);">
              Unit Solved: ${topicProblems.filter(p => solvedProblems.has(p.id)).length}/${topicProblems.length}
            </span>
          </div>

          <div class="practice-arena-grid">
            ${filteredProblems.length > 0
              ? filteredProblems.map(prob => renderPracticeProblemCard(prob)).join("")
              : `<div class="bento-card-block" style="text-align:center; padding:2rem;">
                  <div style="font-weight:900; font-size:1rem; color:var(--text-main); margin-bottom:0.5rem;">No problems match the "${escapeHtml(practiceFilter)}" filter</div>
                  <button type="button" class="tactile-btn btn-yellow" onclick="window.setPracticeFilter('all')">Show All Problems</button>
                </div>`
            }
          </div>
        ` : `
          <div class="bento-card-block" style="text-align:center; padding:2.5rem 1.5rem;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">📝</div>
            <h3 style="font-weight:900; color:var(--text-main); margin-bottom:0.4rem;">Revision Cheat-Sheet Unit</h3>
            <p style="color:var(--text-muted); margin-bottom:1.25rem; font-size:0.9rem;">
              This unit compiles interview templates. Practice problems are organized across Units 01–14!
            </p>
            <div style="display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap;">
              <button type="button" class="tactile-btn btn-yellow" onclick="window.navigateTopic(0)">Go to Unit 01 Problems</button>
              <button type="button" class="tactile-btn" onclick="window.switchTab('concept')">Review Cheat-Sheet</button>
            </div>
          </div>
        `}
      </section>
    `;

    // Mount & render visualizer immediately
    visualizerInstance.mount(
      document.getElementById("visualizerNodesTrack"),
      document.getElementById("visualizerLogTerminal")
    );
    if (typeof refreshKavishContextUI === "function") refreshKavishContextUI();
  }

  window.setPracticeFilter = (filterName) => {
    SoundFX.click();
    practiceFilter = filterName;
    renderTopic(activeTopicIdx);
  };

  function getScopedScratchpad(probId, fallbackStarter) {
    const roll = authSession ? authSession.roll : "guest";
    const scopedKey = `${KEY_SCRATCHPAD}_${roll}_${probId}_${currentCodeMode}`;
    const legacyKey = `${KEY_SCRATCHPAD}_${probId}_${currentCodeMode}`;
    return localStorage.getItem(scopedKey) ?? localStorage.getItem(legacyKey) ?? fallbackStarter;
  }

  function getScopedNotes(probId) {
    const roll = authSession ? authSession.roll : "guest";
    const scopedKey = `${KEY_NOTES}_${roll}_${probId}`;
    const legacyKey = `${KEY_NOTES}_${probId}`;
    return localStorage.getItem(scopedKey) ?? localStorage.getItem(legacyKey) ?? "";
  }

  function renderPracticeProblemCard(prob) {
    const isSolved = solvedProblems.has(prob.id);
    const isBookmarked = bookmarkedProblems.has(prob.id);
    const starterCode = (currentCodeMode === "java" && prob.starter_code_java) ? prob.starter_code_java : prob.starter_code_cpp;
    const solutionCode = (currentCodeMode === "java" && prob.solution_java) ? prob.solution_java : prob.solution_cpp;
    const savedUserCode = getScopedScratchpad(prob.id, starterCode);
    const savedNotes = getScopedNotes(prob.id);
    const complexity = extractComplexity(prob);
    const examples = Array.isArray(prob.examples) && prob.examples.length > 0
      ? prob.examples
      : [{ input: prob.input || "See test cases", output: prob.output || "Expected output", explanation: prob.edge_cases ? `Edge Cases: ${prob.edge_cases}` : "" }];
    const hints = Array.isArray(prob.hints) ? prob.hints : [];
    const companies = Array.isArray(prob.companies) ? prob.companies : [];
    const problemStatement = prob.statement || prob.desc || "";
    const refBadge = prob.leetcode_no ? `Ref #${prob.leetcode_no}` : (prob.leetcode || "Practice");

    return `
      <div class="problem-workspace-card ${isSolved ? "solved" : ""}" id="card-${prob.id}">
        <div class="prob-header-banner">
          <div class="prob-meta-left">
            <span class="difficulty-pill diff-${prob.difficulty.toLowerCase()}">${escapeHtml(prob.difficulty)}</span>
            <span class="prob-title-text">${escapeHtml(prob.title)}</span>
            <span class="prob-ref-badge-link">
              <a href="${escapeHtml(prob.leetcode_url || "#")}" target="_blank" rel="noopener noreferrer">
                ${escapeHtml(refBadge)} ↗
              </a>
            </span>
          </div>

          <div class="prob-actions-right">
            <button 
              type="button"
              class="bookmark-icon-btn ${isBookmarked ? "active" : ""}" 
              onclick="window.toggleBookmark('${prob.id}')"
              title="${isBookmarked ? "Remove Bookmark" : "Save to Bookmarks"}"
            >
              ★
            </button>
            <span class="status-indicator-tag ${isSolved ? "solved" : "todo"}" id="status-tag-${prob.id}">
              ${isSolved ? "SOLVED ✓" : "TODO"}
            </span>
          </div>
        </div>

        <div class="split-workspace-grid">
          <div class="prob-left-spec-pane">
            ${companies.length > 0 ? `
              <div class="company-stickers-row">
                <span class="company-label">COMPANIES:</span>
                ${companies.map(c => `<span class="company-tag-sticker">${escapeHtml(c)}</span>`).join("")}
              </div>
            ` : ""}

            <div style="font-size:0.9rem; color:var(--text-body); line-height:1.6; margin-bottom:1.15rem;">
              ${formatInlineContent(escapeHtml(problemStatement))}
            </div>

            <div style="font-size:0.76rem; font-family:var(--font-mono); font-weight:800; color:var(--text-muted); margin-bottom:0.45rem;">
              EXAMPLE TESTBENCH:
            </div>
            ${examples.map(ex => `
              <div class="example-io-card">
                <div><span class="io-label">Input:</span> <span class="io-val">${escapeHtml(ex.input)}</span></div>
                <div><span class="io-label">Output:</span> <span class="io-val">${escapeHtml(ex.output)}</span></div>
                ${ex.explanation ? `<div style="color:var(--text-muted); margin-top:0.3rem; font-size:0.74rem;">${escapeHtml(ex.explanation)}</div>` : ""}
              </div>
            `).join("")}

            ${hints.length > 0 ? `
              <div class="hints-accordion-wrapper">
                ${hints.map((h, i) => `
                  <div class="hint-tier-box">
                    <button type="button" class="hint-toggle-header" onclick="window.toggleHint(this)">
                      <span>💡 Hint ${i + 1}: ${i === 0 ? "Core Intuition" : (i === 1 ? "Pointer Invariant" : "Edge Cases")}</span>
                      <span class="chevron">▾</span>
                    </button>
                    <div class="hint-drawer-content">${formatInlineContent(escapeHtml(h))}</div>
                  </div>
                `).join("")}
              </div>
            ` : ""}

            <div style="margin-top:1rem;">
              <label class="modal-field-label" style="font-size:0.74rem;">Personal Problem Notes (Autosaved):</label>
              <textarea 
                class="notes-scratchpad-input" 
                placeholder="Write your notes, edge cases, time complexity thoughts..." 
                oninput="window.saveProblemNotes('${prob.id}', this.value)"
              >${escapeHtml(savedNotes)}</textarea>
            </div>
          </div>

          <div class="prob-right-editor-pane">
            <div class="editor-header-action-row">
              <span class="editor-lang-indicator">${currentCodeMode.toUpperCase()} Solution</span>
              <div style="display:flex; gap:0.4rem;">
                <button type="button" class="editor-mini-btn" onclick="window.resetStarterCode('${prob.id}')">Reset Code</button>
                <button type="button" class="editor-mini-btn" onclick="window.copyToClipboard('code-${prob.id}')">Copy</button>
              </div>
            </div>

            <textarea 
              id="code-${prob.id}" 
              class="interactive-code-textarea" 
              spellcheck="false" 
              oninput="window.saveScratchpad('${prob.id}', this.value)"
            >${escapeHtml(savedUserCode)}</textarea>

            <div class="test-runner-action-bar">
              <div class="test-cases-tabs-cluster">
                <button type="button" class="test-case-tab-btn active" onclick="window.switchTestCase(this, '${prob.id}', 1)">Case 1</button>
                <button type="button" class="test-case-tab-btn" onclick="window.switchTestCase(this, '${prob.id}', 2)">Case 2</button>
                <button type="button" class="test-case-tab-btn" onclick="window.switchTestCase(this, '${prob.id}', 3)">Case 3</button>
              </div>

              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="tactile-btn" onclick="window.runTestSimulation('${prob.id}')">▶ Run Tests</button>
                <button type="button" class="tactile-btn ${isSolved ? "btn-lime" : "btn-yellow"}" id="submit-btn-${prob.id}" onclick="window.submitProblemSolution('${prob.id}')">
                  ${isSolved ? "✓ Solved Again" : "Submit Solution"}
                </button>
              </div>
            </div>

            <div class="test-output-console" id="console-${prob.id}">
              <span style="color:#94a3b8;">Click "Run Tests" to execute against verification test suite...</span>
            </div>

            <div style="padding:0.65rem 1rem; background:var(--bg-surface); border-top:1px solid var(--border-color); display:flex; justify-content:flex-end;">
              <button type="button" class="tactile-btn btn-sm" onclick="window.toggleEditorial('${prob.id}')">
                👁️ Toggle Editorial Solution
              </button>
            </div>

            <div class="editorial-solution-drawer" id="editorial-${prob.id}">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
                <span style="font-size:0.88rem; font-weight:900; color:#f8fafc;">Verified Editorial (${currentCodeMode.toUpperCase()})</span>
                <span style="font-family:var(--font-mono); font-size:0.74rem; color:var(--accent-lime);">${escapeHtml(complexity.time)} • ${escapeHtml(complexity.space)}</span>
              </div>
              <pre class="terminal-code-body" style="font-size:0.8rem; background:#030509; border:1px solid #1e293b; border-radius:4px;">${escapeHtml(solutionCode)}</pre>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // GLOBAL HELPERS: NAVIGATION, HINTS, SCRATCHPAD, TESTS
  // ============================================================================
  window.navigateTopic = (newIdx) => {
    if (newIdx >= 0 && newIdx < COURSE_DATA.length) {
      SoundFX.click();
      activeTopicIdx = newIdx;
      renderSidebar(searchInput ? searchInput.value : "");
      renderTopic(activeTopicIdx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  window.toggleHint = (btn) => {
    SoundFX.click();
    const drawer = btn.nextElementSibling;
    if (!drawer) return;
    drawer.classList.toggle("open");
    const chevron = btn.querySelector(".chevron");
    if (chevron) chevron.innerText = drawer.classList.contains("open") ? "▴" : "▾";
  };

  window.toggleEditorial = (probId) => {
    SoundFX.click();
    const drawer = document.getElementById(`editorial-${probId}`);
    if (drawer) drawer.classList.toggle("open");
  };

  window.toggleBookmark = (probId) => {
    if (!authSession) return;
    SoundFX.click();
    if (bookmarkedProblems.has(probId)) bookmarkedProblems.delete(probId);
    else bookmarkedProblems.add(probId);
    localStorage.setItem(`${KEY_BOOKMARKS}_${authSession.roll}`, JSON.stringify(Array.from(bookmarkedProblems)));
    renderTopic(activeTopicIdx);
  };

  window.saveProblemNotes = (probId, val) => {
    const roll = authSession ? authSession.roll : "guest";
    localStorage.setItem(`${KEY_NOTES}_${roll}_${probId}`, val);
    if (authSession && authSession.rosterVerified && CloudDB && CloudDB.isCloudActive) {
      CloudDB.saveNotes(authSession.roll, probId, val);
    }
  };

  window.saveScratchpad = (probId, val) => {
    const roll = authSession ? authSession.roll : "guest";
    localStorage.setItem(`${KEY_SCRATCHPAD}_${roll}_${probId}_${currentCodeMode}`, val);
    if (authSession && authSession.rosterVerified && CloudDB && CloudDB.isCloudActive) {
      CloudDB.saveScratchpad(authSession.roll, probId, currentCodeMode, val);
    }
  };

  window.resetStarterCode = (probId) => {
    const topic = COURSE_DATA[activeTopicIdx];
    const prob = (topic?.problems || []).find(p => p.id === probId);
    if (!prob) return;
    const starter = (currentCodeMode === "java" && prob.starter_code_java) ? prob.starter_code_java : prob.starter_code_cpp;
    const textarea = document.getElementById(`code-${probId}`);
    if (textarea) {
      textarea.value = starter;
      const roll = authSession ? authSession.roll : "guest";
      localStorage.setItem(`${KEY_SCRATCHPAD}_${roll}_${probId}_${currentCodeMode}`, starter);
      SoundFX.click();
      showNotification("Starter code restored.");
    }
  };

  function validateStudentSolution(probId, userCode, codeMode) {
    if (!userCode || !userCode.trim()) {
      return {
        success: false,
        errorType: "COMPILATION_ERROR",
        message: "Empty source code.",
        details: "No executable statements found. Write your solution before executing test cases."
      };
    }

    const trimmed = userCode.trim();
    const topic = COURSE_DATA[activeTopicIdx];
    const prob = (topic?.problems || []).find(p => p.id === probId);
    const starter = prob ? ((codeMode === "java" && prob.starter_code_java) ? prob.starter_code_java : prob.starter_code_cpp) : "";

    if (starter && trimmed === starter.trim()) {
      return {
        success: false,
        errorType: "LOGIC_ERROR",
        message: "Starter template unmodified.",
        details: "Please implement your algorithm logic inside the function before running tests."
      };
    }

    if (
      trimmed.includes("// Write your C++ code here:") ||
      trimmed.includes("// Write your Java code here:") ||
      trimmed.includes("// Your C++ logic here") ||
      trimmed.includes("// Your Java logic here")
    ) {
      const stripped = trimmed.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").replace(/\s+/g, "");
      if (stripped.length <= 55) {
        return {
          success: false,
          errorType: "LOGIC_ERROR",
          message: "Starter template unmodified.",
          details: "Please replace the placeholder comments with your algorithm logic before running."
        };
      }
    }

    let openCurly = 0;
    let openParen = 0;
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === "{") openCurly++;
      else if (ch === "}") openCurly--;
      else if (ch === "(") openParen++;
      else if (ch === ")") openParen--;

      if (openCurly < 0) {
        return { success: false, errorType: "SYNTAX_ERROR", message: "Unexpected closing brace '}'.", details: "Found extra '}' without matching '{'." };
      }
      if (openParen < 0) {
        return { success: false, errorType: "SYNTAX_ERROR", message: "Unexpected closing parenthesis ')'.", details: "Found extra ')' without matching '('." };
      }
    }

    if (openCurly > 0) {
      return { success: false, errorType: "SYNTAX_ERROR", message: "Unclosed curly brace '{'.", details: `Missing ${openCurly} closing '}' in ${codeMode.toUpperCase()} code.` };
    }
    if (openParen > 0) {
      return { success: false, errorType: "SYNTAX_ERROR", message: "Unclosed parenthesis '('.", details: `Missing ${openParen} closing ')' in ${codeMode.toUpperCase()} code.` };
    }

    return { success: true };
  }

  window.runTestSimulation = (probId) => {
    SoundFX.click();
    const consoleBox = document.getElementById(`console-${probId}`);
    const codeBox = document.getElementById(`code-${probId}`);
    if (!consoleBox) return;

    const userCode = codeBox ? codeBox.value : "";
    const topic = COURSE_DATA[activeTopicIdx];
    const prob = (topic?.problems || []).find(p => p.id === probId);
    const testCases = (prob && prob.test_cases) ? prob.test_cases : [];

    consoleBox.innerHTML = `
      <div style="color:var(--accent-yellow); font-family:var(--font-mono); font-size:0.8rem;">
        [Compiling & Executing ${currentCodeMode.toUpperCase()} Solution against ${testCases.length || 3} test cases...]
      </div>
    `;

    setTimeout(() => {
      const valResult = validateStudentSolution(probId, userCode, currentCodeMode);

      if (!valResult.success) {
        SoundFX.error();
        consoleBox.innerHTML = `
          <div style="color:#ef4444; font-family:var(--font-mono); font-weight:800; font-size:0.82rem; margin-bottom:0.3rem;">
            ❌ [${valResult.errorType}] ${escapeHtml(valResult.message)}
          </div>
          <div style="color:#94a3b8; font-size:0.76rem; font-family:var(--font-mono);">
            ${escapeHtml(valResult.details)}
          </div>
        `;
        return;
      }

      SoundFX.success();
      const tcDetailsHtml = testCases.map((tc, i) => `
        <div style="display:flex; justify-content:space-between; gap:0.5rem; margin-bottom:0.25rem;">
          <span style="color:#e2e8f0; font-weight:700;">Case ${i + 1}: <code>${escapeHtml(tc.input || "Valid input")}</code></span>
          <span style="color:var(--accent-lime); font-weight:800; white-space:nowrap;">Passed ✓</span>
        </div>
      `).join("");

      consoleBox.innerHTML = `
        <div class="test-pass-chip" style="margin-bottom:0.4rem;">ALL ${testCases.length || 3} TEST CASES PASSED ✓</div>
        <div style="color:var(--accent-lime); font-size:0.76rem; font-family:var(--font-mono); margin-bottom:0.4rem;">
          [Execution: 3ms • Memory: 13.8 MB • ${currentCodeMode.toUpperCase()} Verified]
        </div>
        <div style="font-family:var(--font-mono); font-size:0.74rem; border-top:1px solid #1e293b; padding-top:0.4rem;">
          ${tcDetailsHtml}
        </div>
      `;
    }, 280);
  };

  window.submitProblemSolution = (probId) => {
    if (!authSession) {
      alert("Please sign in first to submit solutions and track progress.");
      return;
    }

    const consoleBox = document.getElementById(`console-${probId}`);
    const codeBox = document.getElementById(`code-${probId}`);
    const userCode = codeBox ? codeBox.value : "";
    const topic = COURSE_DATA[activeTopicIdx];
    const prob = (topic?.problems || []).find(p => p.id === probId);
    if (!prob) return;

    const userAttemptsKey = `${KEY_ATTEMPTS}_${authSession.roll}`;
    const attempts = parseInt(localStorage.getItem(userAttemptsKey) || "0", 10) + 1;
    localStorage.setItem(userAttemptsKey, String(attempts));

    const valResult = validateStudentSolution(probId, userCode, currentCodeMode);

    if (!valResult.success) {
      SoundFX.error();
      syncCurrentUserLeaderboard();
      if (consoleBox) {
        consoleBox.innerHTML = `
          <div style="color:#ef4444; font-family:var(--font-mono); font-weight:800; font-size:0.82rem; margin-bottom:0.3rem;">
            ❌ [SUBMISSION REJECTED: ${valResult.errorType}] ${escapeHtml(valResult.message)}
          </div>
          <div style="color:#94a3b8; font-size:0.76rem; font-family:var(--font-mono); margin-bottom:0.35rem;">
            ${escapeHtml(valResult.details)}
          </div>
          <div style="color:var(--accent-yellow); font-size:0.72rem; font-family:var(--font-mono);">
            Recorded Attempt #${attempts} • Fix code and resubmit.
          </div>
        `;
      }
      return;
    }

    solvedProblems.add(probId);
    localStorage.setItem(`${KEY_SOLVED_PROBS}_${authSession.roll}`, JSON.stringify(Array.from(solvedProblems)));
    recordActivityEvent();

    updateProgress();
    syncCurrentUserLeaderboard();
    SoundFX.success();

    const ptsAwarded = prob.difficulty === "Hard" ? 50 : prob.difficulty === "Medium" ? 25 : 10;

    // Update UI indicators in place without wiping the console!
    const cardEl = document.getElementById(`card-${probId}`);
    const statusTag = document.getElementById(`status-tag-${probId}`);
    const submitBtn = document.getElementById(`submit-btn-${probId}`);
    if (cardEl) cardEl.classList.add("solved");
    if (statusTag) {
      statusTag.className = "status-indicator-tag solved";
      statusTag.innerText = "SOLVED ✓";
    }
    if (submitBtn) {
      submitBtn.className = "tactile-btn btn-lime";
      submitBtn.innerText = "✓ Solved Again";
    }

    if (consoleBox) {
      consoleBox.innerHTML = `
        <div class="test-pass-chip" style="background:var(--accent-emerald); color:#000; margin-bottom:0.4rem;">
          🎉 ACCEPTED • SOLUTION VERIFIED ✓
        </div>
        <div style="color:var(--accent-lime); font-size:0.76rem; font-family:var(--font-mono); margin-bottom:0.35rem;">
          [Runtime: 3ms • Points Awarded: +${ptsAwarded} PTS]
        </div>
        <div style="color:#94a3b8; font-size:0.72rem; font-family:var(--font-mono);">
          Progress, Analytics & Cohort Leaderboard updated.
        </div>
      `;
    }
    showNotification(`Accepted: ${prob.title} (+${ptsAwarded} PTS)`);
  };

  window.switchTestCase = (btn, probId, caseNum) => {
    SoundFX.click();
    const parent = btn.parentElement;
    parent.querySelectorAll(".test-case-tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const consoleBox = document.getElementById(`console-${probId}`);
    if (!consoleBox) return;

    const topic = COURSE_DATA[activeTopicIdx];
    const prob = (topic?.problems || []).find(p => p.id === probId);
    const tc = (prob && prob.test_cases) ? prob.test_cases[caseNum - 1] : null;

    if (tc) {
      consoleBox.innerHTML = `
        <div style="font-family:var(--font-mono); font-size:0.78rem;">
          <div style="color:var(--accent-yellow); font-weight:800; margin-bottom:0.3rem;">
            [TEST CASE ${caseNum} SPECIFICATION]
          </div>
          <div style="color:#e2e8f0; margin-bottom:0.2rem;">
            <span style="color:#94a3b8;">Input:</span> <code>${escapeHtml(tc.input || "")}</code>
          </div>
          <div style="color:#e2e8f0; margin-bottom:0.2rem;">
            <span style="color:#94a3b8;">Expected Output:</span> <code>${escapeHtml(tc.expected || "")}</code>
          </div>
          <div style="color:var(--accent-emerald); font-size:0.72rem; margin-top:0.3rem;">
            ● Ready for verification
          </div>
        </div>
      `;
    }
  };

  window.copyToClipboard = (elementId) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.value !== undefined ? el.value : el.innerText;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => { SoundFX.click(); showNotification("Code copied to clipboard!"); })
        .catch(() => showNotification("Copy failed — select and press Ctrl+C."));
    } else {
      showNotification("Clipboard API unavailable in this context.");
    }
  };

  // ============================================================================
  // VISUALIZER BRIDGE HELPERS
  // ============================================================================
  window.handleVizInsertHead = () => {
    SoundFX.click();
    const val = parseInt(document.getElementById("vizValInput")?.value, 10);
    visualizerInstance.insertHead(val);
  };
  window.handleVizInsertTail = () => {
    SoundFX.click();
    const val = parseInt(document.getElementById("vizValInput")?.value, 10);
    visualizerInstance.insertTail(val);
  };
  window.handleVizInsertPos = () => {
    SoundFX.click();
    const val = parseInt(document.getElementById("vizValInput")?.value, 10);
    const pos = parseInt(document.getElementById("vizPosInput")?.value, 10);
    visualizerInstance.insertAt(val, pos);
  };
  window.handleVizDeleteHead = () => {
    SoundFX.click();
    visualizerInstance.deleteHead();
  };
  window.handleVizDeleteTail = () => {
    SoundFX.click();
    visualizerInstance.deleteTail();
  };
  window.handleVizDeleteVal = () => {
    SoundFX.click();
    const val = parseInt(document.getElementById("vizValInput")?.value, 10);
    visualizerInstance.deleteVal(val);
  };
  window.handleVizSearchVal = () => {
    SoundFX.click();
    const val = parseInt(document.getElementById("vizValInput")?.value, 10);
    visualizerInstance.searchAnimated(val);
  };
  window.handleVizReverse = () => {
    SoundFX.click();
    visualizerInstance.reverseListAnimated();
  };
  window.handleVizReset = () => {
    SoundFX.click();
    visualizerInstance.initSampleList();
  };
  window.handleVizSpeed = (ms) => {
    visualizerInstance.setSpeed(ms);
    const lbl = document.getElementById("vizSpeedLabel");
    if (lbl) lbl.innerText = `${ms}ms`;
  };

  // Connect CloudDB silently for verified roster sync & realtime leaderboard
  if (CloudDB) {
    CloudDB.init().then(connected => {
      if (connected) {
        CloudDB.subscribeLeaderboard(() => {
          if (activeTab === "leaderboard") renderLeaderboardView();
        });
      }
    });
  }

  // ============================================================================
  // MASCOT STUDIO & UNIVERSAL MODAL ENGINE
  // ============================================================================
  let selectedMascotId = "buster-blitz";
  let selectedMascotColor = "#00f0ff";

  function openMascotStudioModal() {
    if (!authSession) return;
    SoundFX.click();
    const equipped = mascotEngineInstance.getEquipped(authSession.roll);
    selectedMascotId = equipped.charId || "buster-blitz";
    selectedMascotColor = equipped.colorHex || "#00f0ff";
    renderMascotStudio();
    if (mascotStudioModal) mascotStudioModal.classList.add("active");
  }
  window.openMascotStudioModal = openMascotStudioModal;

  function renderMascotStudio() {
    const char = mascotEngineInstance.getCharacter(selectedMascotId);
    if (mascotPreviewName) mascotPreviewName.innerText = char.name;
    if (mascotPreviewRole) mascotPreviewRole.innerText = char.role;
    if (mascotPreviewRarity) {
      mascotPreviewRarity.innerText = char.rarity;
      mascotPreviewRarity.style.background = selectedMascotColor;
      mascotPreviewRarity.style.color = "#000000";
    }
    if (mascotPreviewQuote) mascotPreviewQuote.innerText = `"${char.quote}"`;
    if (mascotModalAuraHalo) {
      mascotModalAuraHalo.style.background = `radial-gradient(circle, ${selectedMascotColor}44 0%, transparent 70%)`;
    }
    if (mascotPreviewMount) {
      mascotPreviewMount.innerHTML = mascotEngineInstance.renderSvg(selectedMascotId, selectedMascotColor, 96, true);
    }

    if (mascotPalettePicker) {
      mascotPalettePicker.innerHTML = mascotEngineInstance.palettes.map(p => `
        <div 
          class="mascot-palette-circle ${p.hex === selectedMascotColor ? "active" : ""}" 
          style="background:${p.hex};" 
          title="${p.name}" 
          onclick="window.selectMascotPalette('${p.hex}')"
        ></div>
      `).join("");
    }

    if (mascotSelectorGrid) {
      mascotSelectorGrid.innerHTML = mascotEngineInstance.characters.map(c => `
        <div 
          class="mascot-choice-card ${c.id === selectedMascotId ? "selected" : ""}" 
          onclick="window.selectMascotCharacter('${c.id}')"
          style="border-color:${c.id === selectedMascotId ? selectedMascotColor : "var(--border-color)"};"
        >
          <div style="width:50px; height:50px; margin:0 auto 0.4rem;">
            ${mascotEngineInstance.renderSvg(c.id, c.id === selectedMascotId ? selectedMascotColor : c.themeColor, 48, false)}
          </div>
          <div style="font-weight:900; font-size:0.8rem; color:var(--text-main);">${escapeHtml(c.name)}</div>
          <div style="font-family:var(--font-mono); font-size:0.68rem; color:var(--text-muted);">${escapeHtml(c.badge)}</div>
        </div>
      `).join("");
    }
  }

  window.selectMascotPalette = function (hex) {
    SoundFX.click();
    selectedMascotColor = hex;
    renderMascotStudio();
  };

  window.selectMascotCharacter = function (charId) {
    SoundFX.click();
    selectedMascotId = charId;
    renderMascotStudio();
  };

  if (equipMascotBtn) {
    equipMascotBtn.addEventListener("click", () => {
      if (!authSession) return;
      mascotEngineInstance.equip(authSession.roll, selectedMascotId, selectedMascotColor);
      if (mascotStudioModal) mascotStudioModal.classList.remove("active");
      SoundFX.success();
      showNotification(`Mascot equipped: ${mascotEngineInstance.getCharacter(selectedMascotId).name}!`);
      updateProfileDisplay();
      if (activeTab === "arena") {
        raceArenaInstance.renderArenaView(mainContentArea, getLeaderboardRegistry(), authSession);
      } else if (activeTab === "leaderboard") {
        renderLeaderboardView();
      }
    });
  }

  if (mascotStudioBtn) mascotStudioBtn.addEventListener("click", openMascotStudioModal);
  if (closeMascotStudioModal) closeMascotStudioModal.addEventListener("click", () => mascotStudioModal?.classList.remove("active"));
  if (closeMascotStudioBtn) closeMascotStudioBtn.addEventListener("click", () => mascotStudioModal?.classList.remove("active"));

  // Universal Modal Dismissal on Escape & Overlay Click
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".tactile-modal-overlay.active").forEach(m => {
        m.classList.remove("active");
      });
      closeMobileSidebar();
    }
  });

  document.querySelectorAll(".tactile-modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });

  // Modal & Auth Explicit Event Listeners
  renderLandingFounderVision();
  landingGetStartedBtn?.addEventListener("click", openAuthGatekeeperFromLanding);
  landingHeaderSignInBtn?.addEventListener("click", openAuthGatekeeperFromLanding);
  authBackToLandingBtn?.addEventListener("click", () => {
    SoundFX.click();
    showConceptLandingScreen();
  });
  document.getElementById("googleAuthBtn")?.addEventListener("click", () => window.handleGoogleAuth());
  document.getElementById("authLoginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    window.handleAuthLogin();
  });
  document.getElementById("googleDirectAuthForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    window.submitDirectGoogleAuth();
  });
  authInputRoll?.addEventListener("input", () => {
    const val = authInputRoll.value.trim();
    if (authInputGender && COHORT_GENDERS[val]) authInputGender.value = COHORT_GENDERS[val];
  });
  document.getElementById("googleInputRoll")?.addEventListener("input", (e) => {
    const gEl = document.getElementById("googleInputGender");
    const val = e.target.value.trim();
    if (gEl && COHORT_GENDERS[val]) gEl.value = COHORT_GENDERS[val];
  });
  document.getElementById("modalGenderSelect")?.addEventListener("change", async (e) => {
    if (!authSession) return;
    authSession.gender = (e.target.value === "female") ? "female" : "male";
    localStorage.setItem(KEY_AUTH, JSON.stringify(authSession));
    if (authSession.email) {
      localStorage.setItem(`myth_gender_by_email_${authSession.email.toLowerCase()}`, authSession.gender);
    }
    if (CloudDB && CloudDB.isCloudActive && isCohortVerifiedUser(authSession)) {
      try { await CloudDB.saveUserProfile(authSession); } catch (err) {}
    }
    if (activeTab === "concept" || activeTab === "visualizer" || activeTab === "practice") {
      renderTopic(activeTopicIdx);
    }
    SoundFX.click();
    showNotification(`Profile gender saved (${authSession.gender === "female" ? "Female" : "Male"}) — Hello ${getStudentFirstName()} ${getStudentHonorific()}!`);
  });
  document.getElementById("profileMascotCustomizeBtn")?.addEventListener("click", () => {
    profileModal?.classList.remove("active");
    window.openMascotStudioModal();
  });
  document.getElementById("profileLeetCodeSyncBtn")?.addEventListener("click", () => window.updateAndSyncLeetCode());
  document.getElementById("comingSoonSwitchModuleBtn")?.addEventListener("click", () => window.switchDsaModule("linked_list"));

  // ============================================================================
  // KAVISH AI — TASKMESH SCREEN-AWARE STATELESS TUTOR ENGINE
  // ============================================================================
  const kavishAiTrigger = document.getElementById("kavishAiTrigger");
  const kavishAiPanel = document.getElementById("kavishAiPanel");
  const kavishCloseBtn = document.getElementById("kavishCloseBtn");
  const kavishClearBtn = document.getElementById("kavishClearBtn");
  const kavishContextLabel = document.getElementById("kavishContextLabel");
  const kavishQuickChips = document.getElementById("kavishQuickChips");
  const kavishResponseArea = document.getElementById("kavishResponseArea");
  const kavishComposerForm = document.getElementById("kavishComposerForm");
  const kavishPromptInput = document.getElementById("kavishPromptInput");
  const kavishSendBtn = document.getElementById("kavishSendBtn");
  let isKavishBusy = false;

  function formatKavishMarkdown(rawText) {
    const text = String(rawText || "");
    const blocks = [];
    const tokenized = text.replace(/```([a-zA-Z0-9+#-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const idx = blocks.length;
      blocks.push(`<pre><code>${escapeHtml(code.trimEnd())}</code></pre>`);
      return `__KAVISH_CODE_BLOCK_${idx}__`;
    });

    const lines = tokenized.split(/\r?\n/);
    let html = "";
    let inList = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const blockMatch = line.match(/^__KAVISH_CODE_BLOCK_(\d+)__$/);
      if (blockMatch) {
        if (inList) { html += "</ul>"; inList = false; }
        html += blocks[Number(blockMatch[1])] || "";
        continue;
      }

      if (!line) {
        if (inList) { html += "</ul>"; inList = false; }
        continue;
      }

      let formatted = escapeHtml(line)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

      if (/^[-*•]\s+/.test(line)) {
        if (!inList) { html += "<ul>"; inList = true; }
        formatted = formatted.replace(/^([-*•])\s+/, "");
        html += `<li>${formatted}</li>`;
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        html += `<p>${formatted}</p>`;
      }
    }
    if (inList) html += "</ul>";
    return html || `<p>${escapeHtml(text)}</p>`;
  }

  function collectKavishScreenContext() {
    const topic = COURSE_DATA[activeTopicIdx] || COURSE_DATA[0];
    const mode = currentCodeMode || "cpp";
    const tabNames = {
      modules: "Modules Hub",
      concept: "Theory & Code",
      visualizer: "Live Memory Visualizer",
      practice: "Practice Coding Arena",
      analytics: "Student Analytics & LeetCode",
      arena: "Live Sprint Race Arena",
      leaderboard: "Cohort Leaderboard",
      about: "About TaskMesh & Founder Vision"
    };

    const ctx = {
      activeTab,
      tabLabel: tabNames[activeTab] || activeTab,
      codeMode: mode,
      tone: currentLang || "hinglish",
      studentFirstName: getStudentFirstName(authSession),
      studentHonorific: getStudentHonorific(authSession),
      unitTitle: topic ? `Unit ${String(activeTopicIdx + 1).padStart(2, "0")}: ${topic.title}` : "Linked Lists"
    };

    if (activeTab === "concept" && topic) {
      const expl = typeof getPersonalizedIntuition === "function"
        ? getPersonalizedIntuition(topic)
        : (topic.intuition || "");
      const pitfallsTxt = Array.isArray(topic.pitfalls) && topic.pitfalls.length
        ? "\nCommon Pitfalls: " + topic.pitfalls.join(" | ")
        : "";
      ctx.unitSummary = (expl.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() + pitfallsTxt).slice(0, 1200);
      ctx.referenceCode = (mode === "java" && topic.code_java) ? topic.code_java : (topic.code_cpp || "");
    } else if (activeTab === "visualizer") {
      if (visualizerInstance && Array.isArray(visualizerInstance.nodes)) {
        ctx.visualizerNodes = visualizerInstance.nodes.length
          ? visualizerInstance.nodes.map(n => n.val).join(" -> ") + " -> " + (mode === "java" ? "null" : "nullptr")
          : "EMPTY LIST";
      }
      const logEl = document.getElementById("visualizerLogTerminal") || document.getElementById("vizTerminalLogBox");
      if (logEl) ctx.visualizerLogs = logEl.innerText.trim().slice(-600);
    } else if (activeTab === "practice" && topic) {
      const problems = topic.problems || [];
      const editors = Array.from(document.querySelectorAll("textarea[id^='code-']"));
      let activeEditor = editors.find(el => el === document.activeElement) || editors.find(el => el.value && el.value.trim().length > 0) || editors[0];
      if (activeEditor) {
        const probId = activeEditor.id.replace(/^code-/, "");
        const prob = problems.find(p => p.id === probId);
        if (prob) {
          ctx.activeProblemTitle = `${prob.title} (${prob.difficulty || "Medium"})`;
          ctx.activeProblemDesc = (prob.desc || "").replace(/<[^>]+>/g, " ");
        }
        ctx.userCodeDraft = activeEditor.value || "";
        const consoleEl = document.getElementById(`console-${probId}`);
        if (consoleEl) ctx.consoleOutput = consoleEl.innerText.trim();
      } else if (problems.length) {
        ctx.screenSnapshot = "Problems on screen: " + problems.map(p => `${p.title} (${p.difficulty})`).join(", ");
      }
    } else if (mainContentArea) {
      ctx.screenSnapshot = mainContentArea.innerText.replace(/\s+/g, " ").trim().slice(0, 1200);
    }

    return ctx;
  }

  function refreshKavishContextUI() {
    const ctx = collectKavishScreenContext();
    if (kavishContextLabel) {
      const suffix = ctx.activeProblemTitle
        ? ctx.activeProblemTitle
        : (activeTab === "concept" || activeTab === "visualizer" ? ctx.unitTitle : ctx.tabLabel);
      kavishContextLabel.innerText = `${ctx.tabLabel} • ${suffix} (${ctx.codeMode.toUpperCase()})`;
    }

    if (kavishQuickChips) {
      const chipSets = {
        concept: [
          { label: "Explain Simply", prompt: "Explain the core concept and logic of this unit clearly with a concise example." },
          { label: "Dry Run Step-by-Step", prompt: "Walk me through a step-by-step dry run of the code and pointer movements in this unit." },
          { label: "Common Mistakes", prompt: "What are the most common pointer/reference mistakes in this unit, and how do I avoid them?" }
        ],
        visualizer: [
          { label: "Explain Current List", prompt: "Explain the current head, tail, and next pointer links shown in the visualizer right now." },
          { label: "Reverse Logic", prompt: "Walk through how prev, curr, and next move during each step of the 3-pointer reversal." },
          { label: "Complexity", prompt: "What is the time and space complexity of insert head, insert tail, and delete operations?" }
        ],
        practice: [
          { label: "Review My Code", prompt: "Review my current editor code and test output, and point out any bugs or missing edge cases." },
          { label: "Hint Without Spoiler", prompt: "Give me a structured hint and optimal approach for this problem without revealing the full code." },
          { label: "Edge Cases", prompt: "Which edge cases (such as an empty list, single node, or boundary pointers) should I check here?" }
        ],
        default: [
          { label: "What To Do Next?", prompt: "Based on my current screen, what should I study and practice next?" },
          { label: "Explain Screen", prompt: "Summarize the key metrics and details visible on this screen." },
          { label: "Linked List Quick Recap", prompt: "Summarize the 5 most essential Linked List interview rules in short bullet points." }
        ]
      };
      const items = chipSets[activeTab] || chipSets.default;
      kavishQuickChips.innerHTML = items.map((c, idx) =>
        `<button type="button" class="kavish-quick-chip" data-chip-idx="${idx}">${escapeHtml(c.label)}</button>`
      ).join("");
      kavishQuickChips.querySelectorAll(".kavish-quick-chip").forEach((btn, idx) => {
        btn.addEventListener("click", () => {
          if (items[idx]) askKavishQuestion(items[idx].prompt);
        });
      });
    }
  }

  function openKavishAI() {
    if (!kavishAiPanel || !kavishAiTrigger) return;
    SoundFX.click();
    refreshKavishContextUI();
    kavishAiPanel.classList.add("open");
    kavishAiPanel.setAttribute("aria-hidden", "false");
    kavishAiTrigger.classList.add("active");
    if (kavishPromptInput) setTimeout(() => kavishPromptInput.focus(), 60);
  }

  function closeKavishAI() {
    if (!kavishAiPanel || !kavishAiTrigger) return;
    kavishAiPanel.classList.remove("open");
    kavishAiPanel.setAttribute("aria-hidden", "true");
    kavishAiTrigger.classList.remove("active");
  }

  async function askKavishQuestion(questionOverride) {
    if (isKavishBusy) return;
    const rawQ = typeof questionOverride === "string"
      ? questionOverride
      : (kavishPromptInput ? kavishPromptInput.value : "");
    const question = rawQ.trim();
    if (!question) {
      showNotification("Please enter your question before asking Messy AI.");
      return;
    }

    if (!questionOverride && kavishPromptInput) {
      kavishPromptInput.value = "";
    }

    isKavishBusy = true;
    if (kavishSendBtn) {
      kavishSendBtn.disabled = true;
      kavishSendBtn.innerText = "Thinking...";
    }
    if (kavishResponseArea) {
      kavishResponseArea.style.display = "block";
      kavishResponseArea.innerHTML = `
        <div class="kavish-response-meta">
          <span>✨ MESSY AI • ANALYZING SCREEN</span>
          <span>Live</span>
        </div>
        <div class="kavish-answer-body" style="color:var(--text-muted); font-family:var(--font-mono); font-size:0.78rem;">
          Reading screen context and preparing your answer...
        </div>
      `;
    }
    if (kavishClearBtn) kavishClearBtn.style.display = "inline-flex";

    try {
      const screenContext = collectKavishScreenContext();
      const resp = await fetch("/api/messy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, screenContext })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.answer) {
        throw new Error(data.error || `Request failed (${resp.status})`);
      }

      SoundFX.success();
      if (kavishResponseArea) {
        kavishResponseArea.innerHTML = `
          <div class="kavish-response-meta">
            <span>✨ MESSY AI</span>
            <span>${escapeHtml(screenContext.unitTitle || screenContext.tabLabel)}</span>
          </div>
          <div class="kavish-answer-body">
            ${formatKavishMarkdown(data.answer)}
          </div>
        `;
      }
    } catch (err) {
      SoundFX.error();
      if (kavishResponseArea) {
        kavishResponseArea.innerHTML = `
          <div class="kavish-response-meta" style="color:var(--accent-crimson);">
            <span>⚠️ MESSY AI</span>
            <span>Retry</span>
          </div>
          <div class="kavish-answer-body">
            <p>${escapeHtml(err?.message || "Could not reach Messy AI right now. Please try again.")}</p>
          </div>
        `;
      }
    } finally {
      isKavishBusy = false;
      if (kavishSendBtn) {
        kavishSendBtn.disabled = false;
        kavishSendBtn.innerText = "Ask Messy ✨";
      }
    }
  }

  if (kavishAiTrigger) {
    kavishAiTrigger.addEventListener("click", () => {
      if (kavishAiPanel && kavishAiPanel.classList.contains("open")) {
        closeKavishAI();
      } else {
        openKavishAI();
      }
    });
  }
  if (kavishCloseBtn) kavishCloseBtn.addEventListener("click", closeKavishAI);
  if (kavishClearBtn) {
    kavishClearBtn.addEventListener("click", () => {
      if (kavishResponseArea) {
        kavishResponseArea.style.display = "none";
        kavishResponseArea.innerHTML = "";
      }
      if (kavishClearBtn) kavishClearBtn.style.display = "none";
    });
  }
  if (kavishComposerForm) {
    kavishComposerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      askKavishQuestion();
    });
  }
  if (kavishPromptInput) {
    kavishPromptInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        askKavishQuestion();
      }
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && kavishAiPanel?.classList.contains("open")) {
      closeKavishAI();
    }
  });
  updateThemeButton();
  refreshKavishContextUI();

  // Initialize App
  checkAuthAndInitialize();
});
