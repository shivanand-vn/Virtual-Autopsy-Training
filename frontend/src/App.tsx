import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RegistrationFlowProvider } from './context/RegistrationFlowContext';
import { DiscussionsProvider } from './context/DiscussionsContext';
import { CourseProgressProvider } from './context/CourseProgressContext';
import { QuestionBankProvider } from './context/QuestionBankContext';
import { CourseProvider } from './context/CourseContext';

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
import { ModuleAssessmentPage } from './pages/ModuleAssessment';
import { AssessmentResultPage } from './pages/AssessmentResult';

import { AdminDashboardPage } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsers';
import { AdminCoursesPage } from './pages/admin/AdminCourses';
import { AdminCourseForm } from './pages/admin/AdminCourseForm';
import { AdminCourseDetail } from './pages/admin/AdminCourseDetail';
import { AdminAssignmentsPage } from './pages/admin/AdminAssignments';
import { AdminExamsPage } from './pages/admin/AdminExams';
import { AdminDiscussions } from './pages/admin/AdminDiscussions';
import { AdminDiscussionDetail } from './pages/admin/AdminDiscussionDetail';
import { AdminPaymentsPage } from './pages/admin/AdminPayments';
import { AdminCertificatesPage } from './pages/admin/AdminCertificates';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { AdminSupportPage } from './pages/admin/AdminSupportPage';
import { AdminQuestionBankList } from './pages/admin/AdminQuestionBankList';
import { AdminQuestionForm } from './pages/admin/AdminQuestionForm';
import { AdminQuestionDetail } from './pages/admin/AdminQuestionDetail';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalytics';
import { AdminSettingsPage } from './pages/admin/AdminSettings';

export const App: React.FC = () => {
  return (
    <RegistrationFlowProvider>
      <CourseProvider>
        <CourseProgressProvider>
          <DiscussionsProvider>
            <QuestionBankProvider>
              <Router>
                <Routes>
                  {/* Auth & Registration / Payment Routes */}
                  <Route path="/register" element={<RegistrationPage />} />
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  {/* Student LMS Dashboard Routes */}
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/my-course" element={<MyCoursePage />} />
                  <Route path="/my-course/:moduleId" element={<MyCoursePage />} />
                  <Route path="/my-course/:moduleId/:lessonId" element={<MyCoursePage />} />
                  <Route path="/course" element={<Navigate to="/my-course" replace />} />
                  <Route path="/course/:moduleId" element={<MyCoursePage />} />
                  <Route path="/course/:moduleId/:lessonId" element={<MyCoursePage />} />
                  <Route path="/final-exam" element={<FinalExamPage />} />
                  <Route path="/exam" element={<Navigate to="/final-exam" replace />} />
                  <Route path="/certificate" element={<CertificatePage />} />
                  <Route path="/discussions" element={<Discussions />} />
                  <Route path="/discussions/:discussionId" element={<DiscussionDetail />} />
                  <Route path="/assessment/:moduleId" element={<ModuleAssessmentPage />} />
                  <Route path="/assessment/:moduleId/result" element={<AssessmentResultPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/help-support" element={<SupportPage />} />
                  <Route path="/support" element={<Navigate to="/help-support" replace />} />

                  {/* System Administration Routes */}
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  
                  {/* ADMIN COURSE MANAGEMENT ROUTES */}
                  <Route path="/admin/courses" element={<AdminCoursesPage />} />
                  <Route path="/admin/courses/add" element={<AdminCourseForm />} />
                  <Route path="/admin/courses/:courseId" element={<AdminCourseDetail />} />
                  <Route path="/admin/courses/:courseId/edit" element={<AdminCourseForm />} />

                  {/* ADMIN QUESTION BANK ROUTES */}
                  <Route path="/admin/question-bank" element={<AdminQuestionBankList />} />
                  <Route path="/admin/question-bank/add" element={<AdminQuestionForm />} />
                  <Route path="/admin/question-bank/:questionId" element={<AdminQuestionDetail />} />
                  <Route path="/admin/question-bank/:questionId/edit" element={<AdminQuestionForm />} />

                  <Route path="/admin/assignments" element={<AdminAssignmentsPage />} />
                  <Route path="/admin/exams" element={<AdminExamsPage />} />
                  <Route path="/admin/discussions" element={<AdminDiscussions />} />
                  <Route path="/admin/discussions/:discussionId" element={<AdminDiscussionDetail />} />
                  <Route path="/admin/payments" element={<AdminPaymentsPage />} />
                  <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin/profile" element={<AdminProfilePage />} />
                  <Route path="/admin/support" element={<AdminSupportPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />

                  {/* Default route opens Registration page first */}
                  <Route path="/" element={<Navigate to="/register" replace />} />
                  <Route path="*" element={<Navigate to="/register" replace />} />
                </Routes>
              </Router>
            </QuestionBankProvider>
          </DiscussionsProvider>
        </CourseProgressProvider>
      </CourseProvider>
    </RegistrationFlowProvider>
  );
};

export default App;
