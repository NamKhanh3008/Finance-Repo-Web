import { get, set, clear } from 'idb-keyval';

// 1. Save PDF Blob to Browser Storage
export const cachePDF = async (fileId, blob) => {
    try {
        await set(`pdf_${fileId}`, blob);
        console.log(`[Cache] Saved PDF for file ${fileId}`);
    } catch (err) {
        console.warn("[Cache] Failed to save PDF", err);
    }
};

// 2. Retrieve PDF Blob from Browser Storage
export const getCachedPDF = async (fileId) => {
    try {
        return await get(`pdf_${fileId}`);
    } catch (err) {
        console.warn("[Cache] Failed to retrieve PDF", err);
        return null;
    }
};

// 3. Clear All Cache (Use on Logout)
// This was likely missing or not exported in your file
export const clearPDFCache = async () => {
    try {
        await clear();
        console.log("[Cache] All local PDFs wiped.");
    } catch (err) {
        console.error("[Cache] Failed to clear", err);
    }
};