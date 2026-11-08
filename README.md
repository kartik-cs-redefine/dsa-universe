# MYTH Complete DSA Guide — Engineering Mastery (C++ & Java) ⚡

> **High-Performance Complete DSA Guide & Learning Engine**  
> Complete dual-language curriculum covering all fundamental and advanced algorithmic patterns from absolute zero to Tier-1 Software Engineering standards with live LeetCode account synchronization.

---

## 📍 Platform Location on Your Laptop
```
D:\cpp-linked-list-mastery
```

---

## 🚀 Quick Run Locally

### Option 1: Direct Double Click (Zero Friction)
1. Open Windows File Explorer and navigate to `D:\cpp-linked-list-mastery`.
2. Double-click `index.html`. It opens directly in Chrome / Edge / Brave with full functionality!

---

### Option 2: Local HTTP Server (Recommended)
Open PowerShell in the directory:
```powershell
cd "D:\cpp-linked-list-mastery"
python -m http.server 8000
```
Open in your browser:
👉 **`http://localhost:8000`**

Or using Node:
```powershell
npx serve .
```

---

## 🌐 Deploy to Vercel or GitHub Pages in 60 Seconds

### Vercel (1-Click CLI)
```powershell
cd "D:\cpp-linked-list-mastery"
npm install -g vercel  # if not installed
vercel
```
Follow the prompts (defaults are preconfigured in `vercel.json`).

### GitHub & GitHub Pages
```powershell
cd "D:\cpp-linked-list-mastery"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```
In GitHub Repo Settings -> Pages -> Source: `Deploy from branch main /root` -> Save.

---


---

## ☁️ Cross-Device Cloud Sync Setup (Firebase Firestore)

Aapka platform **Cross-Device Cloud Sync Engine** (`js/cloud-db.js`) ke sath configured hai. Agar koi student apne phone par ya kisi dusre laptop par login karega, toh uska purana saved data (solved problems, score, completed topics, scratchpad, notes) instantly restore ho jayega.

