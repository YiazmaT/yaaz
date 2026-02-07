"use client";
import {useRef, useState} from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {useApi} from "@/src/hooks/use-api";
import {useTranslate} from "@/src/contexts/translation-context";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTheme} from "@mui/material";
import {flexGenerator} from "@/src/utils/flex-generator";
import {blackOrWhite} from "@/src/utils/black-or-white";
import {extractFileName} from "@/src/utils/extract-file-name";
import {FilesModalProps} from "./types";

const MAX_FILES = 5;

export function FilesModal(props: FilesModalProps) {
  const [uploading, setUploading] = useState(false);
  const {translate} = useTranslate();
  const {show: showConfirmModal} = useConfirmModal();
  const api = useApi();
  const toast = useToaster();
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const buttonTextColor = blackOrWhite(theme.palette.primary.main);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) fileInputRef.current.value = "";

    if (file.size > props.maxFileSizeMb * 1024 * 1024) {
      toast.errorToast("products.files.fileTooLarge");
      return;
    }

    if (props.files.length >= MAX_FILES) {
      toast.errorToast("products.files.maxFiles");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("productId", props.productId);
    formData.append("file", file);

    await api.fetch("POST", "/api/product/upload-file", {
      formData,
      onSuccess: (data: {files: string[]}) => {
        toast.successToast("products.files.uploadSuccess");
        props.onFilesChange(data.files);
      },
    });
    setUploading(false);
  }

  function handleOpenInNewTab(fileUrl: string) {
    window.open(fileUrl, "_blank");
  }

  async function handleDownload(fileUrl: string) {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = extractFileName(fileUrl);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  function handleDelete(fileUrl: string) {
    showConfirmModal({
      message: "products.files.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/product/delete-file", {
          body: {productId: props.productId, fileUrl},
          onSuccess: (data: {files: string[]}) => {
            toast.successToast("products.files.deleteSuccess");
            props.onFilesChange(data.files);
          },
        });
      },
    });
  }

  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{...flexGenerator("r.center.space-between")}}>
        <Typography variant="h6" component="span">
          {translate("products.files.title")} - {props.productName}
        </Typography>
        <IconButton onClick={props.onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{...flexGenerator("r.center.space-between"), mb: 2}}>
          <Typography variant="body2" color="text.secondary">
            {props.files.length}/{MAX_FILES} {translate("products.files.counter")}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleUploadClick}
            disabled={uploading || props.files.length >= MAX_FILES}
            sx={{...flexGenerator("r.center.center"), gap: 1}}
          >
            {uploading ? (
              <CircularProgress size={16} sx={{color: buttonTextColor}} />
            ) : (
              <UploadFileIcon fontSize="small" sx={{color: buttonTextColor}} />
            )}
            <Typography variant="body2" sx={{color: buttonTextColor}}>
              {translate("products.files.upload")}
            </Typography>
          </Button>
          <input ref={fileInputRef} type="file" hidden onChange={handleFileSelected} />
        </Box>

        {props.files.length === 0 ? (
          <Box sx={{...flexGenerator("r.center.center"), padding: 4}}>
            <Typography color="text.secondary">{translate("global.noDataFound")}</Typography>
          </Box>
        ) : (
          <List sx={{maxHeight: 400, overflow: "auto"}}>
            {props.files.map((fileUrl) => (
              <ListItem
                key={fileUrl}
                sx={{borderBottom: "1px solid", borderColor: "divider", gap: 1}}
                secondaryAction={
                  <Box sx={{...flexGenerator("r.center"), gap: 0.5}}>
                    <Tooltip title={translate("products.files.openInNewTab")}>
                      <IconButton size="small" onClick={() => handleOpenInNewTab(fileUrl)}>
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={translate("products.files.download")}>
                      <IconButton size="small" onClick={() => handleDownload(fileUrl)}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={translate("products.files.delete")}>
                      <IconButton size="small" onClick={() => handleDelete(fileUrl)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <InsertDriveFileIcon sx={{color: "text.secondary", mr: 1}} fontSize="small" />
                <ListItemText
                  primary={
                    <Tooltip title={extractFileName(fileUrl)} placement="top">
                      <Typography variant="body2" noWrap sx={{maxWidth: 200}}>
                        {extractFileName(fileUrl)}
                      </Typography>
                    </Tooltip>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
