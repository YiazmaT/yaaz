import {Box, Chip} from "@mui/material";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn} from "@/src/components/data-columns";
import {useTranslate} from "@/src/contexts/translation-context";
import {PaymentMethod} from "../types";
import {PaymentMethodsTableConfigProps} from "./types";

export function usePaymentMethodsTableConfig(props: PaymentMethodsTableConfigProps) {
  const {translate} = useTranslate();

  function generateConfig(): DataTableColumn<PaymentMethod>[] {
    return [
      {
        field: "name",
        headerKey: "finance.paymentMethod.fields.name",
        width: "40%",
        render: (row) => (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            {!row.active && <Chip label={translate("finance.paymentMethod.inactive")} size="small" color="error" />}
            {row.name}
          </Box>
        ),
      },
      {
        field: "bank_account_name",
        headerKey: "finance.paymentMethod.fields.bankAccount",
        width: "40%",
        render: (row) => row.bank_account_name ?? "-",
      },
      {
        field: "actions",
        headerKey: "global.actions.label",
        width: "100px",
        align: "center",
        render: (row) => (
          <ActionsColumn
            row={row}
            onEdit={props.onEdit}
            hideEdit={(r) => !r.active}
            onDelete={props.onDelete}
            customActions={[
              {
                icon: (r) =>
                  r.active ? (
                    <ToggleOnIcon sx={{color: "success.main"}} fontSize="small" />
                  ) : (
                    <ToggleOffIcon sx={{color: "grey.400"}} fontSize="small" />
                  ),
                tooltip: (r) => translate(r.active ? "finance.paymentMethod.tooltipDeactivate" : "finance.paymentMethod.tooltipActivate"),
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