### 2-Minute Firebase Setup (Free Tier):
1. Go to: **[console.firebase.google.com](https://console.firebase.google.com/)**
2. Click **"Add project"** -> Name do: `myth-dsa-guide` -> Click Continue.
3. Left menu me jao -> **Build** -> **Firestore Database** -> Click **"Create database"** -> Select **"Start in test mode"** -> Done.
4. Left menu me jao -> **Build** -> **Authentication** -> Click **"Get started"** -> Sign-in method me **Google** select karo -> Enable & Save.
5. Project Settings (gear icon ⚙️) -> **General** -> Scroll down to **"Your apps"** -> Click Web icon `</>` -> App register karo.
6. Jo `firebaseConfig` object milega usse copy karo.
7. **Option A (In Browser)**: Platform open karo -> Topbar me **"Cloud: Standby"** button par click karo -> Config paste karo -> Click **"Save Config & Activate Cloud"**.
8. **Option B (In Code)**: `js/firebase-config.js` file me `window.FIREBASE_CONFIG` me paste kar do!

---

## 💎 MYTH Architecture & Core Features

### 1. Dual Language Engine (C++ & Java)
- **C++ Mode**: Pointers (`ListNode*`), manual memory (`new`, `delete`), `nullptr`, pass-by-pointer / reference, memory safety.
- **Java Mode**: Object references, JVM Garbage Collection, `null`, class definitions, reference copying vs deep copying.
- Instant switch in the topbar recalculates and updates all theory code blocks, dry-run diagrams, starter code, and verified solutions.

### 2. Multi-Tone Pedagogical Switching
- **Aap Ki Style (Hinglish Mentor)**: Witty, conversational banter, real-world analogies (train coaches, treasure hunts, railway loops), honest feedback, and personalized greetings using your name.
- **English (Formal Spec)**: Crisp, precise interview-ready explanations, invariants, and edge case breakdowns.
- **TL;DR (Rapid Revision)**: Compressed bullet points for last-minute exam recaps.

### 3. Compulsory Student Authentication (Zero Demo Preset)
- Secure gatekeeper modal enforces real student login (Full Name & Roll Number/Student ID).
- All progress, points, code drafts, and streak counts are strictly persisted per student in `localStorage`.
- Profile Hub modal displays student metrics and provides one-click **"Switch Student / Logout"**.

### 4. Realtime Student Leaderboard & Hall of Fame
- Multi-student scoring and ranking engine:
  - Easy Problem = 10 pts
  - Medium Problem = 25 pts
  - Hard Problem = 50 pts
  - Topic Module Completion = 40 pts
- Top 3 Podium with Trophy Badges (🥇 Gold, 🥈 Silver, 🥉 Bronze).
- Interactive ranking table highlighting the active user with a bright `YOU` badge.
- Instant search filter by name or roll number.

### 5. Live LeetCode Account Connect & Summary Feed
- User apna LeetCode profile link (e.g. `https://leetcode.com/u/kartikkumar/`) ya username enter karta hai.
- Live LeetCode Sync Hub:
  - Real-time Global Ranking (e.g. `#138,420`).
  - Total LeetCode Solved (Easy / Medium / Hard count).
  - LeetCode Acceptance Rate (e.g. `68.4%`).
  - Contest Rating & Tier Badge (`1685 - Knight`).
  - Live Recent Submissions Feed (Title, Accepted status, Language, Timestamp).
  - 1-Click `⚡ Sync LeetCode Now` button.
- Leaderboard me har student ke naam ke aage unka live LeetCode handle pill (`@username ↗`) display hota hai.

### 6. MYTH Performance Analytics & Contribution Heatmap
- Circular Donut Progress Ring with Easy, Medium, Hard breakdown bars.
- 16-Week (112-Day) interactive Code Execution & Submission Calendar Heatmap with hover tooltips.
- Day streak tracker (`🔥 Active Streak`), acceptance rate, and skill coverage matrix.

### 6. Multi-Domain DSA Roadmap (Scalable Platform Architecture)
- Comprehensive curriculum covering 7 core domains:
  1. 🔗 Linked Lists & Pointers [Active Track • 15 Modules • 42 Verified Problems]
  2. 📊 Arrays, Strings & Two Pointers [Upcoming]
  3. 🥞 Stacks, Queues & Monotonic Deques [Upcoming]
  4. 🌲 Binary Trees & BSTs [Upcoming]
  5. ⛰️ Heaps, Priority Queues & Greedy [Upcoming]
  6. 🕸️ Graphs, BFS/DFS & Disjoint Sets [Upcoming]
  7. 🧩 Dynamic Programming (0 to Master) [Upcoming]

### 7. Interactive Memory Visualizer
- Real-time physical node card animator:
  - Insert Head, Insert Tail, Insert at Position, Delete Value.
  - Animated step-by-step list reversal.
  - Realtime memory pointer trace terminal.

---

## 📚 Master Linked List Curriculum Covered
1. **Quick Revision**: Pointers, Dynamic Memory (`new`/`delete` vs `new`/GC), Struct vs Class
2. **Node Creation & Singly Linked List Basics**: Structure, Traversal, Printing
3. **Insertion & Deletion Operations**: Head, Tail, Position, Value, Edge Cases
4. **Searching & Length Calculation**: Iterative & Recursive
5. **Reverse a Linked List**: Iterative 3-pointer & Recursive stack frame trace
6. **Middle of Linked List**: Tortoise & Hare (Fast & Slow Pointers)
7. **Cycle Detection & Start Node**: Floyd's Cycle Algorithm & Mathematical Proof
8. **Merge Two Sorted Lists**: Iterative Dummy Node & Recursive Splice
9. **Remove Nth Node From End**: Fast-Slow Delay Window Technique
10. **Palindrome Linked List**: Middle split, reverse half, compare, restore
11. **Intersection of Two Linked Lists**: Length difference & dual pointer swap
12. **Doubly & Circular Linked Lists**: Prev pointer manipulation, split & traversal
13. **Master ListNode Implementations**: Driver code, memory leak prevention, testbench
14. **Dummy Node Technique & Master Patterns**: Sentinels, Tortoise & Hare, Multi-pointer
15. **Master Revision & Cheat Sheet**: Complexity matrix, golden rules, bug checklist

---

## 👥 Engineering Team & Authors
- **Kartik Kumar** — Lead Architect & Platform Engineer
- **Tanmay Awasthi** — Core Contributor & Algorithmic Design
- **Krish Chaddha** — Core Contributor & Systems Engineering

