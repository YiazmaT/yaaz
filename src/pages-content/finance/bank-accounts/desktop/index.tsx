"use client";
import {Box, Button} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {useTranslate} from "@/src/contexts/translation-context";
import {BankAccountForm} from "../components/form";
import {BankAccountsFiltersComponent} from "../components/filters";
import {StatementDrawer} from "../components/statement-drawer";
import {useBankAccounts} from "../use-bank-accounts";
import {BankAccount} from "../types";

export function BankAccountsDesktop() {
  const {translate} = useTranslate();
  const bankAccounts = useBankAccounts();

  return (
    <>
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <BankAccountsFiltersComponent onFilterChange={bankAccounts.handleFilterChange} />
        <Box sx={{flex: 1, minHeight: 0}}>
          <DataTable<BankAccount>
            apiRoute="/api/finance/bank-account/paginated-list"
            columns={bankAccounts.generateConfig()}
            filters={bankAccounts.filters.showInactives ? {showInactives: "true"} : undefined}
            renderOpositeSearch={
              <Button variant="contained" onClick={bankAccounts.handleCreate}>
                {translate("global.include")}
              </Button>
            }
          />
        </Box>
      </Box>
      <BankAccountForm bankAccounts={bankAccounts} />
      <StatementDrawer account={bankAccounts.statementAccount} onClose={bankAccounts.closeStatement} onTableRefresh={bankAccounts.refreshTable} />
    </>
  );
}
