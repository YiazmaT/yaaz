import {Badge, Chip} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn} from "@/src/components/data-columns";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {formatDate} from "@/src/lib/format-date";
import {Nfe} from "../../types";
import DescriptionIcon from "@mui/icons-material/Description";
import {NfeTableConfigProps} from "./types";

export function useNfeTableConfig(props: NfeTableConfigProps) {
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();

  function generateConfig(): DataTableColumn<Nfe>[] {
    return [
      {
        field: "code",
        headerKey: "finance.nfe.fields.code",
        width: "70px",
        align: "center",
        render: (row) => `#${row.code}`,
      },
      {
        field: "description",
        headerKey: "finance.nfe.fields.description",
        width: "20%",
        render: (row) => row.description,
      },
      {
        field: "supplier",
        headerKey: "finance.nfe.fields.supplier",
        width: "15%",
        render: (row) => row.supplier || "-",
      },
      {
        field: "date",
        headerKey: "finance.nfe.fields.date",
        width: "10%",
        align: "center",
        render: (row) => formatDate(row.date),
      },
      {
        field: "total_amount",
        headerKey: "finance.nfe.fields.totalAmount",
        width: "12%",
        align: "right",
        render: (row) => formatCurrency(String(row.total_amount)),
      },
      {
        field: "items",
        headerKey: "finance.nfe.fields.items",
        width: "80px",
        align: "center",
        render: (row) => row._count?.items ?? 0,
      },
      {
        field: "stock_added",
        headerKey: "finance.nfe.fields.addStock",
        width: "80px",
        align: "center",
        render: (row) => (
          <Chip
            label={row.stock_added ? translate("global.yes") : translate("global.no")}
            size="small"
            color={row.stock_added ? "success" : "default"}
          />
        ),
      },
      {
        field: "actions",
        headerKey: "global.actions.label",
        width: "130px",
        align: "center",
        render: (row) => (
          <ActionsColumn
            row={row}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
            customActions={[
              {
                icon: (r: Nfe) => (
                  <Badge badgeContent={r.file_url ? 1 : 0} color="primary" max={99}>
                    <DescriptionIcon fontSize="small" color="info" />
                  </Badge>
                ),
                tooltip: () => translate("finance.nfe.fields.file"),
                onClick: props.onViewFile,
              },
            ]}
          />
        ),
      },
    ];
  }

  return {generateConfig};
}
