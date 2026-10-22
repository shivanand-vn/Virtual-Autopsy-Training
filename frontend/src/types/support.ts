export interface SupportIssueReport {
  id: string;
  studentId?: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  description: string;
  screenshotUrl: string;
  screenshotName?: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}
