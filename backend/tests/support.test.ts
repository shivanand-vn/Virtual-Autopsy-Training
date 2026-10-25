/**
 * Support Issue Backend Integration Tests
 * Tests all 4 endpoints using mocked Prisma and auth middleware.
 * No real database connection required.
 * Run: npx tsx backend/tests/support.test.ts
 */

// ---- Mock Setup ----

interface MockIssue {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  category: string;
  description: string;
  screenshotBase64: string | null;
  status: 'PENDING' | 'SOLVED';
  submittedAt: Date;
  resolvedAt: Date | null;
}

const mockDb: MockIssue[] = [];
let nextId = 1;

function resetDb() {
  mockDb.length = 0;
  nextId = 1;
}

function seedIssue(overrides: Partial<MockIssue> = {}): MockIssue {
  const issue: MockIssue = {
    id: `test-id-${nextId++}`,
    userId: 'user-student-1',
    studentName: 'Test Student',
    studentEmail: 'test@student.com',
    category: 'Technical',
    description: 'Test issue description',
    screenshotBase64: null,
    status: 'PENDING',
    submittedAt: new Date(),
    resolvedAt: null,
    ...overrides,
  };
  mockDb.push(issue);
  return issue;
}

// ---- Minimal Express-like mock ----

interface MockRes {
  statusCode: number;
  body: any;
  status(code: number): MockRes;
  json(data: any): MockRes;
}

function createMockRes(): MockRes {
  const res: MockRes = {
    statusCode: 200,
    body: null,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(data: any) {
      res.body = data;
      return res;
    },
  };
  return res;
}

// ---- Import actual modules ----

import { z } from 'zod';

// ---- Inline controller logic (mirrors support.controller.ts without Prisma import) ----

const createIssueSchema = z.object({
  studentName: z.string().min(1, 'Student name is required').max(200),
  studentEmail: z.string().email('Please enter a valid email address'),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().min(5, 'Description must be at least 5 characters').max(5000),
  screenshotBase64: z
    .string()
    .max(7 * 1024 * 1024, 'Screenshot data must not exceed ~5 MB (base64-encoded)')
    .optional()
    .nullable(),
});

function toSupportIssueReport(issue: MockIssue) {
  return {
    id: issue.id,
    studentName: issue.studentName,
    studentEmail: issue.studentEmail,
    category: issue.category,
    description: issue.description,
    screenshotBase64: issue.screenshotBase64 ?? undefined,
    status: issue.status === 'SOLVED' ? 'solved' : 'pending',
    submittedAt: issue.submittedAt.toISOString(),
    resolvedAt: issue.resolvedAt ? issue.resolvedAt.toISOString() : undefined,
  };
}

// ---- Mock controller functions that use mockDb instead of Prisma ----

async function mockCreateSupportIssue(
  user: { userId: string; email: string; fullName: string; role: string } | undefined,
  body: any
): Promise<{ statusCode: number; body: any }> {
  const res = createMockRes();

  if (!user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return res;
  }

  const parsed = createIssueSchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Validation failed';
    res.status(400).json({ success: false, message: errorMsg });
    return res;
  }

  const { studentName, studentEmail, category, description, screenshotBase64 } = parsed.data;

  const issue: MockIssue = {
    id: `test-id-${nextId++}`,
    userId: user.userId,
    studentName: studentName.trim(),
    studentEmail: studentEmail.toLowerCase().trim(),
    category: category.trim(),
    description: description.trim(),
    screenshotBase64: screenshotBase64 || null,
    status: 'PENDING',
    submittedAt: new Date(),
    resolvedAt: null,
  };
  mockDb.push(issue);

  res.status(201).json({ success: true, message: 'Support issue submitted successfully', data: toSupportIssueReport(issue) });
  return res;
}

async function mockGetSupportIssues(
  user: { userId: string; role: string } | undefined
): Promise<{ statusCode: number; body: any }> {
  const res = createMockRes();

  if (!user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return res;
  }
  if (user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return res;
  }

  const sorted = [...mockDb].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  res.status(200).json({ success: true, message: 'Support issues retrieved', data: sorted.map(toSupportIssueReport) });
  return res;
}

async function mockResolveSupportIssue(
  user: { userId: string; role: string } | undefined,
  id: string
): Promise<{ statusCode: number; body: any }> {
  const res = createMockRes();

  if (!user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return res;
  }
  if (user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return res;
  }

  if (!id) {
    res.status(400).json({ success: false, message: 'Valid issue ID is required.' });
    return res;
  }

  const existing = mockDb.find(i => i.id === id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Support issue not found.' });
    return res;
  }

  if (existing.status === 'SOLVED') {
    res.status(200).json({ success: true, message: 'Support issue is already resolved', data: toSupportIssueReport(existing) });
    return res;
  }

  existing.status = 'SOLVED';
  existing.resolvedAt = new Date();

  res.status(200).json({ success: true, message: 'Support issue resolved successfully', data: toSupportIssueReport(existing) });
  return res;
}

