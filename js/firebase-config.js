/**
 * ============================================================================
 * MYTH Complete DSA Guide — Cloud Backend Configuration (Firebase)
 * ============================================================================
 * Provides Firebase configuration via environment variables or manual fallback.
 */

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || ""
};

// Check if user has saved custom config in browser or if valid config exists
try {
  const saved = localStorage.getItem("myth_firebase_custom_config");
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.projectId && parsed.apiKey) {
      Object.assign(FIREBASE_CONFIG, parsed);
    }
  }
} catch (e) {
  console.warn("Invalid saved custom Firebase config:", e);
}

// Preserve window global for backwards compatibility during migration
if (typeof window !== "undefined") {
  window.FIREBASE_CONFIG = FIREBASE_CONFIG;
}
