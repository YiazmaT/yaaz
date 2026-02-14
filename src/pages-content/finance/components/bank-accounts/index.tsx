"use client";
import {Box, Button, FormControlLabel, Switch} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {useTranslate} from "@/src/contexts/translation-context";
import {BankAccount} from "../../types";
import {BankAccountForm} from "./form";
import {StatementDrawer} from "./statement-drawer";
import {useBankAccounts} from "./use-bank-accounts";

export function BankAccountsDesktop() {
  const {translate} = useTranslate();
  const bankAccounts = useBankAccounts();

  return (
    <>
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1}}>
          <FormControlLabel
            control={<Switch checked={bankAccounts.showInactives} onChange={(_, checked) => bankAccounts.setShowInactives(checked)} size="small" />}
            label={translate("finance.bank.filters.showInactives")}
          />
          <Button variant="contained" onClick={bankAccounts.handleCreate}>
            {translate("global.include")}
          </Button>
        </Box>
        <Box sx={{flex: 1, minHeight: 0}}>
          <DataTable<BankAccount>
            apiRoute="/api/finance/bank-account/paginated-list"
            columns={bankAccounts.generateConfig()}
            filters={bankAccounts.showInactives ? {showInactives: "true"} : undefined}
          />
        </Box>
      </Box>
      <BankAccountForm bankAccounts={bankAccounts} />
      <StatementDrawer account={bankAccounts.statementAccount} onClose={bankAccounts.closeStatement} onTableRefresh={bankAccounts.refreshTable} />
    </>
  );
}
