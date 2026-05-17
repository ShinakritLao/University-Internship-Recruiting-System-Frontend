import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getRedirectPath } from "../services/auth";

/**
 * Generic /dashboard fallback — immediately routes the user to their
 * role-specific dashboard. Unauthenticated users get sent to /login.
 */
export default function Dashboard() {
  const target = getRedirectPath() || "/login";
  return <Navigate to={target} replace />;
}
