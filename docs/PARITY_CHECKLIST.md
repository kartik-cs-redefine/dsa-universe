# Parity Verification Checklist

This checklist documents every user-facing feature of the MYTH DSA platform. During and after every migration step (such as the Vite & ES module refactoring), every item in this checklist must be manually or automatically verified to confirm zero functional regression.

---

## 1. Authentication & Session Gatekeeper
* [ ] **Roll & Name Authentication**:
  - Open app with clean session -> Gatekeeper modal appears.
  - Enter student name (e.g. `Kartik Kumar`), Roll Number (e.g. `2501640100454`), select Language Track (`C++`).
  - Submit form -> Modal closes smoothly, topbar displays student name and avatar initial `K`.
* [ ] **Google Popup Authentication**:
  - Click "Sign in with Google" button -> Firebase popup triggers.
  - If roll is not set, prompts for roll number, saves session, closes modal.
* [ ] **Session Persistence**:
  - Refresh browser -> User stays authenticated. No gatekeeper flash or reset.
* [ ] **User Logout**:
  - Click profile avatar in topbar -> Profile modal opens.
  - Click "Logout / Switch Student" -> Session clears, gatekeeper modal reappears.

---

## 2. Navigation & Modules Hub
* [ ] **Tab Switching**:
  - Switch between all tabs: `Concept`, `Visualizer`, `Practice`, `Analytics`, `Leaderboard`, `Roadmap`.
  - Active tab highlights with neon active state; view changes without error.
* [ ] **Stealth Tab Switchers**:
  - Stealth switchers at extreme screen edges work cleanly.
* [ ] **Modules Hub Grid**:
  - Click "Modules Hub" / "All Topics" -> Grid shows 15 DSA modules.
  - "Linked List" displays active pill ("ACTIVE MODULE").
  - Other 14 topics (Arrays, Trees, Graphs, DP, etc.) show "COMING SOON" badges.
  - Clicking "Linked List" smoothly navigates to the curriculum view.

---

## 3. Curriculum & Problem Solving Engine
* [ ] **Topic Navigation**:
  - Select subtopics (Singly, Doubly, Circular, Fast & Slow Pointers).
  - Problem list updates dynamically with difficulty tags (`Easy`, `Medium`, `Hard`).
* [ ] **Problem Detail & Test Runner**:
  - Click a problem -> Opens problem description, constraints, and starter code.
  - Click "Run Test Simulation" -> Test cases run, pass/fail status updates with audio feedback.
  - Solved problem checkmark increments local and cloud progress counter.
* [ ] **Scratchpad & Notes Persistence**:
  - Type custom code in Scratchpad editor -> Switch problem -> Return -> Code persists.
  - Add personal notes in "Notes" section -> Persists across reloads.

---

## 4. Interactive Linked List Visualizer
* [ ] **Memory Node Rendering**:
  - Visualizer canvas renders head pointer, nodes with memory addresses, values, and `next` pointers.
* [ ] **Operation: Insert Head**:
  - Enter value -> Click "Insert Head" -> New node prepends with pointer animation.
* [ ] **Operation: Insert Tail**:
  - Enter value -> Click "Insert Tail" -> New node appends with traversal trail.
* [ ] **Operation: Delete Node**:
  - Enter target value or index -> Node disconnects with bridge animation.
* [ ] **Operation: Reverse List**:
  - Click "Reverse List" -> 3-pointer visualizer highlights `prev`, `curr`, `next` step-by-step.
* [ ] **Speed & Playback Controls**:
  - Adjust speed slider -> Animation pauses, steps forward, or speeds up accurately.

---

## 5. Real-Time Race Arena
* [ ] **Race Modal Launch**:
  - Click "Race Arena" / "Challenge Peers" button in header or leaderboard.
  - Arena modal opens with spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`).
* [ ] **Multi-Lane Canvas Animation**:
  - Canvas renders multiple tracks with mascots running toward the finish line.
  - Speed is tied to student solved count and racing boost multiplier.
* [ ] **Boost Mechanics & Finish**:
  - Tap spacebar or "Boost" button -> Mascot performs acceleration surge with audio burst.
  - Finish line triggers winner banner and updates race standing.

---

## 6. Dynamic Character Mascot Studio
* [ ] **Mascot Modal Launch**:
  - Click "Mascot Studio" button in topbar.
  - 3D/2D layered canvas renders the customizable student mascot.
* [ ] **Palette & Customization**:
  - Select color themes (Neon Cyber, Retro Amber, Obsidian Gold, Matrix Emerald).
  - Toggle accessories (Headband, Cyber Goggles, Neon Cape).
  - Canvas updates in real time.
* [ ] **Equip & Persistence**:
  - Click "Equip Mascot" -> Updates profile badge and avatar in race arena.
  - Saved to `localStorage` and synced to Firestore.

---

## 7. Real LeetCode Profile Synchronization
* [ ] **Handle Connection**:
  - Open LeetCode modal -> Enter real LeetCode username (e.g. `kartikkumar`).
  - Click "Sync & Connect Account".
* [ ] **Live GraphQL Data Fetching**:
  - Retrieves real solved count (Total, Easy, Medium, Hard), global ranking, and acceptance rate.
  - No dummy/mock filler numbers.
* [ ] **Activity & Heatmap Graph**:
  - LeetCode submission calendar renders genuine green intensity squares matching user activity.
* [ ] **Cache & Revalidate**:
  - Data caches locally for instant load and refreshes gracefully without rate-limiting.

---

## 8. Global Leaderboard & Composite Ranking
* [ ] **80/20 Composite Ranking Formula**:
  - Composite points calculate as: $\text{Rank Points} = \text{round}(0.80 \times \text{LC\_Points} + 0.20 \times \text{MYTH\_Points})$.
  - Table sorts in strictly descending order of Composite Points.
* [ ] **Real Student Verification**:
  - Highlights currently logged-in student row with "YOU" neon sticker.
  - Search filter dynamically filters students by name or roll number.

---

## 9. Audio Effects Synthesizer
* [ ] **Web Audio API Engine**:
  - Button click triggers subtle tactile blip.
  - Problem solved triggers harmonic success chord.
  - Race boost triggers rapid synthesizer frequency sweep.
  - Audio initializes without browser policy autoplay blockages.

---

## 10. Modals, Physics & Keyboard Navigation
* [ ] **Spring Physics**:
  - Modals enter with smooth spring scale and exit without jitter.
* [ ] **Keyboard Accessibility**:
  - Pressing `Escape` key closes whichever modal is open.
  - Clicking dark backdrop overlay dismisses modal cleanly.
