import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

interface Props {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "USER";
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { token, user } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;

  if (requiredRole && user?.role !== "ADMIN" && user?.role !== requiredRole) {
    return <Navigate to="/no-access" replace />;
  }

  return <>{children}</>;
}
