"use client";
import {ReactNode} from "react";
import {Box, CardContent, Chip, Fab, IconButton, Tooltip, Typography, useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import {MobileList} from "@/src/components/mobile-list";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {BankAccount} from "../../../types";
import {BankAccountForm} from "../form";
import {BankAccountsFiltersComponent} from "../filters";
import {StatementDrawer} from "../statement-drawer";
import {useBankAccounts} from "../use-bank-accounts";

export function BankAccountsMobile() {
  const {translate} = useTranslate();
  const theme = useTheme();
  const bankAccounts = useBankAccounts();
  const formatCurrency = useFormatCurrency();

  function renderRow(item: BankAccount, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            {!item.active && <Chip label={translate("finance.bank.inactive")} size="small" color="error" />}
            <Typography variant="subtitle1" fontWeight={600}>
              {item.name}
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight={600} sx={{color: Number(item.balance) < 0 ? "error.main" : "success.main"}}>
            {formatCurrency(String(item.balance))}
          </Typography>
        </Box>
        <Box sx={{display: "flex", justifyContent: "flex-end", gap: 0.5, mt: 1, pt: 1, borderTop: `1px solid ${theme.palette.divider}`}}>
          <Tooltip title={translate("finance.bank.viewStatement")}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                bankAccounts.handleStatement(item);
              }}
            >
              <ReceiptLongIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={translate(item.active ? "finance.bank.tooltipDeactivate" : "finance.bank.tooltipActivate")}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                bankAccounts.handleToggleActive(item);
              }}
            >
              {item.active ? (
                <ToggleOnIcon sx={{color: "success.main"}} fontSize="small" />
              ) : (
                <ToggleOffIcon sx={{color: "grey.400"}} fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          {actions}
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <MobileList<BankAccount>
        title="finance.bank.title"
        apiRoute="/api/finance/bank-account/paginated-list"
        renderRow={renderRow}
        onEdit={bankAccounts.handleEdit}
        hideEdit={(row) => !row.active}
        filters={bankAccounts.filters.showInactives ? {showInactives: "true"} : undefined}
        headerContent={<BankAccountsFiltersComponent onFilterChange={bankAccounts.handleFilterChange} />}
      />
      <Fab color="primary" size="small" onClick={bankAccounts.handleCreate} sx={{position: "fixed", bottom: 20, right: 20, zIndex: 20}}>
        <AddIcon sx={{color: "white"}} />
      </Fab>
      <BankAccountForm bankAccounts={bankAccounts} />
      <StatementDrawer account={bankAccounts.statementAccount} onClose={bankAccounts.closeStatement} onTableRefresh={bankAccounts.refreshTable} />
    </Box>
  );
}
