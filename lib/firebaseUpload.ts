import * as FileSystem from "expo-file-system";
import { apiFetch } from "./api";

export interface UploadedFile {
  id: string;
  url: string;
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

/**
 * Upload file using Signed URL flow (Serverless style)
 * 1. Get Upload URL from backend
 * 2. Upload directly to Cloud Storage (PUT)
 * 3. Save metadata to backend
 */
export async function uploadFileWithSignedUrl(
  uri: string,
  fileName: string,
  mimeType: string,
  doubtId: string,
  onProgress?: (progress: number) => void,
): Promise<UploadedFile> {
  console.log("[Upload] Starting upload flow for:", fileName);

  try {
    // 1. Get Signed URL
    const uploadConfig = (await apiFetch("/api/doubts/upload-url", {
      method: "POST",
      body: JSON.stringify({
        fileName,
        fileType: mimeType,
        doubtId,
      }),
    })) as {
      uploadUrl: string;
      storagePath: string;
    };

    console.log(
      "[Upload] Got signed URL, uploading to:",
      uploadConfig.storagePath,
    );

    // 2. Upload to Blob Storage
    // Expo FileSystem doesn't support PUT with progress easily for binary blobs same way as fetch might but
    // FileSystem.uploadAsync supports PUT.
    const uploadResult = await FileSystem.uploadAsync(
      uploadConfig.uploadUrl,
      uri,
      {
        httpMethod: "PUT",
        headers: {
          "Content-Type": mimeType,
        },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT, // Important for PUT
      },
    );

    if (uploadResult.status !== 200) {
      console.error(
        "[Upload] Cloud storage rejected upload:",
        uploadResult.body,
      );
      throw new Error("Failed to upload file to storage");
    }

    console.log("[Upload] Blob upload success. Saving metadata...");

    // Get file size (approximate from local file)
    const fileInfo = await FileSystem.getInfoAsync(uri);
    const fileSize = fileInfo.exists ? fileInfo.size : 0;

    // 3. Save Metadata
    // The uploadUrl is a signed URL (temporarily valid), but we want to store it as the access URL for now.
    // However, usually we want a GET signed URL, not the PUT one.
    // The backend `save-file-metadata` expects `url`.
    // In our flow, `upload-url` returned a PUT url. We shouldn't save THAT as the download url.
    // But `save-file-metadata` blindly saves what we pass.
    // Ideally, we should request a READ signed URL or let the backend generate one.
    // For now, let's pass a placeholder or the `storagePath` again, and let the backend/frontend generate read URLs on demand.
    // Actually, `doubtRoutes` `getDoubtFiles` regenerates signed URLs. So the stored `url` field is somewhat ephemeral or just a fallback.
    // let's pass null or empty string for url if possible? No, it's required.
    // We can pass the bucket path as URL for now, or just the storagePath.

    const metadataRes = (await apiFetch("/api/doubts/save-file-metadata", {
      method: "POST",
      body: JSON.stringify({
        doubtId,
        fileName,
        fileType: mimeType,
        fileSize,
        storagePath: uploadConfig.storagePath,
        url: uploadConfig.storagePath, // The backend will regenerate Signed URLs on fetch anyway
      }),
    })) as {
      file: UploadedFile;
    };

    return metadataRes.file;
  } catch (error) {
    console.error("[Upload] Error:", error);
    throw error;
  }
}
