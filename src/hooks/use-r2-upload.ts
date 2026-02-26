"use client";
import {useApi} from "@/src/hooks/use-api";
import {useLoader} from "@/src/contexts/loading-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTranslate} from "@/src/contexts/translation-context";

interface PresignResult {
  presignedUrl: string;
  key: string;
  url: string;
}

export interface R2UploadResult {
  key: string;
  url: string;
}

export function useR2Upload() {
  const {translate} = useTranslate();
  const api = useApi();
  const loader = useLoader();
  const toast = useToaster();

  async function upload(file: File, folder: string): Promise<R2UploadResult | null> {
    loader.show(translate("global.fileUploader.sending"));
    try {
      const presignData = await api.fetch<PresignResult>("POST", "/api/upload/presign", {
        body: {folder, fileName: file.name, fileType: file.type, fileSize: file.size},
        hideLoader: true,
      });

      if (!presignData) return null;

      const putResponse = await fetch(presignData.presignedUrl, {
        method: "PUT",
        body: file,
        headers: {"Content-Type": file.type || "application/octet-stream"},
      });

      if (!putResponse.ok) {
        toast.errorToast("api.errors.uploadFailed");
        return null;
      }

      return {key: presignData.key, url: presignData.url};
    } catch {
      toast.errorToast("api.errors.somethingWentWrong");
      return null;
    } finally {
      loader.hide();
    }
  }

  async function deleteOrphan(url: string): Promise<void> {
    await api.fetch("DELETE", "/api/upload/cleanup", {
      body: {url},
      hideLoader: true,
    });
  }

  return {upload, deleteOrphan};
}