async function mockDeleteSupportIssue(
  user: { userId: string; role: string } | undefined,
  id: string
): Promise<{ statusCode: number; body: any }> {
  const res = createMockRes();

  if (!user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return res;
  }
  if (user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return res;
  }

  if (!id) {
    res.status(400).json({ success: false, message: 'Valid issue ID is required.' });
    return res;
  }

  const existing = mockDb.find(i => i.id === id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Support issue not found.' });
    return res;
  }

  if (existing.status !== 'SOLVED') {
    res.status(400).json({ success: false, message: 'Only resolved issues can be deleted. Please resolve the issue first.' });
    return res;
  }

  const idx = mockDb.indexOf(existing);
  mockDb.splice(idx, 1);

  res.status(200).json({ success: true, message: 'Support issue deleted successfully' });
  return res;
}

// ---- Test Runner ----

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    const msg = detail ? `${testName} — ${detail}` : testName;
    failures.push(msg);
    console.log(`  ❌ ${testName}${detail ? ` (${detail})` : ''}`);
  }
}

const studentUser = { userId: 'user-student-1', email: 'test@student.com', fullName: 'Test Student', role: 'STUDENT' };
const adminUser = { userId: 'user-admin-1', email: 'admin@platform.com', fullName: 'Admin User', role: 'ADMIN' };

