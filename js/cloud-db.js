/**
 * ============================================================================
 * MYTH Complete DSA Guide — Cross-Device Cloud Sync Engine (Firebase Firestore)
 * ============================================================================
 * Enables true multi-device persistence:
 * Any user logging in with their verified university Google Account automatically
 * recovers their solved problems, completed units, code scratchpads, personal notes,
 * and real-time live cohort ranking.
 */

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { FIREBASE_CONFIG } from "./firebase-config.js";

export class CloudDBEngine {
  constructor() {
    this.isCloudActive = false;
    this.auth = null;
    this.db = null;
    this.listeners = [];
    this.onStatusChangeCallbacks = [];
  }

  // Initialize Firebase
  async init() {
    const cfg = FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey || !cfg.projectId || cfg.apiKey.trim() === "") {
      console.info("[CloudDB] Firebase config not yet set. Operating in offline/setup mode.");
      this.notifyStatus(false, "Pending Config");
      return false;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(cfg);
      }
      this.auth = firebase.auth();
      this.db = firebase.firestore();

      // Enable offline cache persistence for instant offline loading
      try {
        await this.db.enablePersistence({ synchronizeTabs: true });
      } catch (err) {
        if (err.code === "failed-precondition") {
          console.warn("[CloudDB] Persistence failed: Multiple tabs open.");
        } else if (err.code === "unimplemented") {
          console.warn("[CloudDB] Persistence not supported by this browser.");
        }
      }

