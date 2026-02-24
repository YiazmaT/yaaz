"use client";
import {useState} from "react";
import {Box, IconButton, Tooltip, Typography, useTheme} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {GenericModal} from "@/src/components/generic-modal";
import {FileUploader} from "@/src/components/file-uploader";
import {useApi} from "@/src/hooks/use-api";
import {useTranslate} from "@/src/contexts/translation-context";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {flexGenerator} from "@/src/utils/flex-generator";
import {extractFileName} from "@/src/utils/extract-file-name";
import {ReceiptModalProps} from "./types";

const ACCEPT = "image/*,.pdf";

export function ReceiptModal(props: ReceiptModalProps) {
  const [uploading, setUploading] = useState(false);
  const {translate} = useTranslate();
  const {bill, onClose, onReceiptChange} = props;
  const {show: showConfirmModal} = useConfirmModal();
  const api = useApi();
  const theme = useTheme();
  const toast = useToaster();
  const receiptUrl = bill?.receipt_url;

  async function uploadFile(file: File) {
    if (!bill) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("billId", bill.id);
    formData.append("file", file);

    await api.fetch("POST", "/api/finance/bill/upload-receipt", {
      formData,
      onSuccess: () => {
        toast.successToast("finance.bills.uploadReceiptSuccess");
        onReceiptChange();
      },
    });
    setUploading(false);
  }

  function handleNewFile(file: File) {
    if (receiptUrl) {
      showConfirmModal({
        message: "finance.bills.replaceReceiptConfirm",
        onConfirm: () => uploadFile(file),
      });
    } else {
      uploadFile(file);
    }
  }

  function handleView() {
    if (receiptUrl) window.open(receiptUrl, "_blank");
  }

  function handleDelete() {
    if (!bill) return;
    showConfirmModal({
      message: "finance.bills.deleteReceiptConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/finance/bill/delete-receipt", {
          body: {billId: bill.id},
          onSuccess: () => {
            toast.successToast("finance.bills.deleteReceiptSuccess");
            onReceiptChange();
          },
        });
      },
    });
  }

  function isImage(url: string) {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  return (
    <GenericModal open={!!bill} onClose={onClose} title={translate("finance.bills.receiptTitle")} maxWidth="sm">
      {receiptUrl ? (
        <Box sx={{...flexGenerator("c.center.center"), gap: 2, mb: 2}}>
          {isImage(receiptUrl) ? (
            <Box
              component="img"
              src={receiptUrl}
              alt="Receipt"
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
                {extractFileName(receiptUrl)}
              </Typography>
            </Box>
          )}

          <Box sx={{...flexGenerator("r.center.center"), gap: 1}}>
            <Tooltip title={translate("finance.bills.viewReceipt")}>
              <IconButton onClick={handleView}>
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={translate("finance.bills.deleteReceipt")}>
              <IconButton onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ) : null}

      <FileUploader
        value={null}
        onChange={(file) => { if (file) handleNewFile(file); }}
        uploading={uploading}
        accept={ACCEPT}
        height={90}
      />
    </GenericModal>
  );
}
