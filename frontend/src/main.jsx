import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// 1. Import React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import "./index.css";
import Login from "./Login/login.jsx";
import AuthRedirect from "./Login/AuthRedirect.jsx";
import Dashboard from "./Main/Dashboard.jsx";
import Workspace from "./Main/Workspace.jsx"; 

// 2. Create the Client instance (The Cache Memory)
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 3. Wrap everything in the Provider */}
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login-success" element={<AuthRedirect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  </StrictMode>
);