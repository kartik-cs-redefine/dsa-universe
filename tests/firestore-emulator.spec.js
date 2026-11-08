import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';

let testEnv;

const PROJECT_ID = 'your-prod-project-id';

// Student 1 (Victim - Enrolled in Roster)
const VICTIM_UID = 'google_user_victim_101';
const VICTIM_EMAIL = 'student1@university.example.edu';
const VICTIM_ROLL = '1000000000001';
const VICTIM_NAME = 'Example Student One';

// Student 2 (Attacker - Also enrolled in Roster with different roll)
const ATTACKER_UID = 'google_user_attacker_202';
const ATTACKER_EMAIL = 'student2@university.example.edu';
const ATTACKER_ROLL = '1000000000002';
const ATTACKER_NAME = 'Example Student Two';

// Non-Roster External User
const EXTERNAL_UID = 'google_user_external_303';
const EXTERNAL_EMAIL = 'external@other.example.com';

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
    try {
      const covRes = await fetch(`http://127.0.0.1:8088/emulator/v1/projects/${PROJECT_ID}:ruleCoverage`);
      if (covRes.ok) {
        const covHtml = await covRes.text();
        fs.writeFileSync(path.resolve(__dirname, '../coverage-rules.html'), covHtml, 'utf8');
        console.log('[COVERAGE] Rules coverage report saved to coverage-rules.html');
      }
    } catch (e) {
      console.warn('Could not fetch rule coverage:', e);
    }
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();

      // Seed verified student roster records for BOTH students via Admin SDK simulation
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('myth_roster').doc(VICTIM_EMAIL).set({
          roll: VICTIM_ROLL,
          email: VICTIM_EMAIL,
          name: VICTIM_NAME,
          provisionedAt: new Date().toISOString()
        });

        await adminDb.collection('myth_roster').doc(ATTACKER_EMAIL).set({
          roll: ATTACKER_ROLL,
          email: ATTACKER_EMAIL,
          name: ATTACKER_NAME,
          provisionedAt: new Date().toISOString()
        });
      });
    }
  });

  it('1. Scratchpad create: Owner succeeds (positive control) vs Roster-peer attacker denied', async () => {
    const probId = 'prob-reverse-list';
    const codeMode = 'cpp';
    const victimKey = `${VICTIM_ROLL}_${probId}_${codeMode}`;

    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    const victimPayload = {
      roll: VICTIM_ROLL,
      probId: probId,
      codeMode: codeMode,
      code: 'ListNode* reverseList(ListNode* head) { return head; }',
      uid: VICTIM_UID,
      updatedAt: new Date().toISOString()
    };

    // Positive Control: Victim creates own scratchpad
    await assertSucceeds(
      victimDb.collection('myth_scratchpads').doc(victimKey).set(victimPayload)
    );

    // Attack Test: Attacker (Student 2 in roster) tries to create a scratchpad for Victim's roll
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    const attackerPayload = {
      roll: VICTIM_ROLL,
      probId: probId,
      codeMode: codeMode,
      code: 'hacked code payload',
      uid: ATTACKER_UID,
      updatedAt: new Date().toISOString()
    };

    await assertFails(
      attackerDb.collection('myth_scratchpads').doc(victimKey).set(attackerPayload)
    );
  });

  it('2. Scratchpad update: Owner succeeds (positive control) vs Roster-peer attacker denied', async () => {
    const probId = 'prob-detect-cycle';
    const codeMode = 'cpp';
    const victimKey = `${VICTIM_ROLL}_${probId}_${codeMode}`;

    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Seed scratchpad
    await victimDb.collection('myth_scratchpads').doc(victimKey).set({
      roll: VICTIM_ROLL,
      probId: probId,
      codeMode: codeMode,
      code: 'initial legitimate code',
      uid: VICTIM_UID,
      updatedAt: new Date().toISOString()
    });

    // Positive Control: Victim updates own scratchpad
    await assertSucceeds(
      victimDb.collection('myth_scratchpads').doc(victimKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        codeMode: codeMode,
        code: 'updated legitimate code',
        uid: VICTIM_UID,
        updatedAt: new Date().toISOString()
      }, { merge: true })
    );

    // Attack Test: Attacker tries to update victim's scratchpad
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(
      attackerDb.collection('myth_scratchpads').doc(victimKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        codeMode: codeMode,
        code: 'malicious overwrite by peer',
        uid: ATTACKER_UID,
        updatedAt: new Date().toISOString()
      }, { merge: true })
    );
  });

  it('3. Notes write: Owner succeeds (positive control) vs Roster-peer attacker denied', async () => {
    const probId = 'prob-lru-cache';
    const victimKey = `${VICTIM_ROLL}_${probId}`;

    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Positive Control
    await assertSucceeds(
      victimDb.collection('myth_notes').doc(victimKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        notes: 'Doubly linked list + hash map approach',
        uid: VICTIM_UID,
        updatedAt: new Date().toISOString()
      })
    );

    // Attack Test
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(
      attackerDb.collection('myth_notes').doc(victimKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        notes: 'malicious note injection by peer',
        uid: ATTACKER_UID,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('4. User Profile write: Owner succeeds (positive control) vs Roster-peer attacker denied', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Positive Control
    await assertSucceeds(
      victimDb.collection('myth_users').doc(VICTIM_ROLL).set({
        name: VICTIM_NAME,
        roll: VICTIM_ROLL,
        uid: VICTIM_UID,
        email: VICTIM_EMAIL,
        authProvider: 'google',
        langTrack: 'cpp',
        codeMode: 'cpp',
        targetGoal: 'FAANG / Tier-1 SDE',
        leetcodeUser: 'victim_dev',
        updatedAt: new Date().toISOString()
      })
    );

    // Attack Test: Attacker (Student 2) attempts to overwrite Victim's profile doc
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(
      attackerDb.collection('myth_users').doc(VICTIM_ROLL).set({
        name: ATTACKER_NAME,
        roll: VICTIM_ROLL,
        uid: ATTACKER_UID,
        email: ATTACKER_EMAIL,
        authProvider: 'google',
        langTrack: 'java',
        codeMode: 'java',
        targetGoal: 'Hacked Goal',
        leetcodeUser: 'attacker_dev',
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('5. User Progress write: Owner succeeds (positive control) vs Roster-peer attacker denied', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Positive Control
    await assertSucceeds(
      victimDb.collection('myth_progress').doc(VICTIM_ROLL).set({
        uid: VICTIM_UID,
        completedTopics: ['topic-1'],
        solvedProblems: ['prob-1'],
        bookmarkedProblems: ['prob-1'],
        updatedAt: new Date().toISOString()
      })
    );

    // Attack Test
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(
      attackerDb.collection('myth_progress').doc(VICTIM_ROLL).set({
        uid: ATTACKER_UID,
        completedTopics: ['hacked-topic'],
        solvedProblems: ['hacked-prob'],
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('6. Client write to myth_roster: Denied for all clients (positive control: Admin SDK only)', async () => {
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    // Denied by rule: allow write: if false; on myth_roster
    await assertFails(
      attackerDb.collection('myth_roster').doc(ATTACKER_EMAIL).set({
        roll: '1000000000999',
        email: ATTACKER_EMAIL,
        name: 'Injected Roll'
      })
    );
  });

  it('7. Non-roster Google user: Denied leaderboard read and write', async () => {
    const externalDb = testEnv.authenticatedContext(EXTERNAL_UID, {
      email: EXTERNAL_EMAIL,
      email_verified: true // Verified email, but not enrolled in myth_roster!
    }).firestore();

    // Read denied by isVerifiedCohortEmail()
    await assertFails(
      externalDb.collection('myth_leaderboard').doc(VICTIM_UID).get()
    );

    // Write denied by isVerifiedCohortEmail()
    await assertFails(
      externalDb.collection('myth_leaderboard').doc(EXTERNAL_UID).set({
        name: 'External Person',
        uid: EXTERNAL_UID,
        lcSolved: 10,
        platformSolved: 5,
        compositePoints: 9,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('8. Leaderboard name verification: Owner with roster name succeeds vs Fake name denied', async () => {
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    // Positive Control: Attacker writes leaderboard using legitimate roster name
    await assertSucceeds(
      attackerDb.collection('myth_leaderboard').doc(ATTACKER_UID).set({
        name: ATTACKER_NAME, // Matches 'Example Student Two'
        uid: ATTACKER_UID,
        lcSolved: 75,
        platformSolved: 15,
        compositePoints: 63,
        updatedAt: new Date().toISOString()
      })
    );

    // Attack Test: Attacker tries to write with a fake / spoofed name
    await assertFails(
      attackerDb.collection('myth_leaderboard').doc(ATTACKER_UID).set({
        name: 'Fake Impostor Name', // REJECTED: Does not match roster name!
        uid: ATTACKER_UID,
        lcSolved: 75,
        platformSolved: 15,
        compositePoints: 63,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('9. RESTORED: Unverified email user is denied access (positive control: verified succeeds)', async () => {
    // Attack Test: Student 1 tries with unverified email
    const unverifiedDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: false // UNVERIFIED!
    }).firestore();

    await assertFails(
      unverifiedDb.collection('myth_users').doc(VICTIM_ROLL).set({
        name: VICTIM_NAME,
        roll: VICTIM_ROLL,
        uid: VICTIM_UID,
        email: VICTIM_EMAIL,
        updatedAt: new Date().toISOString()
      })
    );

    // Positive Control: Student 1 with verified email succeeds
    const verifiedDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true // VERIFIED!
    }).firestore();

    await assertSucceeds(
      verifiedDb.collection('myth_users').doc(VICTIM_ROLL).set({
        name: VICTIM_NAME,
        roll: VICTIM_ROLL,
        uid: VICTIM_UID,
        email: VICTIM_EMAIL,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('10. RESTORED: Oversize payloads denied (positive control: within caps succeeds)', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    const probId = 'prob-oversize';
    const codeMode = 'cpp';
    const key = `${VICTIM_ROLL}_${probId}_${codeMode}`;

    // Attack Test A: Code exceeding 50,000 characters
    const hugeCode = 'a'.repeat(50001);
    await assertFails(
      victimDb.collection('myth_scratchpads').doc(key).set({
        roll: VICTIM_ROLL,
        probId: probId,
        codeMode: codeMode,
        code: hugeCode,
        uid: VICTIM_UID,
        updatedAt: new Date().toISOString()
      })
    );

    // Attack Test B: Solved problems exceeding 500 items
    const hugeList = Array.from({ length: 501 }, (_, i) => `prob-${i}`);
    await assertFails(
      victimDb.collection('myth_progress').doc(VICTIM_ROLL).set({
        uid: VICTIM_UID,
        solvedProblems: hugeList,
        updatedAt: new Date().toISOString()
      })
    );

    // Positive Control: Within bounds succeeds
    await assertSucceeds(
      victimDb.collection('myth_scratchpads').doc(key).set({
        roll: VICTIM_ROLL,
        probId: probId,
        codeMode: codeMode,
        code: 'int normalCodeLength = 42;',
        uid: VICTIM_UID,
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('11. LEGACY DOCS: Owner can successfully update legacy scratchpad seeded without uid', async () => {
    const probId = 'prob-legacy-seeded';
    const codeMode = 'cpp';
    const scratchKey = `${VICTIM_ROLL}_${probId}_${codeMode}`;

    // Seed legacy document WITHOUT uid field via Admin context
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('myth_scratchpads').doc(scratchKey).set({
        roll: VICTIM_ROLL,
        probId: probId,
        codeMode: codeMode,
        code: '/* legacy code without uid */',
        updatedAt: '2025-01-01T00:00:00.000Z'
      });
    });

    // Verified owner updates the legacy scratchpad with modern payload
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
  });

  it('12. SCHEMA STRICTNESS: Extra unwhitelisted field rejected by keys().hasOnly()', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Extra unwhitelisted field injected
    await assertFails(
      victimDb.collection('myth_users').doc(VICTIM_ROLL).set({
        name: VICTIM_NAME,
        roll: VICTIM_ROLL,
        uid: VICTIM_UID,
        evilInjectedField: 'hack', // REJECTED BY hasOnly()
        updatedAt: new Date().toISOString()
      })
    );
  });

  it('13. READ ACCESS: Roster-peer cannot read victim\'s myth_users profile (owner read succeeds)', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Seed victim profile
    await victimDb.collection('myth_users').doc(VICTIM_ROLL).set({
      name: VICTIM_NAME,
      roll: VICTIM_ROLL,
      uid: VICTIM_UID,
      email: VICTIM_EMAIL,
      updatedAt: new Date().toISOString()
    });

    // Positive Control: Owner can read own profile
    await assertSucceeds(victimDb.collection('myth_users').doc(VICTIM_ROLL).get());

    // Attack: Roster-peer attacker tries to read victim profile -> DENIED
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(attackerDb.collection('myth_users').doc(VICTIM_ROLL).get());
  });

  it('14. READ ACCESS: Roster-peer cannot read victim\'s myth_progress (owner read succeeds)', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Seed victim progress
    await victimDb.collection('myth_progress').doc(VICTIM_ROLL).set({
      uid: VICTIM_UID,
      solvedProblems: ['prob-reverse-list', 'prob-cycle'],
      updatedAt: new Date().toISOString()
    });

    // Positive Control: Owner can read own progress
    await assertSucceeds(victimDb.collection('myth_progress').doc(VICTIM_ROLL).get());

    // Attack: Roster-peer attacker tries to read victim progress -> DENIED
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(attackerDb.collection('myth_progress').doc(VICTIM_ROLL).get());
  });

  it('15. READ ACCESS: Roster-peer cannot read victim\'s myth_scratchpads (owner read succeeds)', async () => {
    const probId = 'prob-confidential-scratch';
    const codeMode = 'cpp';
    const victimScratchKey = `${VICTIM_ROLL}_${probId}_${codeMode}`;

    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Seed victim scratchpad
    await victimDb.collection('myth_scratchpads').doc(victimScratchKey).set({
      roll: VICTIM_ROLL,
      probId: probId,
      codeMode: codeMode,
      code: 'ListNode* confidentialSolution() { return nullptr; }',
      uid: VICTIM_UID,
      updatedAt: new Date().toISOString()
    });

    // Positive Control: Owner can read own scratchpad
    await assertSucceeds(victimDb.collection('myth_scratchpads').doc(victimScratchKey).get());

    // Attack: Roster-peer attacker tries to read victim scratchpad -> DENIED
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(attackerDb.collection('myth_scratchpads').doc(victimScratchKey).get());
  });

  it('16. READ ACCESS: Roster-peer cannot read victim\'s myth_notes (owner read succeeds)', async () => {
    const probId = 'prob-confidential-notes';
    const victimNotesKey = `${VICTIM_ROLL}_${probId}`;

    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Seed victim personal notes
    await victimDb.collection('myth_notes').doc(victimNotesKey).set({
      roll: VICTIM_ROLL,
      probId: probId,
      notes: 'Secret edge case analysis for technical interview',
      uid: VICTIM_UID,
      updatedAt: new Date().toISOString()
    });

    // Positive Control: Owner can read own notes
    await assertSucceeds(victimDb.collection('myth_notes').doc(victimNotesKey).get());

    // Attack: Roster-peer attacker tries to read victim notes -> DENIED
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(attackerDb.collection('myth_notes').doc(victimNotesKey).get());
  });

  it('17. CROSS-UID WRITE: Roster-peer cannot write to another uid\'s myth_leaderboard doc (owner write succeeds)', async () => {
    const victimDb = testEnv.authenticatedContext(VICTIM_UID, {
      email: VICTIM_EMAIL,
      email_verified: true
    }).firestore();

    // Positive Control: Owner can write to own leaderboard doc
    await assertSucceeds(
      victimDb.collection('myth_leaderboard').doc(VICTIM_UID).set({
        name: VICTIM_NAME,
        uid: VICTIM_UID,
        lcSolved: 42,
        platformSolved: 12,
        compositePoints: 50,
        updatedAt: new Date().toISOString()
      })
    );

    // Attack: Roster-peer attacker tries to write/overwrite victim's leaderboard doc (docKey = VICTIM_UID)
    const attackerDb = testEnv.authenticatedContext(ATTACKER_UID, {
      email: ATTACKER_EMAIL,
      email_verified: true
    }).firestore();

    await assertFails(
      attackerDb.collection('myth_leaderboard').doc(VICTIM_UID).set({
        name: ATTACKER_NAME,
        uid: VICTIM_UID, // Mismatched auth.uid vs doc UID / roster
        lcSolved: 999,
        platformSolved: 50,
        compositePoints: 800,
        updatedAt: new Date().toISOString()
      })
    );
  });
});
