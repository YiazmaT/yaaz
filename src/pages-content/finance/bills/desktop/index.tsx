"use client";
import {Box, Button} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {useTranslate} from "@/src/contexts/translation-context";
import {BillForm} from "../components/form";
import {BillsFilters} from "../components/filters";
import {PayModal} from "../components/pay-modal";
import {ReceiptModal} from "../components/receipt-modal";
import {useBills} from "../use-bills";
import { Bill } from "../types";

export function BillsDesktop() {
  const {translate} = useTranslate();
  const bills = useBills();

  return (
    <>
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <BillsFilters onFilterChange={bills.handleFilterChange} />
        <Box sx={{flex: 1, minHeight: 0}}>
          <DataTable<Bill>
            apiRoute="/api/finance/bill/paginated-list"
            columns={bills.generateConfig()}
            filters={bills.filters}
            renderOpositeSearch={
              <Button variant="contained" onClick={bills.handleCreate}>
                {translate("global.include")}
              </Button>
            }
          />
        </Box>
      </Box>
      <BillForm bills={bills} />
      <PayModal bill={bills.payBill} onClose={bills.closePayModal} onSuccess={bills.refreshTable} />
      <ReceiptModal bill={bills.receiptBill} onClose={bills.closeReceiptModal} onReceiptChange={bills.handleReceiptChange} />
    </>
  );
}
