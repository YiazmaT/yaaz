import {Chip} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn} from "@/src/components/data-columns";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {formatDate} from "@/src/lib/format-date";
import {useFinanceConstants} from "../../constants";
import {Bill} from "../../types";
import {isOverdue} from "../../utils";
import PaymentIcon from "@mui/icons-material/Payment";
import UndoIcon from "@mui/icons-material/Undo";
import {BillsTableConfigProps} from "./types";

export function useBillsTableConfig(props: BillsTableConfigProps) {
  const {translate} = useTranslate();
  const {billStatuses} = useFinanceConstants();
  const formatCurrency = useFormatCurrency();

  function generateConfig(): DataTableColumn<Bill>[] {
    return [
      {
        field: "code",
        headerKey: "finance.bills.fields.code",
        width: "70px",
        align: "center",
        render: (row) => `#${row.code}`,
      },
      {
        field: "description",
        headerKey: "finance.bills.fields.description",
        width: "20%",
        render: (row) => row.description,
      },
      {
        field: "category",
        headerKey: "finance.bills.fields.category",
        width: "12%",
        render: (row) => row.category?.name || "-",
      },
      {
        field: "installment_number",
        headerKey: "finance.bills.fields.installment",
        width: "80px",
        align: "center",
        render: (row) => {
          if (row.installment_count <= 1) return "-";
          return `${row.installment_number}/${row.installment_count}`;
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
        field: "paid_date",
        headerKey: "finance.bills.fields.paidDate",
        width: "12%",
        align: "center",
        render: (row) => (row.paid_date ? formatDate(row.paid_date, true) : "-"),
      },
      {
        field: "status",
        headerKey: "finance.bills.fields.status",
        width: "100px",
        align: "center",
        render: (row) => {
          const overdue = isOverdue(row);
          return (
            <Chip
              label={overdue ? translate("finance.bills.statuses.overdue") : billStatuses[row.status as keyof typeof billStatuses]?.label}
              size="small"
              color={overdue ? "error" : billStatuses[row.status as keyof typeof billStatuses]?.color || "default"}
            />
          );
        },
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
