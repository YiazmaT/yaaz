"use client";
import {useState} from "react";
import {Button, Grid} from "@mui/material";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {IngredientsSelector} from "@/src/components/ingredients-selector";
import {CompositionItem} from "@/src/components/ingredients-selector/types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {AddStockModalProps} from "./types";

export function AddStockModal(props: AddStockModalProps) {
  const [stockItems, setStockItems] = useState<CompositionItem[]>([]);
  const {ingredients} = props;
  const {translate} = useTranslate();
  const api = useApi();
  const toast = useToaster();

  function handleClose() {
    setStockItems([]);
    ingredients.closeStockModal();
  }

  async function handleSubmit() {
    if (stockItems.length === 0) return;

    const hasInvalidQuantity = stockItems.some((item) => parseFloat(item.quantity) <= 0);
    if (hasInvalidQuantity) {
      toast.errorToast("ingredients.errors.quantityMustBeGreaterThanZero");
      return;
    }

    const items = stockItems.map((item) => ({
      ingredientId: item.ingredient.id,
      quantity: item.quantity,
      cost: item.cost || undefined,
    }));

    await api.fetch("POST", "/api/stock/ingredient/add-stock", {
      body: {items},
      onSuccess: () => {
        toast.successToast("ingredients.addStockSuccess");
        handleClose();
        ingredients.refreshTable();
      },
    });
  }

  return (
    <GenericDrawer title="ingredients.addStockTitle" show={ingredients.showStockModal} onClose={handleClose}>
      <Grid container spacing={2}>
        <IngredientsSelector value={stockItems} onChange={setStockItems} showCostField />

        <Grid size={12} sx={{marginTop: 2}}>
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={stockItems.length === 0}>
            {translate("global.confirm")}
          </Button>
        </Grid>
      </Grid>
    </GenericDrawer>
  );
}
