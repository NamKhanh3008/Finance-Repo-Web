// src/Login/AuthRedirect.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Import useSearchParams

const AuthRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook to read URL query params

  useEffect(() => {
    // 1. Get the token from the URL (e.g., .../login-success?token=eyJ...)
    const token = searchParams.get("token");

    if (token) {
      console.log("Token found! Saving to storage...");
      
      // 2. Save it to Local Storage (CRITICAL STEP)
      localStorage.setItem("authToken", token);
      
      // 3. Navigate to Dashboard immediately
      navigate("/dashboard");
    } else {
      console.error("No token found in URL. Redirecting to login...");
      // If something went wrong, send them back to login after a delay
      setTimeout(() => navigate("/"), 2000);
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-400 mb-4">Login Successful!</h1>
        <p className="text-gray-400">Saving your session...</p>
      </div>
    </div>
  );
};

export default AuthRedirect;