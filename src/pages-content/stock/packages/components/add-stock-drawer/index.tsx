"use client";
import {useState} from "react";
import {Button, Grid} from "@mui/material";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {PackagesSelector} from "@/src/components/selectors/packages-selector";
import {PackageCompositionItem} from "@/src/components/selectors/packages-selector/types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {AddStockModalProps} from "./types";

export function AddStockModal(props: AddStockModalProps) {
  const [stockItems, setStockItems] = useState<PackageCompositionItem[]>([]);
  const {packages} = props;
  const {translate} = useTranslate();
  const api = useApi();
  const toast = useToaster();

  function handleClose() {
    setStockItems([]);
    packages.closeStockModal();
  }

  async function handleSubmit() {
    if (stockItems.length === 0) return;

    const hasInvalidQuantity = stockItems.some((item) => parseFloat(item.quantity) <= 0);
    if (hasInvalidQuantity) {
      toast.errorToast("packages.errors.quantityMustBeGreaterThanZero");
      return;
    }

    const items = stockItems.map((item) => ({
      packageId: item.package.id,
      quantity: item.quantity,
      cost: item.cost || undefined,
    }));

    await api.fetch("POST", "/api/stock/package/add-stock", {
      body: {items},
      onSuccess: () => {
        toast.successToast("packages.addStockSuccess");
        handleClose();
        packages.refreshTable();
      },
    });
  }

  return (
    <GenericDrawer title="packages.addStockTitle" show={packages.showStockModal} onClose={handleClose}>
      <Grid container spacing={2}>
        <PackagesSelector value={stockItems} onChange={setStockItems} showCostField />

        <Grid size={12} sx={{marginTop: 2}}>
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={stockItems.length === 0}>
            {translate("global.confirm")}
          </Button>
        </Grid>
      </Grid>
    </GenericDrawer>
  );
}
