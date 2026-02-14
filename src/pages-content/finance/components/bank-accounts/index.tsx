"use client";
import {Box, Button} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {useTranslate} from "@/src/contexts/translation-context";
import {BankAccount} from "../../types";
import {BankAccountForm} from "./form";
import {BankAccountsFiltersComponent} from "./filters";
import {StatementDrawer} from "./statement-drawer";
import {useBankAccounts} from "./use-bank-accounts";

export function BankAccountsDesktop() {
  const {translate} = useTranslate();
  const bankAccounts = useBankAccounts();

  return (
    <>
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <BankAccountsFiltersComponent onFilterChange={bankAccounts.handleFilterChange} />
          <Button variant="contained" onClick={bankAccounts.handleCreate}>
            {translate("global.include")}
          </Button>
        </Box>
        <Box sx={{flex: 1, minHeight: 0}}>
          <DataTable<BankAccount>
            apiRoute="/api/finance/bank-account/paginated-list"
            columns={bankAccounts.generateConfig()}
            filters={bankAccounts.filters.showInactives ? {showInactives: "true"} : undefined}
          />
        </Box>
      </Box>
      <BankAccountForm bankAccounts={bankAccounts} />
      <StatementDrawer account={bankAccounts.statementAccount} onClose={bankAccounts.closeStatement} onTableRefresh={bankAccounts.refreshTable} />
    </>
  );
}
