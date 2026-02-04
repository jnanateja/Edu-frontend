import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: "teacher" | "student";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const token = localStorage.getItem("access");
  const userRole = localStorage.getItem("user_role");
  const admin = localStorage.getItem("is_admin");


  if (!token) {
    return <Navigate to="/" replace />;
  }
  console.log("fuk")
  console.log(admin)

  if (userRole !== requiredRole) {
    // Redirect based on actual role
    if (userRole === "teacher" || admin) {
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