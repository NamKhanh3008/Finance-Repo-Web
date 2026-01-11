// src/login.jsx
import React from "react";

// Google Logo SVG Component
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3 bg-white rounded-full p-0.5 text-blue-500" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M21.35 11.1h-9.17v2.98h5.24c-.27 1.67-1.4 3.08-3 4.13l-.02.13 4.35 3.37.3.03c2.69-2.49 4.24-6.16 4.24-10.64 0-1.07-.12-1.98-.32-2.78l-.62-.22z"
    />
    <path
      fill="currentColor"
      d="M12.18 21c2.56 0 4.71-.85 6.27-2.29l-2.97-2.29c-.85.58-1.94.92-3.3.92-2.55 0-4.71-1.72-5.48-4.04l-.13.01-4.52 3.5-.06.13C4.1 19.33 7.82 21 12.18 21z"
    />
    <path
      fill="currentColor"
      d="M6.7 13.3c-.19-.58-.3-1.2-.3-1.85s.11-1.27.3-1.85l-.01-.15-4.55-3.53-.13.07C1.22 7.74.8 9.8.8 12c0 2.2.42 4.26 1.25 5.95l4.65-3.65z"
    />
    <path
      fill="currentColor"
      d="M12.18 5.4c1.39 0 2.64.48 3.63 1.42l2.72-2.72C16.89 2.54 14.73 1.6 12.18 1.6 7.82 1.6 4.1 3.27 2.05 7.1l4.54 3.52c.77-2.32 2.93-4.04 5.48-4.04z"
    />
  </svg>
);

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Login() {

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/login`;
  };

  return (
    // 1. Dark Background Container
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      
      {/* 2. Light Login Card */}
      <div className="bg-white p-10 rounded-xl shadow-2xl w-96 text-center">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-8 text-sm">Sign in to continue to your dashboard</p>
        
        {/* 3. Blue Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <GoogleIcon />
          <span>Sign in with Google</span>
        </button>

        {/* Footer Link (Optional stylistic touch) */}
        <div className="mt-6 text-xs text-gray-400">
          Need help? <span className="text-blue-600 cursor-pointer hover:underline">Contact Support</span>
        </div>

      </div>
    </div>
  );
}