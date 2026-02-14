import {Chip} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn} from "@/src/components/data-columns";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {formatDate} from "@/src/lib/format-date";
import {useFinanceConstants} from "../../constants";
import {BillInstallment} from "../../types";
import PaymentIcon from "@mui/icons-material/Payment";
import UndoIcon from "@mui/icons-material/Undo";
import {BillsTableConfigProps} from "./types";

export function useBillsTableConfig(props: BillsTableConfigProps) {
  const {translate} = useTranslate();
  const {billStatuses} = useFinanceConstants();
  const formatCurrency = useFormatCurrency();

  function generateConfig(): DataTableColumn<BillInstallment>[] {
    return [
      {
        field: "code",
        headerKey: "finance.bills.fields.code",
        width: "70px",
        align: "center",
        render: (row) => `#${row.bill.code}`,
      },
      {
        field: "description",
        headerKey: "finance.bills.fields.description",
        width: "20%",
        render: (row) => row.bill.description,
      },
      {
        field: "category",
        headerKey: "finance.bills.fields.category",
        width: "12%",
        render: (row) => row.bill.category?.name || "-",
      },
      {
        field: "installment_number",
        headerKey: "finance.bills.fields.installment",
        width: "80px",
        align: "center",
        render: (row) => {
          if (row.bill.recurrence_type === "none") return "-";
          return `${row.installment_number}/${row.bill.recurrence_count}`;
        },
      },
      {
        field: "amount",
        headerKey: "finance.bills.fields.amount",
        width: "12%",
        align: "right",
        render: (row) => formatCurrency(String(row.amount)),
      },
      {
        field: "due_date",
        headerKey: "finance.bills.fields.dueDate",
        width: "10%",
        align: "center",
        render: (row) => formatDate(row.due_date),
      },
      {
        field: "status",
        headerKey: "finance.bills.fields.status",
        width: "100px",
        align: "center",
        render: (row) => (
          <Chip
            label={billStatuses[row.status as keyof typeof billStatuses]?.label}
            size="small"
            color={billStatuses[row.status as keyof typeof billStatuses]?.color || "default"}
          />
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
            hideEdit={() => row.status === "paid"}
            onDelete={props.onDelete}
            customActions={[
              ...(row.status !== "paid"
                ? [
                    {
                      icon: () => <PaymentIcon fontSize="small" color="primary" />,
                      tooltip: () => translate("finance.bills.pay"),
                      onClick: props.onPay,
                    },
                  ]
                : []),
              ...(row.status === "paid"
                ? [
                    {
                      icon: () => <UndoIcon fontSize="small" color="warning" />,
                      tooltip: () => translate("finance.bills.cancelPayment"),
                      onClick: props.onCancelPayment,
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ];
  }

  return {generateConfig};
}
