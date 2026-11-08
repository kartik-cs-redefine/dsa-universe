# Firestore Security & Deployment Guide

This document outlines the security architecture, document ownership model, and deployment procedure for the Cloud Firestore rules securing the MYTH DSA platform.

---

## 1. Authentication & Identity Mapping Architecture

### How `request.auth` Maps to `roll`:
1. **Google Auth Provider (`firebase.auth.GoogleAuthProvider`)**:
   - Authenticated via `signInWithPopup(provider)`.
   - Produces a Firebase auth user where `request.auth.uid` is the Google account UID (e.g. `google:1082...`).
   - The student associates their university roll number (e.g. `2501640100454`) upon sign-in.
   - When writing to `myth_users/{roll}`, the client sets `uid: request.auth.uid` in the document.
   - The rule verifies:
     `resource.data.uid == request.auth.uid && request.resource.data.uid == request.auth.uid`
     This irreversibly locks the roll document to the Google account that initialized it. No other Google account can ever update or overwrite that roll document.

2. **Roll Number / Credentials Form**:
   - When a student enters their roll number and name without Google Auth, the client triggers Firebase Anonymous Authentication (`firebase.auth().signInAnonymously()`).
   - This provisions a cryptographically signed Firebase session with a persistent `request.auth.uid`.
   - On document creation, the record is locked to that UID (`uid: request.auth.uid`).
   - Any unauthenticated actor (`request.auth == null`) is rejected with permission denied.

---

## 2. Complete Inventory of Firestore Collections

The table below lists every collection and path touched across the entire codebase (`js/cloud-db.js`, `js/app.js`, `js/race-arena.js`, `js/mascot-system.js`):

| Collection Path | Read Rule | Write Rule | Fields Enforced | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `myth_users/{roll}` | `isAuthenticated()` | Owner only (`resource.data.uid == request.auth.uid`) | `name, roll, uid, updatedAt, email, leetcode, codeMode, langTrack` | Student profile, theme, and language track |
| `myth_progress/{roll}` | `isAuthenticated()` | Owner only (`resource.data.uid == request.auth.uid`) | `completedTopics, solvedProblems, bookmarkedProblems, updatedAt` | Checkmarked topics and solved coding challenges |
| `myth_leaderboard/{roll}` | Public (`true`) | Owner only (`resource.data.uid == request.auth.uid`) | `name, roll, lcSolved, platformSolved, compositePoints, updatedAt` | Public ranking table with 80/20 composite weighting |
| `myth_scratchpads/{docKey}` | Owner only (`isDocKeyOwner`) | Owner only (`isDocKeyOwner`) | `code, updatedAt` (max 50,000 chars) | In-browser C++/Java code editor scratchpads |
| `myth_notes/{docKey}` | Owner only (`isDocKeyOwner`) | Owner only (`isDocKeyOwner`) | `notes, updatedAt` (max 20,000 chars) | Private problem notes per user |
| **All other collections** (`/{document=**}`) | **DENY** (`false`) | **DENY** (`false`) | None | Intentional default-deny against unauthorized probing |

*Note on Race Arena and Mascot*: `race-arena.js` operates purely client-side/in-memory with simulated lane physics. `mascot-system.js` persists equipped skins to `localStorage` and saves the avatar string to `myth_users/{roll}` via `CloudDB.saveUserProfile()`. Neither touches any undocumented Firestore collection.

---

## 3. Known Limitations

> [!WARNING]
> **Client-Writable Score Fields (Known Limitation)**:
> In the current client-direct Firestore architecture (prior to Step 6 serverless proxy deployment):
> - Verified cohort members can write their own scores up to the enforced schema caps (`lcSolved <= 5000`, `platformSolved <= 500`, `compositePoints <= 10000`).
> - LeetCode statistics are fetched client-side and remain technically untrusted until Step 6 moves verification to a protected Vercel Serverless Function using the Firebase Admin SDK.

---

## 4. Deployment Instructions

### Option 1: Firebase CLI
```bash
# 1. Install CLI if not present
npm install -g firebase-tools

# 2. Login to Google
firebase login

# 3. Select project
firebase use <YOUR_FIREBASE_PROJECT_ID>

# 4. Deploy rules
firebase deploy --only firestore:rules
```

### Option 2: Firebase Web Console
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project -> **Firestore Database** -> **Rules**.
3. Replace the editor contents with [`firestore.rules`](../firestore.rules).
4. Click **Publish**.
