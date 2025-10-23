import { Navigate, Outlet } from "react-router-dom";
import  useAuth  from "../../hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center">
      <Loader2 className="w-15 h-15"/>;
    </div>

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}