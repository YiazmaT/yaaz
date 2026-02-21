"use client";
import {useState, useEffect} from "react";
import {Box, Button, Grid, TextField, Typography} from "@mui/material";
import {ImagePreview} from "@/src/components/image-preview";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {RadioGroup} from "@/src/components/form-fields/radio-group";
import {DecimalInput} from "@/src/components/form-fields/decimal-input";
import {useTranslate} from "@/src/contexts/translation-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {usePackagesConstants} from "../../constants";
import {PackageStockChangeReason} from "../../types";
import {StockChangeModalProps} from "./types";

export function StockChangeModal(props: StockChangeModalProps) {
  const [reason, setReason] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [newStock, setNewStock] = useState<string>("0");
  const {translate} = useTranslate();
  const {item, onClose, onSuccess} = props;
  const {stockChangeReasons} = usePackagesConstants();
  const api = useApi();
  const toast = useToaster();

  useEffect(() => {
    if (item) {
      setNewStock(item.stock);
      setReason("");
      setComment("");
    }
  }, [item]);

  function handleClose() {
    setNewStock("0");
    setReason("");
    setComment("");
    onClose();
  }

  async function handleSubmit() {
    if (!item || !reason) return;

    if (reason === PackageStockChangeReason.other && !comment.trim()) {
      toast.errorToast("packages.stockChange.commentRequired");
      return;
    }

    await api.fetch("POST", "/api/stock/package/stock-change", {
      body: {
        packageId: item.id,
        newStock,
        reason,
        comment: comment.trim() || undefined,
      },
      onSuccess: () => {
        toast.successToast("packages.stockChange.success");
        handleClose();
        onSuccess();
      },
    });
  }

  const reasonOptions = Object.values(stockChangeReasons).map((r) => ({
    value: r.value,
    label: r.label,
  }));

  const currentStock = Number(item?.stock ?? 0);
  const newStockNumber = Number(newStock);
  const stockDifference = newStockNumber - currentStock;
  const hasNoChange = stockDifference === 0;
  const isAdding = stockDifference > 0;

  return (
    <GenericDrawer title="packages.stockChange.title" show={!!item} onClose={handleClose}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
            <ImagePreview url={item?.image} alt={item?.name || ""} width={60} height={60} borderRadius={1} />
            <Typography variant="h6" fontWeight={600}>
              {item?.name}
            </Typography>
          </Box>
        </Grid>

        <Grid size={12}>
          <Typography variant="body1" color="text.secondary">
            {translate("packages.stockChange.currentStock")}: <strong>{currentStock.toLocaleString("pt-BR")}</strong>
          </Typography>
        </Grid>

        <Grid size={12}>
          <DecimalInput label="packages.stockChange.newStock" value={newStock} onChange={setNewStock} fullWidth />
        </Grid>

        {!hasNoChange && (
          <Grid size={12}>
            <Typography variant="body2" sx={{color: isAdding ? "success.main" : "error.main", fontWeight: 500}}>
              {isAdding
                ? `${translate("packages.stockChange.adding")}: ${Math.abs(stockDifference).toLocaleString("pt-BR")} ${translate("packages.stockChange.units")}`
                : `${translate("packages.stockChange.removing")}: ${Math.abs(stockDifference).toLocaleString("pt-BR")} ${translate("packages.stockChange.units")}`}
            </Typography>
          </Grid>
        )}

        <Grid size={12}>
          <RadioGroup label="packages.stockChange.reason" value={reason} onChange={setReason} options={reasonOptions} />
        </Grid>

        <Grid size={12}>
          <TextField
            label={translate("packages.stockChange.comment")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            rows={3}
            required={reason === PackageStockChangeReason.other}
          />
        </Grid>

        <Grid size={12} sx={{marginTop: 2}}>
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={!reason || hasNoChange}>
            {translate("global.confirm")}
          </Button>
        </Grid>
      </Grid>
    </GenericDrawer>
  );
}
