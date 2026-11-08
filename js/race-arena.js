/**
 * ============================================================================
 * MYTH Complete DSA Guide — Live Multi-Lane Race Arena Engine
 * ============================================================================
 * Real-time 2D/3D visual sprint track where students race forward deterministically
 * based on verified solved questions (80% LeetCode + 20% MYTH Platform) towards a
 * target milestone with animated runner mascots, dust particles, and live HUD.
 */

(function(window) {
  "use strict";

  class RaceArenaEngine {
    constructor() {
      this.currentWeather = "obsidian"; // 'dawn' | 'obsidian' | 'golden'
      this.currentPace = "sprint"; // 'cruise' | 'sprint' | 'turbo'
      this.focusedRacerId = null;
      this.MIN_TARGET = 100;
    }

    calculateMilestone(solvedCounts = []) {
      const valid = solvedCounts.filter(c => Number.isFinite(c) && c >= 0);
      const max = valid.length ? Math.max(0, ...valid) : 0;
      if (max === 0) return this.MIN_TARGET;
      const padded = Math.ceil(max * 1.18);
      return Math.max(this.MIN_TARGET, Math.ceil(padded / 50) * 50);
    }

    buildRacerState(registry, activeUser) {
      let racersList = Array.isArray(registry) ? registry.filter(u => u && u.roll) : [];

      // Ensure active logged-in student is included
      if (activeUser && activeUser.roll && !racersList.some(u => u.roll === activeUser.roll)) {
        racersList.push({
          name: activeUser.name,
          roll: activeUser.roll,
          track: activeUser.langTrack || "cpp",
          leetcodeUser: activeUser.leetcodeUser || "",
          lcSolved: activeUser.lcSolved || 0,
          mythSolved: activeUser.mythSolved || 0,
          score: activeUser.score || 0
        });
      }

      // If still empty (no registered user yet), show active user placeholder
      if (racersList.length === 0 && activeUser) {
        racersList = [{
          name: activeUser.name,
          roll: activeUser.roll,
          track: activeUser.langTrack || "cpp",
          leetcodeUser: activeUser.leetcodeUser || "",
          lcSolved: 0,
          mythSolved: 0,
          score: 0
        }];
      }

      // Collect real solved counts (composite verified solved questions)
      const solvedList = racersList.map(u => (u.lcSolved || 0) + (u.mythSolved || u.acceptedSubmissions || 0));
      const targetMilestone = this.calculateMilestone(solvedList);

      const racers = racersList.map((user, idx) => {
        const solved = (user.lcSolved || 0) + (user.mythSolved || user.acceptedSubmissions || 0);
        const progressPct = Math.min(95, Math.max(4, Math.round((solved / targetMilestone) * 1000) / 10));
        const mascot = window.MascotEngine ? window.MascotEngine.getEquipped(user.roll) : { charId: "buster-blitz", colorHex: "#00f0ff" };

        return {
          id: user.roll,
          name: user.name,
          roll: user.roll,
          track: user.track || "cpp",
          leetcodeUser: user.leetcodeUser || "",
          solved,
          lcSolved: user.lcSolved || 0,
          mythSolved: user.mythSolved || user.acceptedSubmissions || 0,
          score: user.score || 0,
          progressPct,
          charId: mascot.charId || "buster-blitz",
          colorHex: mascot.colorHex || "#00f0ff",
          laneIndex: idx + 1,
          isUser: activeUser && user.roll === activeUser.roll
        };
      });

      // Sort racers by solved descending for standings
      racers.sort((a, b) => b.solved - a.solved);
      racers.forEach((r, i) => r.rank = i + 1);

      return { racers, targetMilestone };
    }

    renderArenaView(mountElement, registry, activeUser) {
      if (!mountElement) return;
      const { racers, targetMilestone } = this.buildRacerState(registry, activeUser);
      const leader = racers[0];

      // Pace multiplier animation classes
      const paceClass = `pace-${this.currentPace}`;
      const weatherClass = `weather-${this.currentWeather}`;

      mountElement.innerHTML = `
        <div class="race-arena-container ${weatherClass} ${paceClass}">
          <!-- Top HUD Control Bar -->
          <div class="race-arena-hud-bar">
            <div class="hud-left-group">
              <span class="arena-live-chip">
                <span class="arena-live-dot"></span> LIVE SPRINT CIRCUIT
              </span>
              <div class="hud-milestone-capsule">
                <span class="milestone-label">TARGET MILESTONE</span>
                <span class="milestone-value">${targetMilestone} Solved Questions 🏁</span>
              </div>
            </div>

            <div class="hud-controls-cluster">
              <!-- Pace Switcher -->
              <div class="hud-toggle-group">
                <button class="hud-toggle-btn ${this.currentPace === 'cruise' ? 'active' : ''}" onclick="window.RaceArenaInstance.setPace('cruise')">Cruise</button>
                <button class="hud-toggle-btn ${this.currentPace === 'sprint' ? 'active' : ''}" onclick="window.RaceArenaInstance.setPace('sprint')">⚡ Sprint</button>
                <button class="hud-toggle-btn ${this.currentPace === 'turbo' ? 'active' : ''}" onclick="window.RaceArenaInstance.setPace('turbo')">🔥 Turbo</button>
              </div>

              <!-- Weather Theme Switcher -->
              <div class="hud-toggle-group">
                <button class="hud-toggle-btn ${this.currentWeather === 'obsidian' ? 'active' : ''}" onclick="window.RaceArenaInstance.setWeather('obsidian')">🌙 Obsidian</button>
                <button class="hud-toggle-btn ${this.currentWeather === 'dawn' ? 'active' : ''}" onclick="window.RaceArenaInstance.setWeather('dawn')">☀️ Dawn</button>
                <button class="hud-toggle-btn ${this.currentWeather === 'golden' ? 'active' : ''}" onclick="window.RaceArenaInstance.setWeather('golden')">✨ Aura</button>
              </div>

              <!-- Customize Mascot Button -->
              <button class="tactile-btn btn-yellow" onclick="window.openMascotStudioModal()" style="padding:0.45rem 0.85rem; font-size:0.75rem;">
                🎭 Mascot Studio
              </button>
            </div>
          </div>

          <!-- Main Race Track Arena Grid -->
          <div class="race-arena-layout-grid">
            <!-- Left: Multi-Lane Athletics Running Track -->
            <div class="race-track-circuit-card">
              <!-- Distance Markers Overhead Bar -->
              <div class="track-distance-grid-ruler">
                <span>START (0m)</span>
                <span>25%</span>
                <span>50% (HALFWAY)</span>
                <span>75%</span>
                <span style="color:var(--accent-yellow); font-weight:900;">100% FINISH LINE 🏁</span>
              </div>

              <!-- Multi-Lane Sprint Area -->
              <div class="track-lanes-board" id="trackLanesBoard">
                ${racers.map(racer => this.renderRacerLane(racer, targetMilestone)).join("")}
              </div>
            </div>

            <!-- Right: Real-Time Standings & Telemetry -->
            <aside class="race-standings-card">
              <div class="standings-header-row">
                <div>
                  <h3 style="font-size:1.15rem; font-weight:900; color:var(--text-main); margin:0;">Live Circuit Standings</h3>
                  <p style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono); margin:2px 0 0;">
                    ${racers.length} Active Runners • Click runner to focus lane
                  </p>
                </div>
                <span class="standings-lap-tag">LAP 1/1</span>
              </div>

              <div class="standings-racers-scroll-list">
                ${racers.map(racer => {
                  const distFromLeader = racer.rank === 1 ? "Leader 👑" : `-${leader.solved - racer.solved} solved`;
                  const isFocused = this.focusedRacerId === racer.id;

                  return `
                    <div 
                      class="standings-racer-card ${racer.isUser ? 'current-user-card' : ''} ${isFocused ? 'focused-racer' : ''}" 
                      onclick="window.RaceArenaInstance.focusRacer('${racer.id}')"
                    >
                      <div class="standings-rank-badge rank-${racer.rank}">#${racer.rank}</div>
                      
                      <div class="standings-racer-avatar-mini" style="border-color:${racer.colorHex};">
                        ${window.MascotEngine ? window.MascotEngine.renderSvg(racer.charId, racer.colorHex, 32, false) : '🏃'}
                      </div>

                      <div class="standings-racer-meta">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                          <span class="standings-racer-name">
                            ${racer.name} ${racer.isUser ? '<span class="you-pill">YOU</span>' : ''}
                          </span>
                          <span class="standings-solved-number" style="color:${racer.colorHex}; font-weight:900;">
                            ${racer.solved} Q
                          </span>
                        </div>

                        <div class="standings-progress-frame">
                          <div class="standings-progress-bar" style="width:${racer.progressPct}%; background:${racer.colorHex};"></div>
                        </div>

                        <div style="display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:0.68rem; color:var(--text-muted); margin-top:3px;">
                          <span>${racer.progressPct}% track</span>
                          <span style="color:var(--accent-yellow); font-weight:800;">${distFromLeader}</span>
                        </div>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </aside>
          </div>
        </div>
      `;
    }

    renderRacerLane(racer, targetMilestone) {
      const isFocused = this.focusedRacerId === racer.id;
      const mascotSvg = window.MascotEngine 
        ? window.MascotEngine.renderSvg(racer.charId, racer.colorHex, 62, true)
        : '<div style="font-size:2rem;">🏃</div>';

      return `
        <div class="track-single-lane ${racer.isUser ? 'user-lane' : ''} ${isFocused ? 'focused-lane' : ''}" id="lane-${racer.id}">
          <!-- Lane Metadata Badge -->
          <div class="lane-identifier-badge">
            <span class="lane-number">L${racer.laneIndex}</span>
            <span class="lane-racer-rank">#${racer.rank}</span>
          </div>

          <!-- Ground Track Asphalt Strip with Guide Lines -->
          <div class="track-asphalt-ground">
            <div class="track-dashed-line"></div>
          </div>

          <!-- Moving Runner Unit -->
          <div class="track-runner-actor" style="left:${racer.progressPct}%;">
            <!-- Floating Overhead Pilot Tag -->
            <div class="runner-overhead-tag" style="border-color:${racer.colorHex};">
              <span class="runner-name-text">${racer.name} ${racer.isUser ? '(YOU)' : ''}</span>
              <span class="runner-telemetry">${racer.solved}/${targetMilestone} (${racer.progressPct}%)</span>
            </div>

            <!-- Sprint Dust Particle Cloud -->
            <div class="runner-dust-cloud"></div>

            <!-- Animated Mascot Sprite -->
            <div class="runner-mascot-mount">
              ${mascotSvg}
            </div>
          </div>
        </div>
      `;
    }

    setPace(pace) {
      this.currentPace = pace;
      const container = document.querySelector(".race-arena-container");
      if (container) {
        container.classList.remove("pace-cruise", "pace-sprint", "pace-turbo");
        container.classList.add(`pace-${pace}`);
      }
      document.querySelectorAll(".hud-toggle-group button").forEach(b => {
        if (b.innerText.toLowerCase().includes(pace)) b.classList.add("active");
        else if (["cruise", "sprint", "turbo"].some(p => b.innerText.toLowerCase().includes(p))) b.classList.remove("active");
      });
    }

    setWeather(weather) {
      this.currentWeather = weather;
      const container = document.querySelector(".race-arena-container");
      if (container) {
        container.classList.remove("weather-obsidian", "weather-dawn", "weather-golden");
        container.classList.add(`weather-${weather}`);
      }
      document.querySelectorAll(".hud-toggle-group button").forEach(b => {
        if (b.innerText.toLowerCase().includes(weather)) b.classList.add("active");
        else if (["obsidian", "dawn", "golden"].some(w => b.innerText.toLowerCase().includes(w))) b.classList.remove("active");
      });
    }

    focusRacer(racerId) {
      this.focusedRacerId = this.focusedRacerId === racerId ? null : racerId;
      const el = document.getElementById(`lane-${racerId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      document.querySelectorAll(".standings-racer-card").forEach(c => c.classList.remove("focused-racer"));
      document.querySelectorAll(".track-single-lane").forEach(l => l.classList.remove("focused-lane"));
      if (this.focusedRacerId) {
        const laneEl = document.getElementById(`lane-${this.focusedRacerId}`);
        if (laneEl) laneEl.classList.add("focused-lane");
      }
    }
  }

  window.RaceArenaInstance = new RaceArenaEngine();
})(window);
