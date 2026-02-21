"use client";
import {useRef, useState} from "react";
import {Box, CircularProgress, IconButton, List, ListItem, Tooltip, Typography, useMediaQuery, useTheme} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {useApi} from "@/src/hooks/use-api";
import {useTranslate} from "@/src/contexts/translation-context";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {flexGenerator} from "@/src/utils/flex-generator";
import {extractFileName} from "@/src/utils/extract-file-name";
import {GenericModal} from "@/src/components/generic-modal";
import {FilesModalProps} from "./types";

const MAX_FILES = 5;

export function FilesModal(props: FilesModalProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const {translate} = useTranslate();
  const {show: showConfirmModal} = useConfirmModal();
  const api = useApi();
  const toast = useToaster();
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  async function uploadFile(file: File) {
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

    await api.fetch("POST", "/api/stock/product/upload-file", {
      formData,
      onSuccess: (data: string[]) => {
        toast.successToast("products.files.uploadSuccess");
        props.onFilesChange(data);
      },
    });
    setUploading(false);
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    await uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
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
        await api.fetch("DELETE", "/api/stock/product/delete-file", {
          body: {productId: props.productId, fileUrl},
          onSuccess: (data: string[]) => {
            toast.successToast("products.files.deleteSuccess");
            props.onFilesChange(data);
          },
        });
      },
    });
  }

  return (
    <GenericModal open={props.open} onClose={props.onClose} title={`${translate("products.files.title")} - ${props.productName}`}>
      <Box onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <Box sx={{...flexGenerator("r.center.space-between"), mb: 2}}>
          <Typography variant="body2" color="text.secondary">
            {props.files.length}/{MAX_FILES} {translate("products.files.counter")}
          </Typography>
        </Box>
        <Box
          onClick={handleUploadClick}
          sx={{
            border: `2px dashed ${dragging ? theme.palette.primary.main : theme.palette.divider}`,
            borderRadius: 2,
            padding: 3,
            mb: 2,
            cursor: uploading || props.files.length >= MAX_FILES ? "default" : "pointer",
            opacity: uploading || props.files.length >= MAX_FILES ? 0.5 : 1,
            backgroundColor: dragging ? `${theme.palette.primary.main}10` : "transparent",
            transition: "all 0.2s",
            ...flexGenerator("c.center.center"),
            gap: 1,
          }}
        >
          {uploading ? (
            <CircularProgress size={32} sx={{color: theme.palette.primary.main}} />
          ) : (
            <UploadFileIcon sx={{color: theme.palette.primary.main, fontSize: 32}} />
          )}
          <Typography variant="body2" color="text.secondary">
            {translate("products.files.dropHere")}
          </Typography>
        </Box>
        <input ref={fileInputRef} type="file" hidden onChange={handleFileSelected} />

        {props.files.length === 0 ? (
          <Box sx={{...flexGenerator("r.center.center"), padding: 4}}>
            <Typography color="text.secondary">{translate("global.noDataFound")}</Typography>
          </Box>
        ) : (
          <List sx={{maxHeight: 400, overflow: "auto"}}>
            {props.files.map((fileUrl) => (
              <ListItem
                key={fileUrl}
                sx={{borderBottom: "1px solid", borderColor: "divider", ...flexGenerator(isMobile ? "c" : "r.center.space-between"), gap: 1, py: 1}}
              >
                <Box sx={{...flexGenerator("r.center"), gap: 1, minWidth: 0, flex: 1, ...(isMobile && {alignSelf: "flex-start"})}}>
                  <InsertDriveFileIcon sx={{color: "text.secondary", flexShrink: 0}} fontSize="small" />
                  <Tooltip title={extractFileName(fileUrl)} placement="top">
                    <Typography variant="body2" noWrap>
                      {extractFileName(fileUrl)}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{...flexGenerator("r.center"), gap: 0.5, ...(isMobile && {alignSelf: "flex-end"}), flexShrink: 0}}>
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
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </GenericModal>
  );
}
