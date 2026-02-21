"use client";
import {useState, useEffect} from "react";
import {Box, Button, Grid, TextField, Typography} from "@mui/material";
import {ImagePreview} from "@/src/components/image-preview";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {RadioGroup} from "@/src/components/form-fields/radio-group";
import {IntegerInput} from "@/src/components/form-fields/integer-input";
import {useTranslate} from "@/src/contexts/translation-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {useProductsConstants} from "../../constants";
import {ProductStockChangeReason} from "../../types";
import {StockChangeModalProps} from "./types";

export function StockChangeModal(props: StockChangeModalProps) {
  const [reason, setReason] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [newStock, setNewStock] = useState<number>(0);
  const {item, onClose, onSuccess} = props;
  const {translate} = useTranslate();
  const {stockChangeReasons} = useProductsConstants();
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
    setNewStock(0);
    setReason("");
    setComment("");
    onClose();
  }

  async function handleSubmit() {
    if (!item || !reason) return;

    if (reason === ProductStockChangeReason.other && !comment.trim()) {
      toast.errorToast("products.stockChange.commentRequired");
      return;
    }

    await api.fetch("POST", "/api/product/stock-change", {
      body: {
        productId: item.id,
        newStock,
        reason,
        comment: comment.trim() || undefined,
      },
      onSuccess: () => {
        toast.successToast("products.stockChange.success");
        handleClose();
        onSuccess();
      },
    });
  }

  const reasonOptions = Object.values(stockChangeReasons).map((r) => ({
    value: r.value,
    label: r.label,
  }));

  const currentStock = item?.stock ?? 0;
  const stockDifference = newStock - currentStock;
  const hasNoChange = stockDifference === 0;
  const isAdding = stockDifference > 0;

  return (
    <GenericDrawer title="products.stockChange.title" show={!!item} onClose={handleClose}>
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
            {translate("products.stockChange.currentStock")}: <strong>{currentStock}</strong>
          </Typography>
        </Grid>

        <Grid size={12}>
          <IntegerInput label="products.stockChange.newStock" value={newStock} onChange={setNewStock} fullWidth />
        </Grid>

        {!hasNoChange && (
          <Grid size={12}>
            <Typography variant="body2" sx={{color: isAdding ? "success.main" : "error.main", fontWeight: 500}}>
              {isAdding
                ? `${translate("products.stockChange.adding")}: ${Math.abs(stockDifference)} ${translate("products.stockChange.units")}`
                : `${translate("products.stockChange.removing")}: ${Math.abs(stockDifference)} ${translate("products.stockChange.units")}`}
            </Typography>
          </Grid>
        )}

        <Grid size={12}>
          <RadioGroup label="products.stockChange.reason" value={reason} onChange={setReason} options={reasonOptions} />
        </Grid>

        <Grid size={12}>
          <TextField
            label={translate("products.stockChange.comment")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            rows={3}
            required={reason === ProductStockChangeReason.other}
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
