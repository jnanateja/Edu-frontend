import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: "teacher" | "student";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const token = localStorage.getItem("access");
  const userRole = localStorage.getItem("user_role");
  const isAdmin = localStorage.getItem("is_admin") === "true";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Admin should always be allowed into teacher routes
  if (requiredRole === "teacher" && isAdmin) {
    return <>{children}</>;
  }

  if (userRole !== requiredRole) {
    if (isAdmin || userRole === "teacher") {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    if (userRole === "student") {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
