import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RegistrationFlowProvider } from './context/RegistrationFlowContext';
import { DiscussionsProvider } from './context/DiscussionsContext';
import { CourseProgressProvider } from './context/CourseProgressContext';
import { QuestionBankProvider } from './context/QuestionBankContext';
import { CourseProvider } from './context/CourseContext';
import { FinalExamProvider } from './context/FinalExamContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';

import { LoginPage } from './pages/student/Login';
import { RegistrationPage } from './pages/student/Registration';
import { PaymentPage } from './pages/student/Payment';
import { ForgotPasswordPage } from './pages/student/ForgotPassword';
import { DashboardPage } from './pages/student/Dashboard';
import { MyCoursePage } from './pages/student/MyCourse';
import { AssignmentsPage } from './pages/student/Assignments';
import { FinalExamPage } from './pages/student/FinalExam';
import { CertificatePage } from './pages/student/Certificate';
import { ProfilePage } from './pages/student/Profile';
import { SupportPage } from './pages/student/Support';
import { Discussions } from './pages/student/Discussions';
import { DiscussionDetail } from './pages/student/DiscussionDetail';
import { ModuleAssessmentPage } from './pages/student/ModuleAssessment';
import { AssessmentResultPage } from './pages/student/AssessmentResult';

import { AdminDashboardPage } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsers';
import { AdminCoursesPage } from './pages/admin/AdminCourses';
import { AdminCourseForm } from './pages/admin/AdminCourseForm';
import { AdminCourseDetail } from './pages/admin/AdminCourseDetail';
import { AdminAssignmentsPage } from './pages/admin/AdminAssignments';
import { AdminExamsPage } from './pages/admin/AdminExams';
import { AdminExamFormPage } from './pages/admin/AdminExamForm';
import { AdminExamDetailPage } from './pages/admin/AdminExamDetail';
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
import { AdminApplicationsPage } from './pages/admin/AdminApplications';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <RegistrationFlowProvider>
        <CourseProvider>
          <CourseProgressProvider>
            <DiscussionsProvider>
              <QuestionBankProvider>
                <FinalExamProvider>
                  <Router>
                    <Routes>
                      {/* Public & Guest Routes */}
                      <Route path="/register" element={<RegistrationPage />} />
                      <Route path="/payment" element={<PaymentPage />} />
                      <Route
                        path="/login"
                        element={
                          <PublicOnlyRoute>
                            <LoginPage />
                          </PublicOnlyRoute>
                        }
                      />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                      {/* Student LMS Protected Routes */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <DashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/my-course"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <MyCoursePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/my-course/:moduleId"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <MyCoursePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/my-course/:moduleId/:lessonId"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <MyCoursePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/course" element={<Navigate to="/my-course" replace />} />
                      <Route
                        path="/course/:moduleId"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <MyCoursePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/course/:moduleId/:lessonId"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <MyCoursePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/final-exam"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <FinalExamPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/exam" element={<Navigate to="/final-exam" replace />} />
                      <Route
                        path="/certificate"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <CertificatePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/discussions"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <Discussions />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/discussions/:discussionId"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <DiscussionDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/assessment/:moduleId"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <ModuleAssessmentPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/assessment/:moduleId/result"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <AssessmentResultPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/help-support"
                        element={
                          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <SupportPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/support" element={<Navigate to="/help-support" replace />} />

                      {/* System Administration Protected Routes */}
                      <Route
                        path="/admin/dashboard"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/users"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminUsersPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/applications"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminApplicationsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/courses"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminCoursesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/courses/add"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminCourseForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/courses/:courseId"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminCourseDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/courses/:courseId/edit"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminCourseForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/question-bank"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminQuestionBankList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/question-bank/add"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminQuestionForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/question-bank/:questionId"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminQuestionDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/question-bank/:questionId/edit"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminQuestionForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/assignments"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminAssignmentsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/exams"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminExamsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/exams/create"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminExamFormPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/exams/:examId"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminExamDetailPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/exams/:examId/edit"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminExamFormPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/discussions"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDiscussions />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/discussions/:discussionId"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDiscussionDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/payments"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminPaymentsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/certificates"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminCertificatesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/analytics"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminAnalyticsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/profile"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/support"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminSupportPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/settings"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminSettingsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Fallback routes */}
                      <Route path="/" element={<Navigate to="/register" replace />} />
                      <Route path="*" element={<Navigate to="/register" replace />} />
                    </Routes>
                  </Router>
                </FinalExamProvider>
              </QuestionBankProvider>
            </DiscussionsProvider>
          </CourseProgressProvider>
        </CourseProvider>
      </RegistrationFlowProvider>
    </AuthProvider>
  );
};

export default App;
