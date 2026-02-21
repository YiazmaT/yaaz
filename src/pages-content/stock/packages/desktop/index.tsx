"use client";
import {Box, Button} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {useTranslate} from "@/src/contexts/translation-context";
import {Package} from "../types";
import {Form} from "../components/form";
import {AddStockModal} from "../components/add-stock-drawer";
import {CostHistoryModal} from "../components/cost-history-modal";
import {StockChangeModal} from "../components/stock-change-modal";
import {StockHistoryModal} from "../components/stock-history-modal";
import {PackagesFiltersComponent} from "../components/filters";
import {DesktopViewProps} from "./types";

export function DesktopView(props: DesktopViewProps) {
  const {packages} = props;
  const {translate} = useTranslate();

  return (
    <>
      <ScreenCard title="packages.title">
        <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
          <PackagesFiltersComponent onFilterChange={packages.handleFilterChange} />
          <Box sx={{flex: 1, minHeight: 0}}>
            <DataTable<Package>
              apiRoute="/api/stock/package/paginated-list"
              columns={packages.generateConfig()}
              filters={packages.filters.showInactives ? {showInactives: "true"} : undefined}
              footerLeftContent={
                <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={packages.openStockModal}>
                  {translate("packages.addStock")}
                </Button>
              }
              renderOpositeSearch={
                <Button variant="contained" onClick={packages.handleCreate}>
                  {translate("global.include")}
                </Button>
              }
            />
          </Box>
        </Box>
      </ScreenCard>

      <Form packages={packages} imageSize={200} />
      <AddStockModal packages={packages} />
      {packages.costHistoryPackage && (
        <CostHistoryModal
          open={!!packages.costHistoryPackage}
          onClose={packages.closeCostHistory}
          packageId={packages.costHistoryPackage.id}
          packageName={packages.costHistoryPackage.name}
        />
      )}
      <StockChangeModal item={packages.stockChangeItem} onClose={packages.closeStockChangeModal} onSuccess={packages.refreshTable} />
      {packages.stockHistoryItem && (
        <StockHistoryModal
          open={!!packages.stockHistoryItem}
          onClose={packages.closeStockHistoryModal}
          packageId={packages.stockHistoryItem.id}
          packageName={packages.stockHistoryItem.name}
        />
      )}
    </>
  );
}
