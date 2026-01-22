import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/landing/HomePage";
import CoursesPage from "./components/courses/CoursesPage";
import CourseDetailPage from "./components/courses/CourseDetailPage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import StudentDashboard from "./components/student/StudentDashboard";
import TeacherLayout from "./components/layout/TeacherLayout";
import StudentLayout from "./components/layout/StudentLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Teacher Routes */}
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
          <Route path="courses/:courseId" element={<CourseDetailPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Protected Student Routes */}
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
          <Route path="courses/:courseId" element={<CourseDetailPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Legacy Routes (Redirects for backward compatibility) */}
        <Route path="/teacher/home" element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="/student/home" element={<Navigate to="/student/dashboard" replace />} />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
