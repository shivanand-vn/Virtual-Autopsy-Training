import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RegistrationFlowProvider } from './context/RegistrationFlowContext';
import { DiscussionsProvider } from './context/DiscussionsContext';
import { LoginPage } from './pages/Login';
import { RegistrationPage } from './pages/Registration';
import { PaymentPage } from './pages/Payment';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { DashboardPage } from './pages/Dashboard';
import { MyCoursePage } from './pages/MyCourse';
import { AssignmentsPage } from './pages/Assignments';
import { FinalExamPage } from './pages/FinalExam';
import { CertificatePage } from './pages/Certificate';
import { ProfilePage } from './pages/Profile';
import { SupportPage } from './pages/Support';
import { Discussions } from './pages/Discussions';
import { DiscussionDetail } from './pages/DiscussionDetail';

import { AdminDashboardPage } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsers';
import { AdminCoursesPage } from './pages/admin/AdminCourses';
import { AdminAssignmentsPage } from './pages/admin/AdminAssignments';
import { AdminExamsPage } from './pages/admin/AdminExams';
import { AdminDiscussions } from './pages/admin/AdminDiscussions';
import { AdminDiscussionDetail } from './pages/admin/AdminDiscussionDetail';
import { AdminPaymentsPage } from './pages/admin/AdminPayments';
import { AdminCertificatesPage } from './pages/admin/AdminCertificates';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { AdminSupportPage } from './pages/admin/AdminSupportPage';

export const App: React.FC = () => {
  return (
    <RegistrationFlowProvider>
      <DiscussionsProvider>
        <Router>
          <Routes>
            {/* Auth & Registration / Payment Routes */}
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Student LMS Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/course" element={<MyCoursePage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/discussions" element={<Discussions />} />
            <Route path="/discussions/:discussionId" element={<DiscussionDetail />} />
            <Route path="/exam" element={<FinalExamPage />} />
            <Route path="/certificate" element={<CertificatePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/support" element={<SupportPage />} />

            {/* System Administration Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/assignments" element={<AdminAssignmentsPage />} />
            <Route path="/admin/exams" element={<AdminExamsPage />} />
            <Route path="/admin/discussions" element={<AdminDiscussions />} />
            <Route path="/admin/discussions/:discussionId" element={<AdminDiscussionDetail />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/support" element={<AdminSupportPage />} />

            {/* Default route opens Registration page first */}
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="*" element={<Navigate to="/register" replace />} />
          </Routes>
        </Router>
      </DiscussionsProvider>
    </RegistrationFlowProvider>
  );
};

export default App;
