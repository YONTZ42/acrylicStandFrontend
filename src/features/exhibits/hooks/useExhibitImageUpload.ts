import { useCallback, useState } from "react";
import { http } from "@/shared/api/http";

type UploadIssueReq = {
  filename: string;
  mime_type: string;
  purpose: "sticker_png" | "page_asset" | "exhibit_image";
};

type UploadIssueRes = {
  uploadUrl?: string;
  uploadSessionId?: string;
  s3Key?: string;
};

type UploadConfirmReq = {
  upload_session_id: string;
};

type UploadConfirmRes = {
  status?: string;
  uploadSessionId?: string;
  s3Key?: string;
  publicUrl?: string;
};

function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

function normalizeImageMimeType(blob: Blob): string {
  const mimeType = blob.type?.trim();

  if (mimeType && mimeType.startsWith("image/")) {
    return mimeType;
  }

  throw new Error(`Unsupported or missing blob.type: "${blob.type || ""}"`);
}

async function putToS3(uploadUrl: string, blob: Blob, mimeType: string) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
    },
    body: blob,
  });

  if (!res.ok) {
    throw new Error(`S3 upload failed: ${res.status}`);
  }
}

export function useExhibitImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImageAndGetUrl = useCallback(async (blob: Blob): Promise<string> => {
    setIsUploading(true);
    setError(null);

    try {
      const mimeType = normalizeImageMimeType(blob);
      const extension = getExtensionFromMimeType(mimeType);
      const filename = `exhibit.${extension}`;
      const purpose: UploadIssueReq["purpose"] = "exhibit_image";

      const issueBody: UploadIssueReq = {
        filename,
        mime_type: mimeType,
        purpose,
      };

      const issue = await http.post<UploadIssueRes, UploadIssueReq>(
        "/api/uploads/issue/",
        issueBody
      );

      if (!issue?.uploadUrl || !issue?.uploadSessionId) {
        throw new Error("Upload issue response missing uploadUrl or uploadSessionId");
      }

      await putToS3(issue.uploadUrl, blob, mimeType);

      const confirmBody: UploadConfirmReq = {
        upload_session_id: issue.uploadSessionId,
      };

      const confirm = await http.post<UploadConfirmRes, UploadConfirmReq>(
        "/api/uploads/confirm/",
        confirmBody
      );

      if (!confirm?.publicUrl) {
        throw new Error("Upload confirm response missing publicUrl");
      }

      return confirm.publicUrl;
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Upload failed");
      throw e;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadImageAndGetUrl,
    isUploading,
    error,
  };
}