import { api } from './api';
import { SupportIssueReport, CreateSupportIssuePayload } from '../types/support';

/**
 * Submit a new support issue (any authenticated user).
 * POST /api/support/issues
 */
export async function saveSupportIssue(
  payload: CreateSupportIssuePayload
): Promise<SupportIssueReport> {
  const res = await api.post<SupportIssueReport>('/support/issues', payload);
  return res.data;
}

/**
 * Fetch issues submitted by the currently logged-in student.
 * GET /api/support/my-issues
 */
export async function getMySupportIssues(): Promise<SupportIssueReport[]> {
  const res = await api.get<SupportIssueReport[]>('/support/my-issues');
  return res.data;
}

/**
 * Fetch all support issues (admin only).
 * GET /api/support/issues
 */
export async function getSupportIssues(): Promise<SupportIssueReport[]> {
  const res = await api.get<SupportIssueReport[]>('/support/issues');
  return res.data;
}

/**
 * Mark a support issue as solved (admin only).
 * PATCH /api/support/issues/:id/resolve
 */
export async function resolveSupportIssue(
  id: string
): Promise<SupportIssueReport> {
  const res = await api.patch<SupportIssueReport>(
    `/support/issues/${id}/resolve`
  );
  return res.data;
}

/**
 * Delete a solved support issue (admin only).
 * DELETE /api/support/issues/:id
 */
export async function deleteSupportIssue(id: string): Promise<void> {
  await api.delete(`/support/issues/${id}`);
}
