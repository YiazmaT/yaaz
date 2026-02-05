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
import {ProductsFiltersComponent} from "../components/filters";
import {DesktopViewProps} from "./types";

export function DesktopView(props: DesktopViewProps) {
  const {products} = props;
  const {translate} = useTranslate();
  const stockDrawerRef = useRef<AddStockDrawerRef>(null);

  return (
    <>
      <ScreenCard title="products.title" includeButtonFunction={products.handleCreate}>
        <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
          <ProductsFiltersComponent onFilterChange={products.handleFilterChange} />
          <Box sx={{flex: 1, minHeight: 0}}>
            <DataTable<Product>
              key={products.tableKey}
              apiRoute="/api/product/paginated-list"
              columns={products.generateConfig()}
              filters={products.filters.showInactives ? {showInactives: "true"} : undefined}
              footerLeftContent={
                <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => stockDrawerRef.current?.open()}>
                  {translate("products.addStock")}
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
    </>
  );
}
