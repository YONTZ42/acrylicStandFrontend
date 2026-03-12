import { useCallback, useState } from "react";
import { http } from "@/shared/api/http";
import type { paths } from "@/shared/types/fromBackend/schema";

type UploadIssueReq =
  paths["/api/uploads/{action}/"]["post"]["requestBody"]["content"]["application/json"];

type UploadConfirmReq = {
  uploadSessionId: string;
};

type IssueResLike = {
  uploadUrl?: string;
  uploadSessionId?: string;
  s3Key?: string;
  publicUrl?: string;
};

async function putToS3(uploadUrl: string, blob: Blob, mimeType: string) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: blob,
  });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
}

export function useExhibitImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImageAndGetUrl = useCallback(async (blob: Blob) => {
    setIsUploading(true);
    setError(null);

    try {
      const filename = "exhibit.png";
      const mimeType = "image/png";
      const purpose = "exhibit_image";

      const issueBody: UploadIssueReq = { filename, mimeType, purpose };

      // action は backend に合わせて "issue" / "confirm" を想定
      const issue = (await http.post(`/api/uploads/issue/`, issueBody)) as IssueResLike;

      if (!issue.uploadUrl || !issue.uploadSessionId) {
        throw new Error("Upload issue response missing uploadUrl/uploadSessionId");
      }

      await putToS3(issue.uploadUrl, blob, mimeType);

      const confirmBody: UploadConfirmReq = { uploadSessionId: issue.uploadSessionId };
      await http.post(`/api/uploads/confirm/`, confirmBody);

      // 返ってくるならそれを使う（最優先）
      if (issue.publicUrl) return issue.publicUrl;

      // 次点：s3Key が返るなら、それをURLとして扱うか、CDNドメインで組み立てる
      // MiniMuseum 側で「Exhibit.imageOriginalUrl は uri(string)」なので、最終的にURLを入れたい
      if (issue.s3Key) {
        const cdn = import.meta.env.VITE_CLOUDFRONT_DOMAIN || import.meta.env.VITE_PUBLIC_CDN_DOMAIN;
        if (cdn) return `${String(cdn).replace(/\/$/, "")}/${issue.s3Key}`;
        // cdn が無いなら key をそのまま返す（バックエンドがURLとして扱う実装なら通る）
        return issue.s3Key;
      }

      throw new Error("Upload succeeded but no url/key returned");
    } catch (e) {
      console.error(e);
      setError("Upload failed");
      throw e;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { uploadImageAndGetUrl, isUploading, error };
}