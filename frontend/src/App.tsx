import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { RegistrationPage } from './pages/Registration';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { DashboardPage } from './pages/Dashboard';
import { MyCoursePage } from './pages/MyCourse';
import { AssignmentsPage } from './pages/Assignments';
import { FinalExamPage } from './pages/FinalExam';
import { CertificatePage } from './pages/Certificate';
import { ProfilePage } from './pages/Profile';
import { SupportPage } from './pages/Support';

import { AdminDashboardPage } from './pages/admin/AdminDashboard';
import { AdminPlaceholderPage } from './pages/admin/AdminPlaceholderPage';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Student LMS Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/course" element={<MyCoursePage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/exam" element={<FinalExamPage />} />
        <Route path="/certificate" element={<CertificatePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/support" element={<SupportPage />} />

        {/* System Administration Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/applications" element={<AdminPlaceholderPage title="Applications" subtitle="Applications" />} />
        <Route path="/admin/users" element={<AdminPlaceholderPage title="Users" subtitle="Users" />} />
        <Route path="/admin/courses" element={<AdminPlaceholderPage title="Courses" subtitle="Courses" />} />
        <Route path="/admin/assignments" element={<AdminPlaceholderPage title="Assignments" subtitle="Assignments" />} />
        <Route path="/admin/exams" element={<AdminPlaceholderPage title="Exams" subtitle="Exams" />} />
        <Route path="/admin/payments" element={<AdminPlaceholderPage title="Payments" subtitle="Payments" />} />
        <Route path="/admin/certificates" element={<AdminPlaceholderPage title="Certificates" subtitle="Certificates" />} />
        <Route path="/admin/support" element={<AdminPlaceholderPage title="Support" subtitle="Support" />} />

        {/* Default route opens Registration page first */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
