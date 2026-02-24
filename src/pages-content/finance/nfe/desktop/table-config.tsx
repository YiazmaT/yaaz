import {Badge} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn} from "@/src/components/data-columns";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {formatDate} from "@/src/utils/format-date";
import {Nfe} from "../types";
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
        field: "nfe_number",
        headerKey: "finance.nfe.fields.nfeNumber",
        width: "10%",
        render: (row) => row.nfe_number || "-",
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
        field: "actions",
        headerKey: "global.actions.label",
        width: "150px",
        align: "center",
        render: (row) => (
          <ActionsColumn
            row={row}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
            onView={props.onViewDetails}
            hideEdit={(r) => r.stock_added}
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
              {
                icon: () => <Inventory2Icon fontSize="small" color="success" />,
                tooltip: () => translate("finance.nfe.launch"),
                onClick: props.onLaunch,
                hidden: (r: Nfe) => r.stock_added,
              },
            ]}
          />
        ),
      },
    ];
  }

  return {generateConfig};
}
