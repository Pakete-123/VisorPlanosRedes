import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

export function RootRedirect() {
  const token = useAuthStore((s) => s.token);
  return <Navigate to={token ? "/projects" : "/login"} replace />;
}
