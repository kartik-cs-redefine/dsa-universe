import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';

let testEnv;

const PROJECT_ID = 'myth-rules-test-v4';
const VICTIM_UID = 'google_user_victim_101';
const VICTIM_EMAIL = 'student1@university.example.edu';
const VICTIM_ROLL = '1000000000001';
const VICTIM_NAME = 'Example Student One';

const ATTACKER_UID = 'google_user_attacker_202';
const ATTACKER_EMAIL = 'attacker@external.example.com';
const ATTACKER_NAME = 'Eve External';

describe('Firestore Security Rules Emulator Suite', () => {
  beforeAll(async () => {
    const rulesPath = path.resolve(__dirname, '../firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: rules,
        host: '127.0.0.1',
        port: 8088
      }
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();

      // Seed verified student roster claim via admin context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('myth_roster').doc(VICTIM_EMAIL).set({
          roll: VICTIM_ROLL,
          email: VICTIM_EMAIL,
          name: VICTIM_NAME,
          provisionedAt: new Date().toISOString()
        });
      });
    }
  });

  it('1. POSITIVE CONTROL: Real CloudDB client-shaped payloads pass all collection rules', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // 1. Profile payload as produced by CloudDB.saveUserProfile()
    const profilePayload = {
      name: VICTIM_NAME,
      roll: VICTIM_ROLL,
      uid: VICTIM_UID,
      email: VICTIM_EMAIL,
      authProvider: 'google',
      langTrack: 'cpp',
      codeMode: 'cpp',
      targetGoal: 'FAANG / Tier-1 SDE',
      leetcodeUser: '',
      updatedAt: new Date().toISOString()
    };
    await assertSucceeds(
      victimDb.collection('myth_users').doc(VICTIM_ROLL).set(profilePayload, { merge: true })
    );

    // 2. Progress payload as produced by CloudDB.syncProgress()
    const progressPayload = {
      uid: VICTIM_UID,
      completedTopics: ['topic-1', 'topic-2'],
      solvedProblems: ['prob-1'],
      bookmarkedProblems: ['prob-1'],
      updatedAt: new Date().toISOString()
    };
    await assertSucceeds(
      victimDb.collection('myth_progress').doc(VICTIM_ROLL).set(progressPayload, { merge: true })
    );

    // 3. Leaderboard payload as produced by CloudDB.syncLeaderboardRecord()
    const leaderboardPayload = {
      uid: VICTIM_UID,
      name: VICTIM_NAME,
      lcSolved: 120,
      lcEasy: 55,
      lcMedium: 50,
      lcHard: 15,
      lcRanking: 150000,
      platformSolved: 25,
      compositePoints: 101,
      badge: 'COHORT SDE',
      updatedAt: new Date().toISOString()
    };
    await assertSucceeds(
      victimDb.collection('myth_leaderboard').doc(VICTIM_UID).set(leaderboardPayload, { merge: true })
    );

    // 4. Scratchpad payload as produced by CloudDB.saveScratchpad()
    const probId = 'prob-reverse-list';
    const codeMode = 'cpp';
    const scratchKey = `${VICTIM_ROLL}_${probId}_${codeMode}`;
    const scratchPayload = {
      roll: VICTIM_ROLL,
      probId: probId,
      codeMode: codeMode,
      code: 'ListNode* reverseList(ListNode* head) { return head; }',
      uid: VICTIM_UID,
      updatedAt: new Date().toISOString()
    };
    await assertSucceeds(
      victimDb.collection('myth_scratchpads').doc(scratchKey).set(scratchPayload, { merge: true })
    );

    // 5. Notes payload as produced by CloudDB.saveNotes()
    const notesKey = `${VICTIM_ROLL}_${probId}`;
    const notesPayload = {
      roll: VICTIM_ROLL,
      probId: probId,
      notes: '3-pointer reversal algorithm note',
      uid: VICTIM_UID,
      updatedAt: new Date().toISOString()
    };
    await assertSucceeds(
      victimDb.collection('myth_notes').doc(notesKey).set(notesPayload, { merge: true })
    );
  });

  it('2. LEGACY DOCS: Owner can successfully update legacy scratchpad and notes seeded without uid', async () => {
    const probId = 'prob-legacy-1';
    const codeMode = 'cpp';
    const scratchKey = `${VICTIM_ROLL}_${probId}_${codeMode}`;
    const notesKey = `${VICTIM_ROLL}_${probId}`;

    // Seed legacy documents WITHOUT uid field
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('myth_scratchpads').doc(scratchKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        codeMode: codeMode,
        code: '/* legacy code written before uid migration */',
        updatedAt: '2025-01-01T00:00:00.000Z'
      });

      await adminDb.collection('myth_notes').doc(notesKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        notes: 'legacy notes without uid',
        updatedAt: '2025-01-01T00:00:00.000Z'
      });
    });

    // Verified owner updates the legacy scratchpad with valid client payload
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    await assertSucceeds(
      victimDb.collection('myth_scratchpads').doc(scratchKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        codeMode: codeMode,
        code: '/* modern updated code */',
        uid: VICTIM_UID,
        updatedAt: new Date().toISOString()
      }, { merge: true })
    );

    await assertSucceeds(
      victimDb.collection('myth_notes').doc(notesKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        notes: 'modern updated notes',
        uid: VICTIM_UID,
        updatedAt: new Date().toISOString()
      }, { merge: true })
    );
  });

  it('3. SCHEMA STRICTNESS: Extra unwhitelisted fields are rejected by keys().hasOnly()', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Extra unwhitelisted field injected into user profile
    await assertFails(
      victimDb.collection('myth_users').doc(VICTIM_ROLL).set({
        name: VICTIM_NAME,
        roll: VICTIM_ROLL,
        uid: VICTIM_UID,
        evilInjectedField: 'hack', // REJECTED BY hasOnly()
        updatedAt: new Date().toISOString()
      })
    );

    // Extra unwhitelisted field injected into leaderboard
    await assertFails(
      victimDb.collection('myth_leaderboard').doc(VICTIM_UID).set({
        name: VICTIM_NAME,
        uid: VICTIM_UID,
        lcSolved: 100,
        platformSolved: 20,
        compositePoints: 80,
        unauthorizedTracker: 'malware', // REJECTED BY hasOnly()
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('4. MISSING-DOC READ: Reading a nonexistent own scratchpad succeeds without permission-denied', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    const nonExistentKey = `${VICTIM_ROLL}_prob-never-opened_cpp`;
    const docSnap = await victimDb.collection('myth_scratchpads').doc(nonExistentKey).get();
    expect(docSnap.exists).toBe(false);
  });

  it('5. ATTACK: Attacker overwriting victim\'s scratchpad is denied on both create and update paths', async () => {
    const probId = 'prob-cycle';
    const codeMode = 'cpp';
    const scratchKey = `${VICTIM_ROLL}_${probId}_${codeMode}`;

    // Seed victim's scratchpad
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    await victimDb.collection('myth_scratchpads').doc(scratchKey).set({
      roll: VICTIM_ROLL,
      probId: probId,
      codeMode: codeMode,
      code: 'legitimate victim code',
      uid: VICTIM_UID,
      updatedAt: new Date().toISOString()
    });

    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    // Attacker create path
    await assertFails(
      attackerDb.collection('myth_scratchpads').doc(`${VICTIM_ROLL}_prob-spoofed_cpp`).set({
        roll: VICTIM_ROLL,
        probId: 'prob-spoofed',
        codeMode: 'cpp',
        code: 'hacked code',
        uid: ATTACKER_UID,
        updatedAt: new Date().toISOString()
      })
    );

    // Attacker update path
    await assertFails(
      attackerDb.collection('myth_scratchpads').doc(scratchKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        codeMode: codeMode,
        code: 'overwritten code',
        uid: ATTACKER_UID,
        updatedAt: new Date().toISOString()
      }, { merge: true })
    );
  });

  it('6. ATTACK: Attacker writing victim\'s notes is denied', async () => {
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(
      attackerDb.collection('myth_notes').doc(`${VICTIM_ROLL}_prob-1`).set({
        roll: VICTIM_ROLL,
        probId: 'prob-1',
        notes: 'malicious note',
        uid: ATTACKER_UID,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('7. ATTACK: Client attempting to create or write to myth_roster is denied', async () => {
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(
      attackerDb.collection('myth_roster').doc(ATTACKER_EMAIL).set({
        roll: '1000000000099',
        email: ATTACKER_EMAIL,
        name: ATTACKER_NAME
      })
    );
  });

  it('8. ATTACK: Non-roster Google user cannot read or write to leaderboard', async () => {
    const nonRosterDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(
      nonRosterDb.collection('myth_leaderboard').doc(VICTIM_UID).get()
    );

    await assertFails(
      nonRosterDb.collection('myth_leaderboard').doc(ATTACKER_UID).set({
        name: ATTACKER_NAME,
        uid: ATTACKER_UID,
        lcSolved: 10,
        platformSolved: 5,
        compositePoints: 9,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('9. ATTACK: Fake name on leaderboard (not matching roster name) is rejected', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(
      victimDb.collection('myth_leaderboard').doc(VICTIM_UID).set({
        name: 'Spoofed Fake Name', // DOES NOT MATCH 'Example Student One'
        uid: VICTIM_UID,
        lcSolved: 100,
        platformSolved: 20,
        compositePoints: 80,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('10. ATTACK: compositePoints over cap (>10000) is rejected', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(
      victimDb.collection('myth_leaderboard').doc(VICTIM_UID).set({
        name: VICTIM_NAME,
        uid: VICTIM_UID,
        lcSolved: 200,
        platformSolved: 50,
        compositePoints: 10001, // EXCEEDS 10000 CAP
        updatedAt: new Date().toISOString()
      })
    );
  });
});
