# Firestore Security & Deployment Guide

This document outlines the security architecture and deployment procedure for the Cloud Firestore rules securing the MYTH DSA platform.

---

## 1. Security Audit & Threat Model

Prior to this hardening, the platform lacked an explicit `firestore.rules` definition, exposing the system to:
1. **Unrestricted Writes**: Any client could overwrite or wipe another student's progress or notes.
2. **Score Spoofing**: Malicious requests could submit arbitrarily inflated `lcSolved` or `compositePoints` directly to `myth_leaderboard`.
3. **Data Leakage**: Private student scratchpad code and notes could be read if rules were set to default public read.

### Enforced Rules Architecture (`firestore.rules`):
- **Authentication Required (`isAuthenticated()`)**: Anonymous or authenticated session required for writes.
- **Per-User Document Ownership (`isOwner(roll)`)**: Students can only write to their own profile, progress record, and leaderboard slot matching their authenticated identity.
- **Strict Data Validation**:
  - `name`: String, 1–80 characters.
  - `roll`: String, 1–40 characters, must strictly equal the document ID.
  - `leetcode`: String, max 60 characters.
  - `codeMode`: Restricted to `'cpp' | 'java'`.
  - `lcSolved`: Number between `0` and `5000`.
  - `platformSolved`: Number between `0` and `500`.
  - `compositePoints`: Non-negative number.
  - `code` & `notes`: String bounds (50 KB max for scratchpad, 20 KB for notes).
- **Private Data Isolation**: `myth_scratchpads` and `myth_notes` are strictly scoped to the document owner (`isDocKeyOwner(docKey)`).
- **Default Deny**: All unmapped collections (`match /{document=**}`) have `allow read, write: if false;`.

---

## 2. Deployment Instructions

### Method A: Deploy via Firebase CLI (Recommended)

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Authenticate with Google**:
   ```bash
   firebase login
   ```

3. **Select / Link Your Firebase Project**:
   ```bash
   firebase use <YOUR_FIREBASE_PROJECT_ID>
   ```

4. **Deploy Rules to Production**:
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Verify in Terminal**:
   The CLI will output:
   ```text
   ✔  firestore: released rules firestore.rules to cloud.firestore
   ```

---

### Method B: Deploy via Firebase Web Console

If you do not have the Firebase CLI installed:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. In the left navigation, click **Build** -> **Firestore Database**.
4. Click the **Rules** tab at the top.
5. Copy the entire contents of [`firestore.rules`](../firestore.rules) from this repository.
6. Paste into the console editor.
7. Click **Publish**.

---

## 3. Local Testing & Validation

To test rules locally without affecting production data:
```bash
firebase emulators:start --only firestore
```
Run rule assertions against the local emulator port (`localhost:8080`).
