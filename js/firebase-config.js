/**
 * ============================================================================
 * MYTH Complete DSA Guide — Cloud Backend Configuration (Firebase)
 * ============================================================================
 * Is file me aapko apna Firebase Project config paste karna hai.
 * 
 * Kaise lena hai (2 Minute Setup):
 * 1. Go to: https://console.firebase.google.com/
 * 2. Click "Add Project" -> Project ka name do: "myth-dsa-guide" -> Continue
 * 3. Project banne ke baad, "Web" icon (</>) par click karo -> App Register karo.
 * 4. Jo "firebaseConfig" object milega, uske values yaha paste kar do:
 */

window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Check if user has saved custom config in browser or if valid config exists
(function() {
  const saved = localStorage.getItem("myth_firebase_custom_config");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.projectId && parsed.apiKey) {
        window.FIREBASE_CONFIG = parsed;
      }
    } catch (e) {
      console.warn("Invalid saved custom Firebase config:", e);
    }
  }
})();
