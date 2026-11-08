/**
 * ============================================================================
 * MYTH Complete DSA Guide — Cross-Device Cloud Sync Engine (Firebase Firestore)
 * ============================================================================
 * Enables true multi-device persistence:
 * Any user logging in from laptop, mobile, or college lab with the same Roll Number
 * or Google Account automatically recovers their solved problems, completed units,
 * code scratchpads, personal notes, and real-time live cohort ranking.
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

  notifyStatus(isConnected, message) {
    this.onStatusChangeCallbacks.forEach(cb => {
      try { cb(isConnected, message); } catch (e) {}
    });
  }

  // Google Sign-In with real Firebase Popup
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

  // Anonymous sign-in for credentials path to ensure auth UID is established
  async ensureAuthenticatedSession() {
    if (this.isCloudActive && this.auth && !this.auth.currentUser) {
      try {
        await this.auth.signInAnonymously();
      } catch (e) {
        console.warn("[CloudDB] Anonymous auth fallback failed:", e);
      }
    }
  }

  getCurrentUser() {
    return this.auth?.currentUser || null;
  }

  // Save student profile to Cloud Firestore
  async saveUserProfile(profile) {
    if (!profile || !profile.roll) return;
    if (this.isCloudActive && this.db) {
      try {
        const uid = this.auth?.currentUser?.uid || `anon_${profile.roll}`;
        await this.db.collection("myth_users").doc(profile.roll).set({
          name: profile.name,
          roll: profile.roll,
          uid: uid,
          email: profile.email || "",
          authProvider: profile.authProvider || "credentials",
          langTrack: profile.langTrack || "cpp",
          targetGoal: profile.targetGoal || "FAANG / Tier-1 SDE",
          leetcodeUser: profile.leetcodeUser || "",
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log(`[CloudDB] Profile synced to cloud for ${profile.name} (${profile.roll})`);
      } catch (e) {
        console.warn("[CloudDB] Failed to save profile to Firestore:", e);
      }
    }
    // Also cache locally for instant offline hydration
    localStorage.setItem(`myth_cache_profile_${profile.roll}`, JSON.stringify(profile));
  }

  // Load student profile from Cloud Firestore
  async loadUserProfile(roll) {
    if (!roll) return null;
    if (this.isCloudActive && this.db) {
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
    if (!roll) return;
    const payload = {
      roll: roll,
      completedTopics: progressData.completedTopics || [],
      solvedProblems: progressData.solvedProblems || [],
      bookmarkedProblems: progressData.bookmarkedProblems || [],
      lastActive: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.isCloudActive && this.db) {
      try {
        if (this.auth?.currentUser) {
          payload.uid = this.auth.currentUser.uid;
        }
        await this.db.collection("myth_progress").doc(roll).set(payload, { merge: true });
        console.log(`[CloudDB] Progress synced to cloud for ${roll}`);
      } catch (e) {
        console.warn("[CloudDB] Progress sync failed:", e);
      }
    }

    // Always cache locally
    localStorage.setItem(`myth_cache_progress_${roll}`, JSON.stringify(payload));
  }

  // Load student progress from Cloud Firestore
  async loadProgress(roll) {
    if (!roll) return null;
    if (this.isCloudActive && this.db) {
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

    // Offline fallback from local cache
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

  // Sync student record to Global Leaderboard in Cloud Firestore
  async syncLeaderboardRecord(record) {
    if (!record || !record.roll) return;
    const payload = {
      roll: record.roll,
      name: record.name,
      leetcode: record.leetcode || "",
      lcSolved: typeof record.lcSolved === "number" ? record.lcSolved : 0,
      lcEasy: typeof record.lcEasy === "number" ? record.lcEasy : 0,
      lcMedium: typeof record.lcMedium === "number" ? record.lcMedium : 0,
      lcHard: typeof record.lcHard === "number" ? record.lcHard : 0,
      lcRanking: typeof record.lcRanking === "number" ? record.lcRanking : 0,
      platformSolved: typeof record.platformSolved === "number" ? record.platformSolved : 0,
      totalScore: typeof record.totalScore === "number" ? record.totalScore : 0,
      compositePoints: typeof record.compositePoints === "number" ? record.compositePoints : 0,
      lastActive: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.isCloudActive && this.db) {
      try {
        if (this.auth?.currentUser) {
          payload.uid = this.auth.currentUser.uid;
        }
        await this.db.collection("myth_leaderboard").doc(record.roll).set(payload, { merge: true });
      } catch (e) {
        console.warn("[CloudDB] Leaderboard sync failed:", e);
      }
    }

    // Local cache fallback
    const cached = JSON.parse(localStorage.getItem("myth_global_leaderboard_v4") || "[]");
    const idx = cached.findIndex(u => u.roll === record.roll);
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
    if (!roll || !probId) return;
    const docKey = `${roll}_${probId}_${codeMode}`;
    if (this.isCloudActive && this.db) {
      try {
        const uid = this.auth?.currentUser?.uid || `anon_${roll}`;
        await this.db.collection("myth_scratchpads").doc(docKey).set({
          roll,
          probId,
          codeMode,
          code: codeText,
          uid,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {}
    }
    localStorage.setItem(`myth_scratchpad_${probId}_${codeMode}`, codeText);
  }

  async loadScratchpad(roll, probId, codeMode) {
    if (!roll || !probId) return null;
    const docKey = `${roll}_${probId}_${codeMode}`;
    if (this.isCloudActive && this.db) {
      try {
        const doc = await this.db.collection("myth_scratchpads").doc(docKey).get();
        if (doc.exists) return doc.data().code;
      } catch (e) {}
    }
    return localStorage.getItem(`myth_scratchpad_${probId}_${codeMode}`);
  }

  // Save Personal Problem Notes
  async saveNotes(roll, probId, notesText) {
    if (!roll || !probId) return;
    const docKey = `${roll}_${probId}`;
    if (this.isCloudActive && this.db) {
      try {
        const uid = this.auth?.currentUser?.uid || `anon_${roll}`;
        await this.db.collection("myth_notes").doc(docKey).set({
          roll,
          probId,
          notes: notesText,
          uid,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {}
    }
    localStorage.setItem(`myth_notes_${probId}`, notesText);
  }

  async loadNotes(roll, probId) {
    if (!roll || !probId) return null;
    const docKey = `${roll}_${probId}`;
    if (this.isCloudActive && this.db) {
      try {
        const doc = await this.db.collection("myth_notes").doc(docKey).get();
        if (doc.exists) return doc.data().notes;
      } catch (e) {}
    }
    return localStorage.getItem(`myth_notes_${probId}`);
  }
}

export const CloudDB = new CloudDBEngine();

// Retain window global during parity migration
if (typeof window !== "undefined") {
  window.CloudDB = CloudDB;
  window.firebase = firebase;
}
