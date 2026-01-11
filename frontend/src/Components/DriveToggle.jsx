import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const DriveToggle = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state for better UX

  // Helper to get token safely
  const getToken = () => localStorage.getItem("authToken");

  // 1. Fetch Status on Load (The "Persistence" Logic)
  useEffect(() => {
    const fetchStatus = async () => {
      const token = getToken();
      
      // If no token, we can't check status, so just stop loading
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Query the DB to see if Drive is TRULY connected
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          // This updates the UI based on the Database, not just temporary state
          setIsConnected(data.is_drive_connected);
        }
      } catch (err) {
        console.error("Error fetching drive status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  // 2. Handle Click
  const handleToggle = async () => {
    const token = getToken();
    if (!token) {
      alert("Please log in first.");
      return;
    }

    if (!isConnected) {
      // Connect: Get URL -> Redirect to Google
      try {
        const res = await fetch(`${API_BASE}/auth/connect-drive`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          window.location.href = data.url; // Redirects to Google
        } else {
          console.error("Failed to initiate Drive connection");
        }
      } catch (err) {
        console.error("Network error connecting to Drive:", err);
      }
    } else {
      // Disconnect: Call API -> Update UI
      try {
        await fetch(`${API_BASE}/auth/disconnect-drive`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsConnected(false); // Update UI instantly
      } catch (err) {
        console.error("Error disconnecting:", err);
      }
    }
  };

  // Optional: Show a loading state while we check the DB
  if (loading) {
    return <button className="btn-grey" disabled>Checking...</button>;
  }

  return (
    <button 
      onClick={handleToggle} 
      className={isConnected ? "btn-green" : "btn-grey"}
    >
      {isConnected ? "Disconnect Drive" : "Connect Drive"}
    </button>
  );
};