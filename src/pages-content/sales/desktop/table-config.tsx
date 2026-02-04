import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn} from "@/src/components/data-columns";
import {TableConfigProps} from "@/src/@types/global-types";
import {formatCurrency} from "@/src/utils/format-currency";
import {Sale} from "../types";
import {useSalesConstants} from "../constants";
import {useTranslate} from "@/src/contexts/translation-context";

export function useSalesTableConfig(props: TableConfigProps<Sale>) {
  const {payment_methods} = useSalesConstants();
  const {translate} = useTranslate();

  function generateConfig(): DataTableColumn<Sale>[] {
    return [
      {
        field: "creation_date",
        headerKey: "sales.fields.date",
        width: "20%",
        render: (row) => {
          if (!row.creation_date) return "-";
          return new Date(row.creation_date).toLocaleString("pt-BR");
        },
      },
      {
        field: "payment_method",
        headerKey: "sales.fields.paymentMethod",
        width: "25%",
        render: (row) => translate(payment_methods[row.payment_method]?.label || ""),
      },
      {
        field: "items",
        headerKey: "sales.fields.items",
        width: "10%",
        align: "center",
        render: (row) => row.items?.length || 0,
      },
      {
        field: "approximate_cost",
        headerKey: "sales.fields.approximateCost",
        width: "15%",
        render: (row) => formatCurrency(Number(row.approximate_cost || 0)),
      },
      {
        field: "total",
        headerKey: "sales.fields.total",
        width: "15%",
        render: (row) => formatCurrency(Number(row.total)),
      },
      {
        field: "actions",
        headerKey: "global.actions.label",
        width: "120px",
        align: "center",
        render: (row) => <ActionsColumn row={row} onView={props.onView} onEdit={props.onEdit} onDelete={props.onDelete} />,
      },
    ];
  }

  return {generateConfig};
}
