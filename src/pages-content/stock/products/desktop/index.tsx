"use client";
import {useRef} from "react";
import {Box, Button} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {useTranslate} from "@/src/contexts/translation-context";
import {Product} from "../types";
import {Form} from "../components/form";
import {AddStockDrawer} from "../components/add-stock-drawer";
import {AddStockDrawerRef} from "../components/add-stock-drawer/types";
import {StockChangeModal} from "../components/stock-change-modal";
import {StockHistoryModal} from "../components/stock-history-modal";
import {FilesModal} from "../components/files-modal";
import {ProductsFiltersComponent} from "../components/filters";
import {useTenant} from "@/src/contexts/tenant-context";
import {DesktopViewProps} from "./types";

export function DesktopView(props: DesktopViewProps) {
  const {products} = props;
  const {tenant} = useTenant();
  const {translate} = useTranslate();
  const stockDrawerRef = useRef<AddStockDrawerRef>(null);

  return (
    <>
      <ScreenCard title="products.title">
        <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
          <ProductsFiltersComponent onFilterChange={products.handleFilterChange} />
          <Box sx={{flex: 1, minHeight: 0}}>
            <DataTable<Product>
              apiRoute="/api/product/paginated-list"
              columns={products.generateConfig()}
              filters={products.filters.showInactives ? {showInactives: "true"} : undefined}
              footerLeftContent={
                <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => stockDrawerRef.current?.open()}>
                  {translate("products.addStock")}
                </Button>
              }
              renderOpositeSearch={
                <Button variant="contained" onClick={products.handleCreate}>
                  {translate("global.include")}
                </Button>
              }
            />
          </Box>
        </Box>
      </ScreenCard>

      <Form products={products} imageSize={200} />
      <AddStockDrawer ref={stockDrawerRef} onSuccess={products.refreshTable} />
      <StockChangeModal item={products.stockChangeItem} onClose={products.closeStockChangeModal} onSuccess={products.refreshTable} />
      {products.stockHistoryItem && (
        <StockHistoryModal
          open={!!products.stockHistoryItem}
          onClose={products.closeStockHistoryModal}
          productId={products.stockHistoryItem.id}
          productName={products.stockHistoryItem.name}
        />
      )}
      {products.filesItem && (
        <FilesModal
          open={!!products.filesItem}
          onClose={products.closeFilesModal}
          productId={products.filesItem.id}
          productName={products.filesItem.name}
          files={products.filesItem.files ?? []}
          maxFileSizeMb={tenant?.max_file_size_in_mbs ?? 10}
          onFilesChange={products.handleFilesChange}
        />
      )}
    </>
  );
}
