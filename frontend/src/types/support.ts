export interface SupportIssueReport {
  id: string;
  studentName: string;
  studentEmail: string;
  category: string;
  description: string;
  screenshotBase64?: string;
  status: 'pending' | 'solved';
  submittedAt: string;
  resolvedAt?: string;
}

/** Payload for POST /api/support/issues */
export interface CreateSupportIssuePayload {
  studentName: string;
  studentEmail: string;
  category: string;
  description: string;
  screenshotBase64?: string | null;
}
