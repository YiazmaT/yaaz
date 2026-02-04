"use client";
import {useRef} from "react";
import {Button} from "@mui/material";
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
import {DesktopViewProps} from "./types";

export function DesktopView(props: DesktopViewProps) {
  const {products} = props;
  const {translate} = useTranslate();
  const stockDrawerRef = useRef<AddStockDrawerRef>(null);

  return (
    <>
      <ScreenCard title="products.title" includeButtonFunction={products.handleCreate}>
        <DataTable<Product>
          key={products.tableKey}
          apiRoute="/api/product/paginated-list"
          columns={products.generateConfig()}
          footerLeftContent={
            <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => stockDrawerRef.current?.open()}>
              {translate("products.addStock")}
            </Button>
          }
        />
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
