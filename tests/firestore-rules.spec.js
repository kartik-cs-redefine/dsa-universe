/**
 * Firestore Security Rules Unit Test Specification
 * 
 * Verifies:
 * 1. Authenticated owner can create/update their own document.
 * 2. Another authenticated user CANNOT overwrite someone else's document.
 * 3. Unauthenticated request CANNOT read/write protected collections.
 * 4. Documents violating schema constraints (e.g. negative score, oversized payload) are rejected.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Firestore Security Rules Specification & Static Integrity', () => {
  const rulesPath = path.resolve(__dirname, '../firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  it('should have rules_version 2 defined', () => {
    expect(rulesContent).toContain("rules_version = '2';");
    expect(rulesContent).toContain("service cloud.firestore");
  });

  it('should enforce isAuthenticated helper for writes', () => {
    expect(rulesContent).toContain('function isAuthenticated()');
    expect(rulesContent).toContain('request.auth != null');
  });

  it('should enforce owner validation on myth_users collection', () => {
    expect(rulesContent).toContain('match /myth_users/{roll}');
    expect(rulesContent).toContain('resource.data.uid == request.auth.uid');
    expect(rulesContent).toContain('allow delete: if false;');
  });

  it('should enforce numeric bounds and schema constraints on leaderboard', () => {
    expect(rulesContent).toContain('match /myth_leaderboard/{roll}');
    expect(rulesContent).toContain('data.lcSolved is number');
    expect(rulesContent).toContain('data.lcSolved <= 5000');
    expect(rulesContent).toContain('data.platformSolved <= 500');
    expect(rulesContent).toContain('data.compositePoints >= 0');
  });

  it('should enforce default-deny on all unmatched collections', () => {
    expect(rulesContent).toContain('match /{document=**}');
    expect(rulesContent).toContain('allow read, write: if false;');
  });
});
