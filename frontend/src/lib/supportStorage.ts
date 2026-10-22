import { SupportIssueReport } from '../types/support';

const STORAGE_KEY = 'vat_support_issue_reports';

// Clean SVG Data URLs for realistic mock screenshots
const MOCK_SCREENSHOT_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="%230F172A"><rect width="800" height="450" fill="%230B132B"/><rect x="20" y="20" width="760" height="40" rx="8" fill="%231C2541"/><text x="40" y="45" fill="%2364DFDF" font-family="sans-serif" font-size="14" font-weight="bold">DICOM 3D Reconstructor — Case CT-9042</text><rect x="20" y="80" width="520" height="340" rx="12" fill="%23000000"/><circle cx="280" cy="250" r="100" fill="%231E293B" stroke="%2338BDF8" stroke-width="2"/><text x="210" y="255" fill="%23EF4444" font-family="sans-serif" font-size="16" font-weight="bold">Error: WebGL Context Lost</text><rect x="560" y="80" width="220" height="340" rx="12" fill="%231C2541"/><text x="580" y="115" fill="%2394A3B8" font-family="sans-serif" font-size="12">Window: Soft Tissue</text><text x="580" y="145" fill="%2394A3B8" font-family="sans-serif" font-size="12">Level: 40 HU</text><rect x="580" y="180" width="180" height="35" rx="6" fill="%23EF4444"/><text x="610" y="202" fill="%23FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold">Slice Render Failed</text></svg>`;

const MOCK_SCREENSHOT_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="%23F8FAFC"><rect width="800" height="450" fill="%23F1F5F9"/><rect x="40" y="30" width="720" height="60" rx="12" fill="%23FFFFFF" stroke="%23CBD5E1"/><text x="70" y="65" fill="%230A192F" font-family="sans-serif" font-size="16" font-weight="bold">Module 3: Gunshot Wound Reconstruction Quiz</text><rect x="40" y="110" width="720" height="290" rx="16" fill="%23FFFFFF" stroke="%23E2E8F0"/><text x="70" y="150" fill="%231E293B" font-family="sans-serif" font-size="14" font-weight="bold">Question 4: Trajectory Calculation</text><rect x="70" y="180" width="660" height="70" rx="10" fill="%23FEF2F2" stroke="%23FCA5A5"/><text x="90" y="210" fill="%23991B1B" font-family="sans-serif" font-size="13">Submit button is disabled even after selecting Option B</text><text x="90" y="235" fill="%23B91C1C" font-family="sans-serif" font-size="11">Cannot proceed to Question 5</text></svg>`;

const INITIAL_SEEDS: SupportIssueReport[] = [
  {
    id: 'issue-seed-1',
    studentId: 'std-101',
    studentName: 'Dr. Jane Miller',
    studentEmail: 'jane.miller@hospital.org',
    studentAvatar: 'https://images.unsplash.com/photo-1594824813511-2097e3f8864b?auto=format&fit=crop&q=80&w=120',
    description: 'WebGL renderer crashed during 3D bone threshold reconstruction in Case 4.',
    screenshotUrl: MOCK_SCREENSHOT_1,
    screenshotName: 'dicom-webgl-crash.png',
    status: 'pending',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(), // 42 mins ago
  },
  {
    id: 'issue-seed-2',
    studentId: 'std-102',
    studentName: 'Alex Mercer',
    studentEmail: 'alex.mercer@forensics.ac.uk',
    description: 'In Module 3 Quiz Question 4, the Submit button remains greyed out after choosing an option.',
    screenshotUrl: MOCK_SCREENSHOT_2,
    screenshotName: 'quiz-submit-disabled.png',
    status: 'pending',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
  },
];

export const getSupportIssues = (): SupportIssueReport[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDS));
      return INITIAL_SEEDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEEDS;
  } catch {
    return INITIAL_SEEDS;
  }
};

export const saveSupportIssue = (
  newReport: Omit<SupportIssueReport, 'id' | 'createdAt' | 'status'>
): SupportIssueReport => {
  const current = getSupportIssues();
  const created: SupportIssueReport = {
    ...newReport,
    id: `issue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const updated = [created, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Dispatch custom event for real-time local updates across components
  window.dispatchEvent(new Event('vat_support_updated'));
  return created;
};

export const updateSupportIssueStatus = (
  id: string,
  newStatus: 'pending' | 'resolved'
): void => {
  const current = getSupportIssues();
  const updated = current.map((item) =>
    item.id === id ? { ...item, status: newStatus } : item
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('vat_support_updated'));
};

export const deleteSupportIssue = (id: string): void => {
  const current = getSupportIssues();
  const updated = current.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('vat_support_updated'));
};
