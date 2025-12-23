import React, { useState, useMemo } from "react";
import { useShareProject } from "../hooks/useShareProject";

const ShareModal = ({ projectId, onClose }) => {
  const {
    shares: rawShares,
    loading,
    error,
    shareProject,
  } = useShareProject(projectId, true);

  // 🔒 HARD SAFETY: force shares to always be an array
  const shares = Array.isArray(rawShares) ? rawShares : [];

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [successMsg, setSuccessMsg] = useState("");

  // 🔒 SAFE memo (never crashes)
  const alreadyShared = useMemo(() => {
    if (!email) return false;
    return shares.some(
      (s) => s.email?.toLowerCase() === email.toLowerCase()
    );
  }, [shares, email]);

  const handleShare = async (e) => {
    e.preventDefault();
    setSuccessMsg("");

    if (!email || alreadyShared) return;

    const res = await shareProject(email, role);

    if (res?.success) {
      setEmail("");
      setSuccessMsg("User added successfully");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-gray-800 w-full max-w-md rounded-lg p-6 border border-gray-700">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Share Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* EXISTING SHARES */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">People with access</p>

          <div className="space-y-2 max-h-32 overflow-y-auto">
            {loading && (
              <p className="text-xs text-gray-500">Loading…</p>
            )}

            {!loading && shares.length === 0 && (
              <p className="text-xs text-gray-500">
                No collaborators yet
              </p>
            )}

            {shares.map((s) => (
              <div
                key={s.user_id || s.email}
                className="flex justify-between bg-gray-900 px-3 py-2 rounded text-sm"
              >
                <span className="text-white truncate">
                  {s.email || "Unknown user"}
                </span>
                <span className="text-gray-400">
                  {s.role || "VIEWER"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SHARE FORM */}
        <form onSubmit={handleShare} className="space-y-4">
          <input
            type="email"
            required
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
          >
            <option value="VIEWER">Viewer</option>
            <option value="EDITOR">Editor</option>
          </select>

          {alreadyShared && (
            <p className="text-xs text-yellow-400">
              This user already has access
            </p>
          )}

          {error && (
            <p className="text-xs text-red-400">
              {typeof error === "string" ? error : "Failed to load shares"}
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-green-400">{successMsg}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || alreadyShared}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? "Sharing..." : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
