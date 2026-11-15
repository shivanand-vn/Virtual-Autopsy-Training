/**
 * Automated Verification for Test Case ID: LOGIN-036
 * Session Invalidation / Token Revocation on Password Reset & Change
 *
 * Verifies that:
 * 1. An active session with current tokenVersion succeeds authentication.
 * 2. After a password reset (tokenVersion incremented), the old session is rejected with HTTP 401.
 * 3. A newly authenticated session with the updated tokenVersion succeeds.
 * 4. Legacy tokens without tokenVersion are invalidated once a password reset occurs.
 */

import { signToken } from '../src/utils/jwt.js';
import { requireAuth, AuthRequest } from '../src/middlewares/auth.middleware.js';
import { prisma } from '../src/config/prisma.js';

interface MockResponse {
  statusCode: number;
  clearedCookies: Record<string, any>;
  body: any;
  status(code: number): MockResponse;
  json(data: any): MockResponse;
  clearCookie(name: string, options: any): MockResponse;
}

function createMockResponse(): MockResponse {
  const res: MockResponse = {
    statusCode: 200,
    clearedCookies: {},
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    },
    clearCookie(name: string, options: any) {
      this.clearedCookies[name] = options;
      return this;
    },
  };
  return res;
}

async function runSessionRevocationTests() {
  console.log('\n🔒 Starting LOGIN-036 Session Revocation & Invalidation Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(desc: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`  ✅ ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ ${desc} - Detail: ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. Fetch or create a test user
  let user = await prisma.user.findFirst({
    where: { email: { contains: '@' } },
  });

  if (!user) {
    console.error('No user found in database to run integration test.');
    process.exit(1);
  }

  const initialVersion = (user as any).tokenVersion ?? 0;
  console.log(`  Target test user: ${user.email} (Current tokenVersion: ${initialVersion})`);

  // Test 1: Sign token with current tokenVersion -> requireAuth should call next()
  {
    const currentToken = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: initialVersion,
    });

    let nextCalled = false;
    const req = {
      headers: { authorization: `Bearer ${currentToken}` },
      cookies: {},
      query: {},
    } as unknown as AuthRequest;
    const res = createMockResponse();

    await requireAuth(req, res as any, () => {
      nextCalled = true;
    });

    assert('Active session with matching tokenVersion succeeds (next called)', nextCalled);
    assert('Response statusCode is 200', res.statusCode === 200);
    assert('req.user populated with tokenVersion', req.user?.tokenVersion === initialVersion);
  }

  // Test 2: Simulate password reset -> increment tokenVersion in database
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { tokenVersion: { increment: 1 } },
  });
  const newVersion = (updatedUser as any).tokenVersion;
  console.log(`  Simulated password reset: tokenVersion incremented from ${initialVersion} to ${newVersion}`);

  // Test 3: Old token (Device A / Chrome) should now be REJECTED with 401
  {
    const oldToken = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: initialVersion, // Stale version!
    });

    let nextCalled = false;
    const req = {
      headers: { authorization: `Bearer ${oldToken}` },
      cookies: { vat_auth_token: oldToken },
      query: {},
    } as unknown as AuthRequest;
    const res = createMockResponse();

    await requireAuth(req, res as any, () => {
      nextCalled = true;
    });

    assert('Old session after password reset is rejected (next NOT called)', !nextCalled);
    assert('Old session returns HTTP 401 Unauthorized', res.statusCode === 401);
    assert('Error message specifies session expiration due to password reset', 
      res.body?.message?.includes('expired due to a password change or reset'),
      res.body?.message
    );
    assert('Auth cookie is cleared in response to drop invalid session', 'vat_auth_token' in res.clearedCookies);
  }

  // Test 4: Legacy token without tokenVersion should also be REJECTED with 401
  {
    const legacyToken = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      // no tokenVersion
    });

    let nextCalled = false;
    const req = {
      headers: { authorization: `Bearer ${legacyToken}` },
      cookies: {},
      query: {},
    } as unknown as AuthRequest;
    const res = createMockResponse();

    await requireAuth(req, res as any, () => {
      nextCalled = true;
    });

    assert('Legacy token without tokenVersion is rejected when user has tokenVersion > 0', !nextCalled && res.statusCode === 401);
  }

  // Test 5: Fresh login on Device B / new browser (with new tokenVersion) should SUCCEED
  {
    const freshToken = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: newVersion,
    });

    let nextCalled = false;
    const req = {
      headers: { authorization: `Bearer ${freshToken}` },
      cookies: {},
      query: {},
    } as unknown as AuthRequest;
    const res = createMockResponse();

    await requireAuth(req, res as any, () => {
      nextCalled = true;
    });

    assert('Fresh session with new tokenVersion succeeds (next called)', nextCalled);
    assert('Response statusCode is 200', res.statusCode === 200);
    assert('req.user populated with new tokenVersion', req.user?.tokenVersion === newVersion);
  }

  console.log('\n==================================================');
  console.log(`  LOGIN-036 Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('==================================================\n');

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runSessionRevocationTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