      this.isCloudActive = true;
      this.notifyStatus(true, "Connected to Firestore");
      console.log("✓ [CloudDB] Cross-Device Firebase Firestore Connected!");
      return true;
    } catch (err) {
      console.error("[CloudDB] Initialization error:", err);
      this.isCloudActive = false;
      this.notifyStatus(false, `Error: ${err.message}`);
      return false;
    }
  }

  onStatusChange(cb) {
    if (typeof cb === "function") this.onStatusChangeCallbacks.push(cb);
  }

  setSyncError(hasError, message = "") {
    this.hasSyncError = hasError;
    if (typeof document !== "undefined") {
      const banner = document.getElementById("cloudSyncAlertBanner");
      if (banner) {
        banner.style.display = hasError ? "inline-flex" : "none";
        if (message) banner.title = `Cloud Sync Failed: ${message}`;
      }
    }
    this.notifyStatus(!hasError, message || (hasError ? "Sync Failed" : "Synced"));
  }

  notifyStatus(isConnected, message) {
    this.onStatusChangeCallbacks.forEach(cb => {
      try { cb(isConnected, message); } catch (e) {}
    });
  }

  // Google Sign-In with real Firebase Popup (Single Root Identity)
  async loginWithGoogle() {
    if (!this.isCloudActive || !this.auth) {
      throw new Error("Firebase backend is not connected. Please paste Firebase configuration.");
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await this.auth.signInWithPopup(provider);
    return result.user;
  }

  getCurrentUser() {
    return this.auth?.currentUser || null;
  }

  // Verify whether the logged in student email exists in the roster
  async verifyRosterClaim(roll) {
    if (!this.isCloudActive || !this.db || !this.auth?.currentUser) return null;
    const email = (this.auth.currentUser.email || "").toLowerCase().trim();
    if (!email) throw new Error("No verified email associated with Google session.");
    try {
      const doc = await this.db.collection("myth_roster").doc(email).get();
      if (doc.exists) {
        const data = doc.data();
        if (data.roll === roll) {
          this.rosterName = data.name;
          return data;
        }
        throw new Error(`Your Google account (${email}) is enrolled under roll ${data.roll}, not ${roll}.`);
      }
      throw new Error(`Your Google account (${email}) is not enrolled in the verified student roster.`);
    } catch (err) {
      if (err.code === "permission-denied") {
        throw new Error("Your Google account is not enrolled in the verified student roster. Please contact the administrator.");
      }
      throw err;
    }
  }

  // Save student profile to Cloud Firestore
  async saveUserProfile(profile) {
    if (!profile || !profile.roll || !this.auth?.currentUser) return;
    const uid = this.auth.currentUser.uid;
    const payload = {
      name: profile.name,
      roll: profile.roll,
      uid: uid,
      email: this.auth.currentUser.email || profile.email || "",
      authProvider: "google",
      langTrack: profile.langTrack || "cpp",
      codeMode: profile.codeMode || "cpp",
      targetGoal: profile.targetGoal || "FAANG / Tier-1 SDE",
      leetcodeUser: profile.leetcodeUser || "",
      updatedAt: new Date().toISOString()
    };

    if (this.isCloudActive && this.db) {
      try {
        await this.db.collection("myth_users").doc(profile.roll).set(payload, { merge: true });
        this.setSyncError(false);
        console.log(`[CloudDB] Profile synced to cloud for ${profile.name} (${profile.roll})`);
      } catch (e) {
        this.setSyncError(true, e.message);
        console.warn("[CloudDB] Failed to save profile to Firestore:", e);
      }
    }
    // Also cache locally for instant offline hydration
    localStorage.setItem(`myth_cache_profile_${profile.roll}`, JSON.stringify(payload));
  }

  // Load student profile from Cloud Firestore
  async loadUserProfile(roll) {
    if (!roll) return null;
    if (this.isCloudActive && this.db && this.auth?.currentUser) {
      try {
        const doc = await this.db.collection("myth_users").doc(roll).get();
        if (doc.exists) {
          const data = doc.data();
          localStorage.setItem(`myth_cache_profile_${roll}`, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn("[CloudDB] Failed to load profile from Firestore:", e);
      }
    }
    const cached = localStorage.getItem(`myth_cache_profile_${roll}`);
    return cached ? JSON.parse(cached) : null;
  }

  // Sync completed topics and solved problems to Cloud Firestore
  async syncProgress(roll, progressData) {
    if (!roll || !this.auth?.currentUser) return;
    const uid = this.auth.currentUser.uid;
    const payload = {
      uid: uid,
      completedTopics: (progressData.completedTopics || []).slice(0, 100),
      solvedProblems: (progressData.solvedProblems || []).slice(0, 500),
      bookmarkedProblems: (progressData.bookmarkedProblems || []).slice(0, 200),
      updatedAt: new Date().toISOString()
    };

    if (this.isCloudActive && this.db) {
      try {
        await this.db.collection("myth_progress").doc(roll).set(payload, { merge: true });
        this.setSyncError(false);
        console.log(`[CloudDB] Progress synced to cloud for ${roll}`);
      } catch (e) {
        this.setSyncError(true, e.message);
        console.warn("[CloudDB] Progress sync failed:", e);
      }
    }

    localStorage.setItem(`myth_cache_progress_${roll}`, JSON.stringify(payload));
  }

  // Load student progress from Cloud Firestore
  async loadProgress(roll) {
    if (!roll) return null;
    if (this.isCloudActive && this.db && this.auth?.currentUser) {
      try {
        const doc = await this.db.collection("myth_progress").doc(roll).get();
        if (doc.exists) {
          const data = doc.data();
          localStorage.setItem(`myth_cache_progress_${roll}`, JSON.stringify(data));
          return {
            completedTopics: data.completedTopics || [],
            solvedProblems: data.solvedProblems || [],
            bookmarkedProblems: data.bookmarkedProblems || []
          };
        }
      } catch (e) {
        console.warn("[CloudDB] Load progress from Firestore failed:", e);
      }
    }

    const cached = localStorage.getItem(`myth_cache_progress_${roll}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          completedTopics: parsed.completedTopics || [],
          solvedProblems: parsed.solvedProblems || [],
          bookmarkedProblems: parsed.bookmarkedProblems || []
        };
      } catch (e) {}
    }
    return null;
  }

  // Sync student record to Global Leaderboard in Cloud Firestore (Keyed by UID, zero PII)
  async syncLeaderboardRecord(record) {
    if (!this.auth?.currentUser) return;
    const uid = this.auth.currentUser.uid;

    if (!this.rosterName && this.auth.currentUser.email && this.isCloudActive && this.db) {
      try {
        const email = (this.auth.currentUser.email || "").toLowerCase().trim();
        const doc = await this.db.collection("myth_roster").doc(email).get();
        if (doc.exists) {
          this.rosterName = doc.data().name;
        }
      } catch (err) {}
    }

    const payload = {
      uid: uid,
      name: this.rosterName || record.name,
      lcSolved: typeof record.lcSolved === "number" ? Math.min(record.lcSolved, 5000) : 0,
      lcEasy: typeof record.lcEasy === "number" ? record.lcEasy : 0,
      lcMedium: typeof record.lcMedium === "number" ? record.lcMedium : 0,
      lcHard: typeof record.lcHard === "number" ? record.lcHard : 0,
      lcRanking: typeof record.lcRanking === "number" ? record.lcRanking : 0,
      platformSolved: typeof record.platformSolved === "number" ? Math.min(record.platformSolved, 500) : 0,
      compositePoints: typeof record.compositePoints === "number" ? Math.min(record.compositePoints, 10000) : 0,
      badge: record.badge || "COHORT SDE",
      updatedAt: new Date().toISOString()
    };

    if (this.isCloudActive && this.db) {
      try {
        await this.db.collection("myth_leaderboard").doc(uid).set(payload, { merge: true });
        this.setSyncError(false);
      } catch (e) {
        this.setSyncError(true, e.message);
        console.warn("[CloudDB] Leaderboard sync failed:", e);
      }
    }

    // Local cache fallback
    const cached = JSON.parse(localStorage.getItem("myth_global_leaderboard_v4") || "[]");
    const idx = cached.findIndex(u => u.uid === uid || u.name === record.name);
    if (idx >= 0) cached[idx] = Object.assign({}, cached[idx], payload);
    else cached.push(payload);
    localStorage.setItem("myth_global_leaderboard_v4", JSON.stringify(cached));
  }

  // Real-time listener for Global Cohort Leaderboard
  subscribeLeaderboard(callback) {
    if (this.isCloudActive && this.db) {
      try {
        const unsubscribe = this.db.collection("myth_leaderboard")
          .onSnapshot((snapshot) => {
            const students = [];
            snapshot.forEach(doc => {
              students.push(doc.data());
            });
            localStorage.setItem("myth_global_leaderboard_v4", JSON.stringify(students));
            if (typeof callback === "function") callback(students);
          }, (err) => {
            console.warn("[CloudDB] Leaderboard real-time listener error:", err);
            const cached = JSON.parse(localStorage.getItem("myth_global_leaderboard_v4") || "[]");
            if (typeof callback === "function") callback(cached);
          });
        this.listeners.push(unsubscribe);
        return unsubscribe;
      } catch (e) {
        console.warn("[CloudDB] Subscribe leaderboard failed:", e);
      }
    }
    const cached = JSON.parse(localStorage.getItem("myth_global_leaderboard_v4") || "[]");
    if (typeof callback === "function") callback(cached);
    return () => {};
  }

  // Save Code Scratchpad (C++ or Java)
  async saveScratchpad(roll, probId, codeMode, codeText) {
    if (!roll || !probId || !this.auth?.currentUser) return;
    const uid = this.auth.currentUser.uid;
    const docKey = `${roll}_${probId}_${codeMode}`;
    const payload = {
      roll: roll,
      probId: probId,
      codeMode: codeMode,
      code: (codeText || "").slice(0, 50000),
      uid: uid,
      updatedAt: new Date().toISOString()
    };

    if (this.isCloudActive && this.db) {
      try {
        await this.db.collection("myth_scratchpads").doc(docKey).set(payload, { merge: true });
        this.setSyncError(false);
      } catch (e) {
        this.setSyncError(true, e.message);
      }
    }
    localStorage.setItem(`myth_scratchpad_${probId}_${codeMode}`, codeText);
  }

  async loadScratchpad(roll, probId, codeMode) {
    if (!roll || !probId) return null;
    const docKey = `${roll}_${probId}_${codeMode}`;
    if (this.isCloudActive && this.db && this.auth?.currentUser) {
      try {
        const doc = await this.db.collection("myth_scratchpads").doc(docKey).get();
        if (doc.exists) return doc.data().code;
      } catch (e) {}
    }
    return localStorage.getItem(`myth_scratchpad_${probId}_${codeMode}`);
  }

  // Save Personal Problem Notes
  async saveNotes(roll, probId, notesText) {
    if (!roll || !probId || !this.auth?.currentUser) return;
    const uid = this.auth.currentUser.uid;
    const docKey = `${roll}_${probId}`;
    const payload = {
      roll: roll,
      probId: probId,
      notes: (notesText || "").slice(0, 20000),
      uid: uid,
      updatedAt: new Date().toISOString()
    };

    if (this.isCloudActive && this.db) {
      try {
        await this.db.collection("myth_notes").doc(docKey).set(payload, { merge: true });
        this.setSyncError(false);
      } catch (e) {
        this.setSyncError(true, e.message);
      }
    }
    localStorage.setItem(`myth_notes_${probId}`, notesText);
  }

  async loadNotes(roll, probId) {
    if (!roll || !probId) return null;
    const docKey = `${roll}_${probId}`;
    if (this.isCloudActive && this.db && this.auth?.currentUser) {
      try {
        const doc = await this.db.collection("myth_notes").doc(docKey).get();
        if (doc.exists) return doc.data().notes;
      } catch (e) {}
    }
    return localStorage.getItem(`myth_notes_${probId}`);
  }
}

export const CloudDB = new CloudDBEngine();

if (typeof window !== "undefined") {
  window.CloudDB = CloudDB;
  window.firebase = firebase;
}
