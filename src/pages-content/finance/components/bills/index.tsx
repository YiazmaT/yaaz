"use client";
import {Box, Button} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {useTranslate} from "@/src/contexts/translation-context";
import {BillInstallment} from "../../types";
import {BillForm} from "./form";
import {PayModal} from "./pay-modal";
import {useBills} from "./use-bills";

export function BillsDesktop() {
  const {translate} = useTranslate();
  const bills = useBills();

  return (
    <>
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <Box sx={{display: "flex", justifyContent: "flex-end", mb: 1}}>
          <Button variant="contained" onClick={bills.handleCreate}>
            {translate("global.include")}
          </Button>
        </Box>
        <Box sx={{flex: 1, minHeight: 0}}>
          <DataTable<BillInstallment> apiRoute="/api/finance/bill/paginated-list" columns={bills.generateConfig()} filters={bills.filters} />
        </Box>
      </Box>
      <BillForm bills={bills} />
      <PayModal installment={bills.payInstallment} onClose={bills.closePayModal} onSuccess={bills.refreshTable} />
    </>
  );
}
