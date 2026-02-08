import {Chip} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ShoppingCartCheckout from "@mui/icons-material/ShoppingCartCheckout";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn} from "@/src/components/data-columns";
import {CustomAction} from "@/src/components/data-columns/types";
import {TableConfigProps} from "@/src/@types/global-types";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {Sale} from "../types";
import {useSalesConstants} from "../constants";
import {useTranslate} from "@/src/contexts/translation-context";

interface SalesTableConfigProps extends TableConfigProps<Sale> {
  onConvertQuote: (row: Sale) => void;
  onDownloadPdf: (row: Sale) => void;
}

export function useSalesTableConfig(props: SalesTableConfigProps) {
  const {payment_methods} = useSalesConstants();
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();

  function generateConfig(): DataTableColumn<Sale>[] {
    return [
      {
        field: "id",
        headerKey: "sales.fields.id",
        width: "10%",
        render: (row) => `#${row.id.split("-").pop()?.toUpperCase()}`,
      },
      {
        field: "creation_date",
        headerKey: "sales.fields.date",
        width: "15%",
        render: (row) => {
          if (!row.creation_date) return "-";
          return new Date(row.creation_date).toLocaleString("pt-BR");
        },
      },
      {
        field: "client",
        headerKey: "sales.fields.client",
        width: "15%",
        render: (row) => row.client?.name || "-",
      },
      {
        field: "is_quote",
        headerKey: "sales.isQuote",
        width: "10%",
        align: "center",
        render: (row) => row.is_quote ? <Chip label={translate("sales.quote")} size="small" color="warning" /> : null,
      },
      {
        field: "payment_method",
        headerKey: "sales.fields.paymentMethod",
        width: "20%",
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
        render: (row) => <span style={{whiteSpace: "nowrap"}}>{formatCurrency(Number(row.approximate_cost || 0))}</span>,
      },
      {
        field: "total",
        headerKey: "sales.fields.total",
        width: "15%",
        render: (row) => <span style={{whiteSpace: "nowrap"}}>{formatCurrency(Number(row.total))}</span>,
      },
      {
        field: "actions",
        headerKey: "global.actions.label",
        width: "150px",
        align: "center",
        render: (row) => {
          const customActions: CustomAction<Sale>[] = [
            {
              icon: <PictureAsPdfIcon fontSize="small" />,
              tooltip: translate("sales.downloadPdf"),
              onClick: (r) => props.onDownloadPdf(r),
            },
            {
              icon: <ShoppingCartCheckout fontSize="small" />,
              tooltip: translate("sales.convertQuote"),
              onClick: (r) => props.onConvertQuote(r),
              hidden: (r) => !r.is_quote,
            },
          ];
          return <ActionsColumn row={row} onView={props.onView} onEdit={props.onEdit} onDelete={props.onDelete} customActions={customActions} />;
        },
      },
    ];
  }

  return {generateConfig};
}
