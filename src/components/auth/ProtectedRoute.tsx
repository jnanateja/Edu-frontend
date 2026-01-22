import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: "teacher" | "student";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const token = localStorage.getItem("access");
  const userRole = localStorage.getItem("user_role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== requiredRole) {
    // Redirect based on actual role
    if (userRole === "teacher") {
      return <Navigate to="/teacher/dashboard" replace />;
    } else if (userRole === "student") {
      return <Navigate to="/student/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;