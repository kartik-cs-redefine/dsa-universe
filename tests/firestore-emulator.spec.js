import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';

let testEnv;

const PROJECT_ID = 'myth-rules-test-v3';
const VICTIM_UID = 'google_victim_uid_101';
const VICTIM_EMAIL = 'kartikkumar@university.edu';
const VICTIM_ROLL = '2501640100454';
const VICTIM_NAME = 'Kartik Kumar';

const ATTACKER_UID = 'google_attacker_uid_202';
const ATTACKER_EMAIL = 'attacker@external.com';
const ATTACKER_NAME = 'Eve Hacker';

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

      // Seed verified roster records (simulating Admin SDK roster provisioning)
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        // 1. Roll claim
        await adminDb.collection('myth_rolls').doc(VICTIM_ROLL).set({
          roll: VICTIM_ROLL,
          email: VICTIM_EMAIL,
          name: VICTIM_NAME,
          provisionedAt: new Date().toISOString()
        });

        // 2. Roster email registry
        await adminDb.collection('myth_roster').doc(VICTIM_EMAIL).set({
          roll: VICTIM_ROLL,
          email: VICTIM_EMAIL,
          name: VICTIM_NAME,
          provisionedAt: new Date().toISOString()
        });
      });
    }
  });

  it('1. POSITIVE CONTROL: Victim can read/write own profile, progress, scratchpad, notes, and leaderboard', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Profile write
    await assertSucceeds(
      victimDb.collection('myth_users').doc(VICTIM_ROLL).set({
        name: VICTIM_NAME,
        roll: VICTIM_ROLL,
        uid: VICTIM_UID,
        email: VICTIM_EMAIL,
        authProvider: 'google',
        langTrack: 'cpp',
        codeMode: 'cpp',
        updatedAt: new Date().toISOString()
      })
    );

    // Scratchpad create
    const probId = 'prob-reverse-list';
    const codeMode = 'cpp';
    const scratchKey = `${VICTIM_ROLL}_${probId}_${codeMode}`;
    await assertSucceeds(
      victimDb.collection('myth_scratchpads').doc(scratchKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        codeMode: codeMode,
        code: 'ListNode* reverseList(ListNode* head) { return head; }',
        uid: VICTIM_UID,
        updatedAt: new Date().toISOString()
      })
    );

    // Scratchpad update
    await assertSucceeds(
      victimDb.collection('myth_scratchpads').doc(scratchKey).update({
        code: 'ListNode* reverseList(ListNode* head) { /* updated */ return nullptr; }',
        updatedAt: new Date().toISOString()
      })
    );

    // Notes create
    const notesKey = `${VICTIM_ROLL}_${probId}`;
    await assertSucceeds(
      victimDb.collection('myth_notes').doc(notesKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        notes: 'In-place 3-pointer reversal algorithm',
        uid: VICTIM_UID,
        updatedAt: new Date().toISOString()
      })
    );

    // Leaderboard write (real client payload: UID keyed, name matches roster, no roll/email)
    await assertSucceeds(
      victimDb.collection('myth_leaderboard').doc(VICTIM_UID).set({
        name: VICTIM_NAME,
        uid: VICTIM_UID,
        lcSolved: 150,
        platformSolved: 30,
        compositePoints: 126,
        badge: 'COHORT SDE',
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('2. MISSING-DOC BUG FIX: Reading a nonexistent own scratchpad succeeds without permission-denied', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    const nonExistentKey = `${VICTIM_ROLL}_prob-unopened-prob_cpp`;
    const docSnap = await victimDb.collection('myth_scratchpads').doc(nonExistentKey).get();
    expect(docSnap.exists).toBe(false);
  });

  it('3. ATTACK: Attacker overwriting victim\'s scratchpad is denied on both create and update paths', async () => {
    // Victim creates legitimate scratchpad
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    const probId = 'prob-detect-cycle';
    const codeMode = 'cpp';
    const scratchKey = `${VICTIM_ROLL}_${probId}_${codeMode}`;

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

    // Attack path A (Create with spoofed docKey)
    // Denied by rule expression: ownsRollClaim(request.resource.data.roll)
    await assertFails(
      attackerDb.collection('myth_scratchpads').doc(`${VICTIM_ROLL}_prob-hacked_cpp`).set({
        roll: VICTIM_ROLL,
        probId: 'prob-hacked',
        codeMode: 'cpp',
        code: 'hacked code',
        uid: ATTACKER_UID,
        updatedAt: new Date().toISOString()
      })
    );

    // Attack path B (Update on victim's existing scratchpad)
    // Denied by rule expression: resource.data.uid == request.auth.uid && ownsRollClaim(request.resource.data.roll)
    await assertFails(
      attackerDb.collection('myth_scratchpads').doc(scratchKey).update({
        code: 'malicious overwrite',
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('4. ATTACK: Attacker writing victim\'s notes is denied', async () => {
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    // Denied by rule expression: ownsRollClaim(request.resource.data.roll)
    await assertFails(
      attackerDb.collection('myth_notes').doc(`${VICTIM_ROLL}_prob-1`).set({
        roll: VICTIM_ROLL,
        probId: 'prob-1',
        notes: 'injected malicious note',
        uid: ATTACKER_UID,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('5. ATTACK: Wrong Google user claiming an unclaimed roll via client is denied', async () => {
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    // Denied by rule expression: allow write: if false; on myth_rolls
    await assertFails(
      attackerDb.collection('myth_rolls').doc('2501640100999').set({
        roll: '2501640100999',
        email: ATTACKER_EMAIL,
        name: ATTACKER_NAME
      })
    );
  });

  it('6. ATTACK: User with unverified email is denied access', async () => {
    const unverifiedDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: false // Email not verified
    }).firestore();

    // Denied by rule expression: request.auth.token.email_verified == true in isVerifiedCohortEmail()
    await assertFails(
      unverifiedDb.collection('myth_users').doc(VICTIM_ROLL).set({
        name: VICTIM_NAME,
        roll: VICTIM_ROLL,
        uid: VICTIM_UID,
        email: VICTIM_EMAIL,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('7. ATTACK: Non-roster Google user cannot read or write leaderboard', async () => {
    const nonRosterDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true // Verified email, but not enrolled in myth_roster!
    }).firestore();

    // Leaderboard read denied by: isVerifiedCohortEmail() (exists(myth_roster/attacker@external.com) is false)
    await assertFails(
      nonRosterDb.collection('myth_leaderboard').doc(VICTIM_UID).get()
    );

    // Leaderboard write denied by: isVerifiedCohortEmail()
    await assertFails(
      nonRosterDb.collection('myth_leaderboard').doc(ATTACKER_UID).set({
        name: ATTACKER_NAME,
        uid: ATTACKER_UID,
        lcSolved: 50,
        platformSolved: 10,
        compositePoints: 42,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('8. ATTACK: Fake or spoofed name on leaderboard is rejected', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Denied by rule expression: request.resource.data.name == getRosterRecord(request.auth.token.email).name
    await assertFails(
      victimDb.collection('myth_leaderboard').doc(VICTIM_UID).set({
        name: 'Spoofed Fake Name', // Name does NOT match "Kartik Kumar" in myth_roster!
        uid: VICTIM_UID,
        lcSolved: 100,
        platformSolved: 20,
        compositePoints: 84,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('9. ATTACK: compositePoints over cap (>10000) is rejected', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Denied by rule expression: data.compositePoints <= 10000
    await assertFails(
      victimDb.collection('myth_leaderboard').doc(VICTIM_UID).set({
        name: VICTIM_NAME,
        uid: VICTIM_UID,
        lcSolved: 200,
        platformSolved: 50,
        compositePoints: 10001, // EXCEEDS CAP!
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('10. POSITIVE CONTROL: Client-shaped real payloads are accepted and leaderboard exposes zero PII', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Client-shaped leaderboard record
    await assertSucceeds(
      victimDb.collection('myth_leaderboard').doc(VICTIM_UID).set({
        name: VICTIM_NAME,
        uid: VICTIM_UID,
        lcSolved: 210,
        lcEasy: 95,
        lcMedium: 88,
        lcHard: 27,
        lcRanking: 142050,
        platformSolved: 42,
        compositePoints: 176,
        badge: 'COHORT SDE',
        updatedAt: new Date().toISOString()
      })
    );

    // Reading the leaderboard record exposes only safe performance metrics
    const readerDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    const snapshot = await readerDb.collection('myth_leaderboard').doc(VICTIM_UID).get();
    expect(snapshot.exists).toBe(true);
    const data = snapshot.data();
    expect(data.name).toBe(VICTIM_NAME);
    expect(data.compositePoints).toBe(176);
    expect(data.roll).toBeUndefined();
    expect(data.email).toBeUndefined();
  });
});
