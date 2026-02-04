"use client";
import {forwardRef, useImperativeHandle, useState} from "react";
import {Box, Button, Checkbox, FormControlLabel, Grid, Typography} from "@mui/material";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {ProductsSelector} from "@/src/components/products-selector";
import {ProductItem} from "@/src/components/products-selector/types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useApi} from "@/src/hooks/use-api";
import {IngredientStockWarning, PackageStockWarning} from "../../dto";
import {AddStockDrawerProps, AddStockDrawerRef, AddStockResponse} from "./types";

export const AddStockDrawer = forwardRef<AddStockDrawerRef, AddStockDrawerProps>(function AddStockDrawer(props, ref) {
  const [show, setShow] = useState(false);
  const [stockItems, setStockItems] = useState<ProductItem[]>([]);
  const [deductIngredients, setDeductIngredients] = useState(true);
  const [deductPackages, setDeductPackages] = useState(true);
  const {onSuccess} = props;
  const {translate} = useTranslate();
  const {show: showConfirmModal} = useConfirmModal();
  const api = useApi();
  const toast = useToaster();

  useImperativeHandle(ref, () => ({
    open: () => setShow(true),
  }));

  function handleClose() {
    setStockItems([]);
    setDeductIngredients(true);
    setDeductPackages(true);
    setShow(false);
  }

  async function handleSubmit(force: boolean = false) {
    if (stockItems.length === 0) return;

    const hasInvalidQuantity = stockItems.some((item) => item.quantity <= 0);
    if (hasInvalidQuantity) {
      toast.errorToast("products.errors.quantityMustBeGreaterThanZero");
      return;
    }

    const items = stockItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const result = await api.fetch<AddStockResponse>("POST", "/api/product/add-stock", {
      body: {items, deductIngredients, deductPackages, force},
    });

    if (result?.success) {
      toast.successToast("products.addStockSuccess");
      handleClose();
      onSuccess?.();
    } else {
      const hasIngredientWarnings = result?.ingredientWarnings && result.ingredientWarnings.length > 0;
      const hasPackageWarnings = result?.packageWarnings && result.packageWarnings.length > 0;

      if (hasIngredientWarnings || hasPackageWarnings) {
        showConfirmModal({
          message: "products.negativeStockWarningGeneral",
          content: (
            <CombinedWarningsList
              ingredientWarnings={result?.ingredientWarnings || []}
              packageWarnings={result?.packageWarnings || []}
            />
          ),
          onConfirm: () => handleSubmit(true),
        });
      }
    }
  }

  function CombinedWarningsList(listProps: {ingredientWarnings: IngredientStockWarning[]; packageWarnings: PackageStockWarning[]}) {
    return (
      <Box sx={{width: "100%", mt: 2}}>
        {listProps.ingredientWarnings.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={600} sx={{mb: 1}}>
              {translate("global.ingredients")}
            </Typography>
            {listProps.ingredientWarnings.map((item) => (
              <Box key={item.ingredientId} sx={{display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #eee"}}>
                <Typography variant="body2" fontWeight={500}>
                  {item.ingredientName}
                </Typography>
                <Typography variant="body2" color="error">
                  {item.currentStock} → {item.resultingStock}
                </Typography>
              </Box>
            ))}
          </>
        )}
        {listProps.packageWarnings.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={600} sx={{mt: listProps.ingredientWarnings.length > 0 ? 2 : 0, mb: 1}}>
              {translate("global.packages")}
            </Typography>
            {listProps.packageWarnings.map((item) => (
              <Box key={item.packageId} sx={{display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #eee"}}>
                <Typography variant="body2" fontWeight={500}>
                  {item.packageName}
                </Typography>
                <Typography variant="body2" color="error">
                  {item.currentStock} → {item.resultingStock}
                </Typography>
              </Box>
            ))}
          </>
        )}
      </Box>
    );
  }

  return (
    <GenericDrawer title="products.addStockTitle" show={show} onClose={handleClose}>
      <Grid container spacing={2}>
        <ProductsSelector value={stockItems} onChange={setStockItems} />

        <Grid size={12}>
          <FormControlLabel
            control={<Checkbox checked={deductIngredients} onChange={(e) => setDeductIngredients(e.target.checked)} />}
            label={translate("products.deductIngredients")}
          />
        </Grid>

        <Grid size={12}>
          <FormControlLabel
            control={<Checkbox checked={deductPackages} onChange={(e) => setDeductPackages(e.target.checked)} />}
            label={translate("products.deductPackages")}
          />
        </Grid>

        <Grid size={12} sx={{marginTop: 2}}>
          <Button variant="contained" fullWidth onClick={() => handleSubmit()} disabled={stockItems.length === 0}>
            {translate("global.confirm")}
          </Button>
        </Grid>
      </Grid>
    </GenericDrawer>
  );
});
