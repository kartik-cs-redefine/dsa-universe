/**
 * ============================================================================
 * MYTH Complete DSA Guide — CharacterVerse & Mascot System
 * ============================================================================
 * High-fidelity animated mascot avatars representing students on the platform,
 * on the Leaderboard podium, in the student profile, and running in the Race Arena.
 */

(function(window) {
  "use strict";

  const MASCOT_CHARACTERS = [
    {
      id: "buster-blitz",
      name: "Buster Blitz",
      role: "Urban SDE Runner",
      rarity: "RARE",
      quote: "Catch me if your memory allocator can keep up!",
      themeColor: "#00f0ff", // Radiant Cyan
      badge: "⚡ SPEEDSTER",
      description: "Street racer with lightning-fast pointer traversal and dynamic heap allocation reflexes.",
      attributes: { agility: 96, dashSpeed: 94, memorySafety: 90 }
    },
    {
      id: "nebula-nova",
      name: "Nebula Nova",
      role: "Cosmic Astral Architect",
      rarity: "LEGENDARY",
      quote: "The recursion stack doesn't wait for anyone, rookie.",
      themeColor: "#ffc700", // Divine Golden Amber
      badge: "👑 ASTRAL",
      description: "Star-forged algorithmic explorer cloaked in celestial amber aura and O(1) space optimization.",
      attributes: { agility: 92, dashSpeed: 98, memorySafety: 96 }
    },
    {
      id: "cyber-ronin",
      name: "Cyber Ronin",
      role: "High-Performance Samurai",
      rarity: "EPIC",
      quote: "One slice, zero memory leaks. Clean RAII discipline.",
      themeColor: "#10b981", // Emerald Green
      badge: "⚔️ SAMURAI",
      description: "Disciplined master of low-level C++ pointers, double pointers, and cache-friendly data structures.",
      attributes: { agility: 95, dashSpeed: 91, memorySafety: 99 }
    },
    {
      id: "shadow-valkyrie",
      name: "Shadow Valkyrie",
      role: "Graph & Tree Sovereign",
      rarity: "MYTHIC",
      quote: "Floyd's cycle detection is child's play. Let's traverse the multiverse.",
      themeColor: "#a855f7", // Electric Violet
      badge: "🔮 SOVEREIGN",
      description: "Cosmic navigator of complex topological sorts, AVL rotations, and LRU cache architectures.",
      attributes: { agility: 94, dashSpeed: 95, memorySafety: 95 }
    }
  ];

  const MASCOT_PALETTES = [
    { name: "Radiant Cyan", hex: "#00f0ff", glow: "rgba(0, 240, 255, 0.4)" },
    { name: "Divine Amber", hex: "#ffc700", glow: "rgba(255, 199, 0, 0.4)" },
    { name: "Emerald Lime", hex: "#10b981", glow: "rgba(16, 185, 129, 0.4)" },
    { name: "Electric Violet", hex: "#a855f7", glow: "rgba(168, 85, 247, 0.4)" },
    { name: "Saffron Orange", hex: "#f97316", glow: "rgba(249, 115, 22, 0.4)" },
    { name: "Rose Crimson", hex: "#f43f5e", glow: "rgba(244, 63, 94, 0.4)" }
  ];

  class MascotEngine {
    constructor() {
      this.characters = MASCOT_CHARACTERS;
      this.palettes = MASCOT_PALETTES;
    }

    getCharacter(charId) {
      return this.characters.find(c => c.id === charId) || this.characters[0];
    }

    getEquipped(roll) {
      const saved = localStorage.getItem(`myth_mascot_equipped_${roll}`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
      return {
        charId: "buster-blitz",
        colorHex: "#00f0ff",
        auraActive: true
      };
    }

    equip(roll, charId, colorHex) {
      const payload = {
        charId: charId || "buster-blitz",
        colorHex: colorHex || "#00f0ff",
        auraActive: true,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`myth_mascot_equipped_${roll}`, JSON.stringify(payload));

      // Also persist to cloud if active
      if (window.CloudDB && window.CloudDB.isCloudActive) {
        window.CloudDB.saveUserProfile({
          roll,
          equippedMascot: payload
        });
      }
      return payload;
    }

    // High-fidelity animated SVG Mascot Renderer
    renderSvg(charId = "buster-blitz", colorHex = "#00f0ff", size = 80, isRunning = true) {
      const char = this.getCharacter(charId);
      const accent = colorHex || char.themeColor;
      const animClass = isRunning ? "mascot-running" : "mascot-idle";

      return `
        <svg class="myth-mascot-svg ${animClass}" width="${size}" height="${size}" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="auraGlow-${charId}" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="bodyGrad-${charId}" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="${accent}" />
            </linearGradient>
            <radialGradient id="visorGrad-${charId}">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="60%" stop-color="${accent}" />
              <stop offset="100%" stop-color="#0284c7" />
            </radialGradient>
          </defs>

          <!-- Ambient Aura Glow Circle -->
          <circle cx="50" cy="55" r="38" fill="none" stroke="${accent}" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.4" class="mascot-aura-ring" />

          <!-- Ground Shadow -->
          <ellipse cx="50" cy="112" rx="22" ry="4" fill="rgba(0,0,0,0.4)" class="mascot-shadow" />

          <!-- Back Cape / Cyber Wings -->
          <g class="mascot-cape">
            <path d="M42 45 L28 85 L44 80 Z" fill="${accent}" opacity="0.75" />
            <path d="M58 45 L72 85 L56 80 Z" fill="${accent}" opacity="0.75" />
          </g>

          <!-- Legs -->
          <g class="mascot-legs">
            <!-- Left Leg -->
            <g class="mascot-leg mascot-leg-left">
              <line x1="42" y1="72" x2="36" y2="98" stroke="#1e293b" stroke-width="7" stroke-linecap="round" />
              <!-- Cyber Boot -->
              <path d="M30 98 L42 98 L40 106 L26 106 Z" fill="${accent}" stroke="#000000" stroke-width="1.5" />
            </g>
            <!-- Right Leg -->
            <g class="mascot-leg mascot-leg-right">
              <line x1="58" y1="72" x2="64" y2="98" stroke="#0f172a" stroke-width="7" stroke-linecap="round" />
              <!-- Cyber Boot -->
              <path d="M58 98 L70 98 L68 106 L54 106 Z" fill="${accent}" stroke="#000000" stroke-width="1.5" />
            </g>
          </g>

          <!-- Torso & Armor Chestplate -->
          <g class="mascot-torso">
            <path d="M35 44 L65 44 L60 74 L40 74 Z" fill="#0f172a" stroke="#000000" stroke-width="2" />
            <!-- Glowing Core Crest -->
            <polygon points="50,49 57,59 50,68 43,59" fill="${accent}" filter="url(#auraGlow-${charId})" stroke="#000000" stroke-width="1" />
            <!-- Belt -->
            <rect x="38" y="70" width="24" height="5" fill="#334155" stroke="#000" stroke-width="1" />
          </g>

          <!-- Arms -->
          <g class="mascot-arms">
            <!-- Left Arm -->
            <g class="mascot-arm mascot-arm-left">
              <line x1="35" y1="48" x2="24" y2="68" stroke="#1e293b" stroke-width="5.5" stroke-linecap="round" />
              <circle cx="23" cy="70" r="4.5" fill="${accent}" stroke="#000" stroke-width="1" />
            </g>
            <!-- Right Arm -->
            <g class="mascot-arm mascot-arm-right">
              <line x1="65" y1="48" x2="76" y2="68" stroke="#1e293b" stroke-width="5.5" stroke-linecap="round" />
              <circle cx="77" cy="70" r="4.5" fill="${accent}" stroke="#000" stroke-width="1" />
            </g>
          </g>

          <!-- Head & Cyber Visor Helmet -->
          <g class="mascot-head">
            <rect x="36" y="16" width="28" height="26" rx="6" fill="#0f172a" stroke="#000000" stroke-width="2" />
            <!-- Neon Visor -->
            <rect x="39" y="24" width="22" height="9" rx="3" fill="url(#visorGrad-${charId})" filter="url(#auraGlow-${charId})" stroke="#000000" stroke-width="1" />
            <!-- Antenna / Crest -->
            <line x1="50" y1="16" x2="50" y2="8" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" />
            <circle cx="50" cy="7" r="2.5" fill="#ffffff" filter="url(#auraGlow-${charId})" />
            <!-- Ear Cyber Dampeners -->
            <rect x="33" y="23" width="3" height="10" rx="1.5" fill="${accent}" stroke="#000" stroke-width="1" />
            <rect x="64" y="23" width="3" height="10" rx="1.5" fill="${accent}" stroke="#000" stroke-width="1" />
          </g>
        </svg>
      `;
    }
  }

  window.MascotEngine = new MascotEngine();
})(window);