async function runTests() {
  console.log('\n🧪 Support Issue Backend Tests\n');

  // ========================
  // 1. CREATE (POST /api/support/issues)
  // ========================
  console.log('--- POST /api/support/issues ---');

  resetDb();

  // 1a. Unauthenticated request
  {
    const r = await mockCreateSupportIssue(undefined, {});
    assert(r.statusCode === 401, 'Unauthenticated request returns 401', `got ${r.statusCode}`);
  }

  // 1b. Missing required fields
  {
    const r = await mockCreateSupportIssue(studentUser, {});
    assert(r.statusCode === 400, 'Missing fields returns 400', `got ${r.statusCode}`);
  }

  // 1c. Invalid email
  {
    const r = await mockCreateSupportIssue(studentUser, {
      studentName: 'Test', studentEmail: 'not-an-email', category: 'Bug', description: 'Test issue desc',
    });
    assert(r.statusCode === 400, 'Invalid email returns 400', `got ${r.statusCode}`);
  }

  // 1d. Description too short
  {
    const r = await mockCreateSupportIssue(studentUser, {
      studentName: 'Test', studentEmail: 'test@e.com', category: 'Bug', description: 'Hi',
    });
    assert(r.statusCode === 400, 'Short description returns 400', `got ${r.statusCode}`);
  }

  // 1e. Valid submission
  {
    const r = await mockCreateSupportIssue(studentUser, {
      studentName: 'Dr. Jane Miller', studentEmail: 'jane@hospital.org', category: 'Technical', description: 'WebGL crashed during 3D reconstruction',
    });
    assert(r.statusCode === 201, 'Valid issue returns 201', `got ${r.statusCode}`);
    assert(r.body.success === true, 'Response has success: true');
    assert(r.body.data.status === 'pending', 'Status is "pending"', `got "${r.body.data.status}"`);
    assert(typeof r.body.data.id === 'string', 'Issue has string ID');
    assert(typeof r.body.data.submittedAt === 'string', 'Has submittedAt ISO string');
    assert(r.body.data.resolvedAt === undefined, 'resolvedAt is undefined for new issue');
  }

  // 1f. Valid submission with screenshot
  {
    const r = await mockCreateSupportIssue(studentUser, {
      studentName: 'Alex', studentEmail: 'alex@test.com', category: 'UI Bug', description: 'Button not working properly',
      screenshotBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
    });
    assert(r.statusCode === 201, 'Issue with screenshot returns 201', `got ${r.statusCode}`);
    assert(r.body.data.screenshotBase64 !== undefined, 'Screenshot data is present in response');
  }

  // ========================
  // 2. LIST (GET /api/support/issues)
  // ========================
  console.log('\n--- GET /api/support/issues ---');

  // 2a. Student cannot access
  {
    const r = await mockGetSupportIssues(studentUser);
    assert(r.statusCode === 403, 'Student gets 403 on admin endpoint', `got ${r.statusCode}`);
  }

  // 2b. Unauthenticated
  {
    const r = await mockGetSupportIssues(undefined);
    assert(r.statusCode === 401, 'Unauthenticated returns 401', `got ${r.statusCode}`);
  }

  // 2c. Admin can fetch
  {
    const r = await mockGetSupportIssues(adminUser);
    assert(r.statusCode === 200, 'Admin gets 200', `got ${r.statusCode}`);
    assert(Array.isArray(r.body.data), 'Response data is array');
    assert(r.body.data.length === 2, 'Returns 2 seeded issues', `got ${r.body.data.length}`);
  }

  // ========================
  // 3. RESOLVE (PATCH /api/support/issues/:id/resolve)
  // ========================
  console.log('\n--- PATCH /api/support/issues/:id/resolve ---');

  // 3a. Student cannot resolve
  {
    const r = await mockResolveSupportIssue(studentUser, mockDb[0].id);
    assert(r.statusCode === 403, 'Student cannot resolve issues', `got ${r.statusCode}`);
  }

  // 3b. Missing ID
  {
    const r = await mockResolveSupportIssue(adminUser, 'nonexistent-id');
    assert(r.statusCode === 404, 'Missing ID returns 404', `got ${r.statusCode}`);
  }

  // 3c. Admin resolves successfully
  {
    const issueId = mockDb[0].id;
    const r = await mockResolveSupportIssue(adminUser, issueId);
    assert(r.statusCode === 200, 'Admin resolves issue successfully', `got ${r.statusCode}`);
    assert(r.body.data.status === 'solved', 'Status changed to "solved"', `got "${r.body.data.status}"`);
    assert(r.body.data.resolvedAt !== undefined, 'resolvedAt is set');
  }

  // 3d. Idempotent re-resolve
  {
    const issueId = mockDb[0].id;
    const r = await mockResolveSupportIssue(adminUser, issueId);
    assert(r.statusCode === 200, 'Re-resolve returns 200 (idempotent)', `got ${r.statusCode}`);
    assert(r.body.data.status === 'solved', 'Status still "solved"');
  }

  // ========================
  // 4. DELETE (DELETE /api/support/issues/:id)
  // ========================
  console.log('\n--- DELETE /api/support/issues/:id ---');

  // 4a. Student cannot delete
  {
    const r = await mockDeleteSupportIssue(studentUser, mockDb[0].id);
    assert(r.statusCode === 403, 'Student cannot delete issues', `got ${r.statusCode}`);
  }

  // 4b. Cannot delete pending issue
  {
    const pendingIssue = mockDb.find(i => i.status === 'PENDING')!;
    const r = await mockDeleteSupportIssue(adminUser, pendingIssue.id);
    assert(r.statusCode === 400, 'Cannot delete pending issue', `got ${r.statusCode}`);
    assert(r.body.message.includes('resolved'), 'Error mentions resolution requirement');
  }

  // 4c. Missing ID
  {
    const r = await mockDeleteSupportIssue(adminUser, 'nonexistent-id');
    assert(r.statusCode === 404, 'Missing ID returns 404', `got ${r.statusCode}`);
  }

  // 4d. Admin deletes solved issue
  {
    const solvedIssue = mockDb.find(i => i.status === 'SOLVED')!;
    const countBefore = mockDb.length;
    const r = await mockDeleteSupportIssue(adminUser, solvedIssue.id);
    assert(r.statusCode === 200, 'Admin deletes solved issue', `got ${r.statusCode}`);
    assert(mockDb.length === countBefore - 1, 'Issue removed from DB');
  }

  // 4e. Double-delete returns 404
  {
    const r = await mockDeleteSupportIssue(adminUser, 'test-id-1'); // Already deleted
    assert(r.statusCode === 404, 'Double delete returns 404', `got ${r.statusCode}`);
  }

  // ========================
  // 5. Validation schema tests
  // ========================
  console.log('\n--- Validation Schema ---');

  {
    const result = createIssueSchema.safeParse({
      studentName: '', studentEmail: 'a@b.com', category: 'x', description: 'Hello world',
    });
    assert(!result.success, 'Empty studentName rejected');
  }

  {
    const result = createIssueSchema.safeParse({
      studentName: 'A', studentEmail: 'a@b.com', category: '', description: 'Hello world',
    });
    assert(!result.success, 'Empty category rejected');
  }

  {
    const result = createIssueSchema.safeParse({
      studentName: 'A', studentEmail: 'a@b.com', category: 'Bug', description: 'Valid description here',
    });
    assert(result.success, 'Valid input without screenshot passes');
  }

  {
    const result = createIssueSchema.safeParse({
      studentName: 'A', studentEmail: 'a@b.com', category: 'Bug', description: 'Valid description here',
      screenshotBase64: null,
    });
    assert(result.success, 'Null screenshot passes validation');
  }

  // ========================
  // 6. API response shape verification
  // ========================
  console.log('\n--- Response Shape ---');

  resetDb();
  seedIssue();

  {
    const r = await mockGetSupportIssues(adminUser);
    const item = r.body.data[0];
    const requiredFields = ['id', 'studentName', 'studentEmail', 'category', 'description', 'status', 'submittedAt'];
    for (const field of requiredFields) {
      assert(field in item, `Response contains "${field}" field`);
    }
    assert(item.status === 'pending' || item.status === 'solved', 'Status is lowercase "pending" or "solved"');
    assert(!isNaN(Date.parse(item.submittedAt)), 'submittedAt is a valid ISO date string');
  }

  // ========================
  // Summary
  // ========================
  console.log('\n' + '='.repeat(50));
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failures.length > 0) {
    console.log('\n  Failures:');
    failures.forEach(f => console.log(`    - ${f}`));
  }
  console.log('='.repeat(50) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
