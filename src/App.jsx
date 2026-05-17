import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { getRedirectPath, isLoggedIn } from "./services/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import StudentDashboard from "./pages/StudentDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Dashboard from "./pages/Dashboard";

function PublicRoute({ children }) {
  if (isLoggedIn()) {
    return <Navigate to={getRedirectPath() || "/dashboard"} replace />;
  }
  return children;
}

function PrivateRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: "var(--font-sans)",
            borderRadius: "var(--radius-lg)",
            fontSize: "var(--text-base)",
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/student-dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
        <Route path="/company-dashboard" element={<PrivateRoute><CompanyDashboard /></PrivateRoute>} />
        <Route path="/staff-dashboard" element={<PrivateRoute><StaffDashboard /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/" element={<Navigate to={getRedirectPath() || "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;