"use client";
import {useRef, useState} from "react";
import {Box, Button, CircularProgress, IconButton, Tooltip, Typography, useTheme} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {GenericModal} from "@/src/components/generic-modal";
import {useApi} from "@/src/hooks/use-api";
import {useTranslate} from "@/src/contexts/translation-context";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {flexGenerator} from "@/src/utils/flex-generator";
import {extractFileName} from "@/src/utils/extract-file-name";
import {NfeFileModalProps} from "./types";

const ACCEPT = "image/*,.pdf";

export function NfeFileModal(props: NfeFileModalProps) {
  const [uploading, setUploading] = useState(false);
  const {translate} = useTranslate();
  const {nfe, onClose, onFileChange} = props;
  const {show: showConfirmModal} = useConfirmModal();
  const api = useApi();
  const theme = useTheme();
  const toast = useToaster();
  const fileUrl = nfe?.file_url;
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!nfe) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("nfeId", nfe.id);
    formData.append("file", file);

    await api.fetch("POST", "/api/finance/nfe/upload-file", {
      formData,
      onSuccess: () => {
        toast.successToast("finance.nfe.uploadFileSuccess");
        onFileChange();
      },
    });
    setUploading(false);
  }

  function handleUploadClick() {
    if (!nfe) return;
    if (fileUrl) {
      showConfirmModal({
        message: "finance.nfe.replaceFileConfirm",
        onConfirm: () => fileInputRef.current?.click(),
      });
    } else {
      fileInputRef.current?.click();
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    await uploadFile(file);
  }

  function handleView() {
    if (fileUrl) window.open(fileUrl, "_blank");
  }

  function handleDelete() {
    if (!nfe) return;
    showConfirmModal({
      message: "finance.nfe.deleteFileConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/finance/nfe/delete-file", {
          body: {nfeId: nfe.id},
          onSuccess: () => {
            toast.successToast("finance.nfe.deleteFileSuccess");
            onFileChange();
          },
        });
      },
    });
  }

  function isImage(url: string) {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  return (
    <GenericModal open={!!nfe} onClose={onClose} title={translate("finance.nfe.fileTitle")} maxWidth="sm">
      <input ref={fileInputRef} type="file" accept={ACCEPT} hidden onChange={handleFileSelected} />

      {fileUrl ? (
        <Box sx={{...flexGenerator("c.center.center"), gap: 2}}>
          {isImage(fileUrl) ? (
            <Box
              component="img"
              src={fileUrl}
              alt="NFE File"
              sx={{maxWidth: "100%", maxHeight: 400, borderRadius: 2, cursor: "pointer", objectFit: "contain"}}
              onClick={handleView}
            />
          ) : (
            <Box
              onClick={handleView}
              sx={{
                ...flexGenerator("c.center.center"),
                gap: 1,
                p: 3,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                cursor: "pointer",
                width: "100%",
                "&:hover": {backgroundColor: theme.palette.action.hover},
              }}
            >
              <InsertDriveFileIcon sx={{fontSize: 48, color: "text.secondary"}} />
              <Typography variant="body2" noWrap>
                {extractFileName(fileUrl)}
              </Typography>
            </Box>
          )}

          <Box sx={{...flexGenerator("r.center.center"), gap: 1}}>
            <Tooltip title={translate("finance.nfe.viewFile")}>
              <IconButton onClick={handleView}>
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={translate("finance.nfe.deleteFile")}>
              <IconButton onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ) : (
        <Box sx={{...flexGenerator("c.center.center"), gap: 1, py: 2}}>
          <Typography color="text.secondary">{translate("finance.nfe.noFile")}</Typography>
        </Box>
      )}

      <Box sx={{...flexGenerator("r.center.center")}}>
        <Button
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={16} /> : <UploadFileIcon />}
          onClick={handleUploadClick}
          disabled={uploading}
          sx={{mt: 2}}
        >
          {translate(fileUrl ? "finance.nfe.replaceFile" : "finance.nfe.uploadFile")}
        </Button>
      </Box>
    </GenericModal>
  );
}
