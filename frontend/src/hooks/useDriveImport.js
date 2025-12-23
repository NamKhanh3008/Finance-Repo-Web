import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api/file";

export const useDriveImport = (token, onImportSuccess) => {
  const [driveFiles, setDriveFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 1️⃣ Fetch Drive files
  const fetchDriveFiles = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/drive/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Drive files:", res.data);
      setDriveFiles(res.data || []);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Drive Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2️⃣ Import Drive file into your app
  const importFile = async (driveFile, targetFileId = null, parentId = null) => {
    try {
      setIsLoading(true);

      console.log("Importing:", driveFile);

      await axios.post(
        `${BASE_URL}/drive/import`,
        {
          file_id: driveFile.id,
          name: driveFile.name,
          mime_type: driveFile.mimeType,
          target_file_id: targetFileId, // for replacing existing file
          parent_id: parentId,           // for creating new file
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Close modal + refresh viewer
      setShowModal(false);
      onImportSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Import failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    driveFiles,
    isLoading,
    showModal,
    setShowModal,
    fetchDriveFiles,
    importFile,
  };
};
