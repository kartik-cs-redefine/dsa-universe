/**
 * ============================================================================
 * MYTH Complete DSA Guide — Cross-Device Cloud Sync Engine (Firebase Firestore)
 * ============================================================================
 * Enables true multi-device persistence:
 * Any user logging in from laptop, mobile, or college lab with the same Roll Number
 * or Google Account automatically recovers their solved problems, completed units,
 * code scratchpads, personal notes, and real-time live cohort ranking.
 */

(function(window) {
  "use strict";

  class CloudDBEngine {
    constructor() {
      this.isCloudActive = false;
      this.auth = null;
      this.db = null;
      this.listeners = [];
      this.onStatusChangeCallbacks = [];
    }

    // Initialize Firebase
    async init() {
      if (!window.firebase) {
        console.warn("[CloudDB] Firebase SDK not loaded in DOM.");
        this.notifyStatus(false, "SDK Missing");
        return false;
      }

      const cfg = window.FIREBASE_CONFIG;
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

    // Save student profile to Cloud Firestore
    async saveUserProfile(profile) {
      if (!profile || !profile.roll) return;
      if (this.isCloudActive && this.db) {
        try {
          await this.db.collection("myth_users").doc(profile.roll).set({
            name: profile.name,
            roll: profile.roll,
            email: profile.email || "",
            authProvider: profile.authProvider || "credentials",
            langTrack: profile.langTrack || "cpp",
            targetGoal: profile.targetGoal || "FAANG / Tier-1 SDE",
            leetcodeUser: profile.leetcodeUser || "",
            lastLogin: new Date().toISOString()
          }, { merge: true });
          console.log(`[CloudDB] Profile synced to cloud for ${profile.name} (${profile.roll})`);
        } catch (e) {
          console.warn("[CloudDB] Failed to save profile to Firestore:", e);
        }
      }
      // Backup cache
      localStorage.setItem(`myth_cache_profile_${profile.roll}`, JSON.stringify(profile));
    }

    // Load student profile from Cloud Firestore
    async loadUserProfile(roll) {
      if (!roll) return null;
      if (this.isCloudActive && this.db) {
        try {
          const doc = await this.db.collection("myth_users").doc(roll).get();
          if (doc.exists) {
            return doc.data();
          }
        } catch (e) {
          console.warn("[CloudDB] Failed to load profile from Firestore:", e);
        }
      }
      const cached = localStorage.getItem(`myth_cache_profile_${roll}`);
      return cached ? JSON.parse(cached) : null;
    }

    // Save learning progress (topics, solved questions, attempts, streak)
    async saveUserProgress(roll, progressData) {
      if (!roll) return;
      const payload = {
        roll: roll,
        completedTopics: Array.from(progressData.completedTopics || []),
        solvedProblems: Array.from(progressData.solvedProblems || []),
        totalAttempts: progressData.totalAttempts || 0,
        score: progressData.score || 0,
        streak: progressData.streak || 1,
        accuracy: progressData.accuracy || 100,
        updatedAt: new Date().toISOString()
      };

      if (this.isCloudActive && this.db) {
        try {
          await this.db.collection("myth_progress").doc(roll).set(payload, { merge: true });
        } catch (e) {
          console.warn("[CloudDB] Failed to save progress to Firestore:", e);
        }
      }

      // Local backup cache
      localStorage.setItem(`myth_cache_progress_${roll}`, JSON.stringify(payload));
    }

    // Load learning progress across devices
    async loadUserProgress(roll) {
      if (!roll) return null;
      if (this.isCloudActive && this.db) {
        try {
          const doc = await this.db.collection("myth_progress").doc(roll).get();
          if (doc.exists) {
            const data = doc.data();
            return {
              completedTopics: new Set(data.completedTopics || []),
              solvedProblems: new Set(data.solvedProblems || []),
              totalAttempts: data.totalAttempts || 0,
              score: data.score || 0,
              streak: data.streak || 1,
              accuracy: data.accuracy || 100
            };
          }
        } catch (e) {
          console.warn("[CloudDB] Failed to load progress from Firestore:", e);
        }
      }

      const cached = localStorage.getItem(`myth_cache_progress_${roll}`);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          return {
            completedTopics: new Set(data.completedTopics || []),
            solvedProblems: new Set(data.solvedProblems || []),
            totalAttempts: data.totalAttempts || 0,
            score: data.score || 0,
            streak: data.streak || 1,
            accuracy: data.accuracy || 100
          };
        } catch (err) {}
      }
      return null;
    }

    // Sync individual leaderboard entry to global cloud collection
    async syncLeaderboardRecord(record) {
      if (!record || !record.roll) return;
      const payload = {
        name: record.name,
        roll: record.roll,
        track: record.track || "cpp",
        leetcodeUser: record.leetcodeUser || "",
        authProvider: record.authProvider || "credentials",
        easySolved: record.easySolved || 0,
        medSolved: record.medSolved || 0,
        hardSolved: record.hardSolved || 0,
        acceptedSubmissions: record.acceptedSubmissions || 0,
        totalAttempts: record.totalAttempts || 0,
        score: record.score || 0,
        streak: record.streak || 1,
        accuracy: record.accuracy || 100,
        lastActive: new Date().toISOString()
      };

      if (this.isCloudActive && this.db) {
        try {
          await this.db.collection("myth_leaderboard").doc(record.roll).set(payload, { merge: true });
        } catch (e) {
          console.warn("[CloudDB] Failed to sync leaderboard record:", e);
        }
      }

      // Also update local cache
      const cached = JSON.parse(localStorage.getItem("myth_global_leaderboard_v4") || "[]");
      const idx = cached.findIndex(u => u.roll === record.roll);
      if (idx >= 0) cached[idx] = payload;
      else cached.push(payload);
      cached.sort((a, b) => (b.score - a.score) || (b.accuracy - a.accuracy));
      localStorage.setItem("myth_global_leaderboard_v4", JSON.stringify(cached));
    }

    // Real-time listener for global student leaderboard (Live across entire cohort)
    listenGlobalLeaderboard(onUpdate) {
      if (this.isCloudActive && this.db) {
        try {
          const unsubscribe = this.db.collection("myth_leaderboard")
            .orderBy("score", "desc")
            .limit(100)
            .onSnapshot(snapshot => {
              const students = [];
              snapshot.forEach(doc => students.push(doc.data()));
              localStorage.setItem("myth_global_leaderboard_v4", JSON.stringify(students));
              if (typeof onUpdate === "function") onUpdate(students);
            }, err => {
              console.warn("[CloudDB] Leaderboard realtime listener error:", err);
            });
          this.listeners.push(unsubscribe);
          return;
        } catch (e) {
          console.warn("[CloudDB] Error creating leaderboard listener:", e);
        }
      }

      // Fallback local cache
      const cached = JSON.parse(localStorage.getItem("myth_global_leaderboard_v4") || "[]");
      if (typeof onUpdate === "function") onUpdate(cached);
    }

    // Save and load code scratchpads & notes across devices
    async saveScratchpad(roll, probId, codeMode, codeText) {
      if (!roll || !probId) return;
      const docKey = `${roll}_${probId}_${codeMode}`;
      if (this.isCloudActive && this.db) {
        try {
          await this.db.collection("myth_scratchpads").doc(docKey).set({
            roll,
            probId,
            codeMode,
            codeText,
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
          if (doc.exists) return doc.data().codeText;
        } catch (e) {}
      }
      return localStorage.getItem(`myth_scratchpad_${probId}_${codeMode}`);
    }

    async saveNotes(roll, probId, notesText) {
      if (!roll || !probId) return;
      const docKey = `${roll}_${probId}`;
      if (this.isCloudActive && this.db) {
        try {
          await this.db.collection("myth_notes").doc(docKey).set({
            roll,
            probId,
            notesText,
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
          if (doc.exists) return doc.data().notesText;
        } catch (e) {}
      }
      return localStorage.getItem(`myth_notes_${probId}`);
    }
  }

  window.CloudDB = new CloudDBEngine();
})(window);
