import {Box, Chip} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn} from "@/src/components/data-columns";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import {BankAccountsTableConfigProps} from "./types";
import {BankAccount} from "../types";

export function useBankAccountsTableConfig(props: BankAccountsTableConfigProps) {
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();

  function generateConfig(): DataTableColumn<BankAccount>[] {
    return [
      {
        field: "name",
        headerKey: "finance.bank.fields.name",
        width: "50%",
        render: (row) => (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            {!row.active && <Chip label={translate("finance.bank.inactive")} size="small" color="error" />}
            {row.name}
          </Box>
        ),
      },
      {
        field: "balance",
        headerKey: "finance.bank.fields.balance",
        width: "25%",
        align: "right",
        render: (row) => (
          <Box sx={{color: Number(row.balance) < 0 ? "error.main" : "success.main", fontWeight: 600}}>{formatCurrency(String(row.balance))}</Box>
        ),
      },
      {
        field: "actions",
        headerKey: "global.actions.label",
        width: "150px",
        align: "center",
        render: (row) => (
          <ActionsColumn
            row={row}
            onEdit={props.onEdit}
            hideEdit={(r) => !r.active}
            customActions={[
              {
                icon: () => <ReceiptLongIcon fontSize="small" />,
                tooltip: () => translate("finance.bank.viewStatement"),
                onClick: props.onStatement,
              },
              {
                icon: (r) =>
                  r.active ? (
                    <ToggleOnIcon sx={{color: "success.main"}} fontSize="small" />
                  ) : (
                    <ToggleOffIcon sx={{color: "grey.400"}} fontSize="small" />
                  ),
                tooltip: (r) => translate(r.active ? "finance.bank.tooltipDeactivate" : "finance.bank.tooltipActivate"),
                onClick: props.onToggleActive,
              },
            ]}
          />
        ),
      },
    ];
  }

  return {generateConfig};
}
