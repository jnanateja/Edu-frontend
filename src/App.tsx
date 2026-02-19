import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./components/landing/HomePage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import StudentDashboard from "./components/student/StudentDashboard";
import TeacherLayout from "./components/layout/TeacherLayout";
import StudentLayout from "./components/layout/StudentLayout";
import StudentTakeQuiz from "./components/student/StudentTakeQuiz";
import StudentGrades from "./components/student/StudentGrades";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CourseDetail from "./components/teacher/CourseDetail";

import PackagesPage from "./components/packages/PackagesPage";
import PackageDetailPage from "./components/packages/PackageDetailPage";
import StudentCourseDetail from "./components/student/StudentCourseDetail";
import StudentPackagesPage from "./components/student/StudentPackagesPage";
import StudentPackageDetail from "./components/student/StudentPackageDetail";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />

        {/* Packages (Public browsing) */}
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/packages/:packageId" element={<PackageDetailPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Teacher protected */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Student protected */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="packages" element={<StudentPackagesPage />} />
              <Route path="grades" element={<StudentGrades />} />
          <Route path="packages/:packageId" element={<StudentPackageDetail />} />
          <Route path="courses/:courseId" element={<StudentCourseDetail />} />
              <Route path="quizzes/:quizId" element={<StudentTakeQuiz />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Public course detail: redirect to login WITH redirect param */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
