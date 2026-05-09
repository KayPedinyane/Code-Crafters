import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Not logged in at all → go to login
  if (!storedUser || !token) {
    return <Navigate to="/" replace />;
  }

  // Logged in but wrong role → redirect to their own homepage
  if (allowedRoles && !allowedRoles.includes(storedUser.role)) {
    if (storedUser.role === "admin") return <Navigate to="/admin" replace />;
    if (storedUser.role === "user") return <Navigate to="/applicant" replace />;
    if (storedUser.role === "provider") return <Navigate to="/provider" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;