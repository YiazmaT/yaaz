"use client";
import {useRef, useState} from "react";
import {Box, CircularProgress, IconButton, Typography} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {useTranslate} from "@/src/contexts/translation-context";
import {flexGenerator} from "@/src/utils/flex-generator";
import {FileUploaderProps} from "./types";

export function FileUploader({value, onChange, accept, width = "100%", height = 110, disabled = false, uploading = false}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const {translate} = useTranslate();
  const inputRef = useRef<HTMLInputElement>(null);

  const isBlocked = disabled || uploading;

  function handleClick() {
    if (isBlocked || value) return;
    inputRef.current?.click();
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (file) onChange(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!isBlocked && !value) setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (isBlocked || value) return;
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) onChange(file);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
  }

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={handleFileInput} />
      <Box
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          width,
          minHeight: height,
          border: "2px dashed",
          borderColor: isDragOver ? "primary.main" : "divider",
          borderRadius: 2,
          cursor: isBlocked || value ? "default" : "pointer",
          opacity: isBlocked ? 0.5 : 1,
          backgroundColor: isDragOver ? "action.hover" : "transparent",
          transition: "border-color 0.15s ease, background-color 0.15s ease",
          overflow: "hidden",
          ...flexGenerator("r.center.center"),
          ...(!isBlocked &&
            !value && {
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "action.hover",
              },
            }),
        }}
      >
        {value ? (
          <Box sx={{...flexGenerator("r.center.space-between"), width: "100%", px: 2}}>
            <Box sx={{...flexGenerator("r.center"), gap: 1.5, minWidth: 0}}>
              <InsertDriveFileIcon color="primary" fontSize="small" />
              <Typography variant="body2" noWrap>
                {value.name}
              </Typography>
            </Box>
            {!disabled && (
              <IconButton size="small" onClick={handleRemove}>
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ) : (
          <Box sx={{...flexGenerator("c.center.center"), gap: 0.5, color: isDragOver ? "primary.main" : "text.secondary", pointerEvents: "none", py: 1, px: 1, textAlign: "center"}}>
            {uploading ? (
              <CircularProgress size={32} color="primary" />
            ) : (
              <>
                <UploadFileIcon sx={{fontSize: 32}} />
                <Typography variant="body2">{translate("global.fileUploader.dragOrClick")}</Typography>
                {accept && (
                  <Typography variant="caption" color="text.disabled">
                    {accept}
                  </Typography>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </>
  );
}
