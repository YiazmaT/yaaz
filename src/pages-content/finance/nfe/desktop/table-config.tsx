import {Badge, Box, IconButton, Typography} from "@mui/material";
import Decimal from "decimal.js";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import {CoreTableColumn} from "@/src/components/core-table/types";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn} from "@/src/components/data-columns";
import {FormDecimalInput} from "@/src/components/form-fields/decimal-input";
import {FormCurrencyInput} from "@/src/components/form-fields/currency-input";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {formatDate} from "@/src/utils/format-date";
import {Nfe} from "../types";
import {NfeFormItem} from "../form-config";
import {NfeItemsTableConfigProps, NfeTableConfigProps} from "./types";

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

export function useNfeItemsTableConfig(props: NfeItemsTableConfigProps) {
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();

  const itemTypeLabels: Record<string, string> = {
    ingredient: translate("global.ingredients"),
    product: translate("global.products"),
    package: translate("global.packages"),
  };

  function generateItemsConfig(): CoreTableColumn<NfeFormItem>[] {
    return [
      {field: "itemType", headerKey: "finance.nfe.items.type", render: (row) => itemTypeLabels[row.itemType]},
      {
        field: "name",
        headerKey: "finance.nfe.items.name",
        render: (row) => (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            <ImagePreview url={row.image} alt={row.name} width={30} height={30} borderRadius={1} />
            <Typography variant="body2">{row.name}</Typography>
          </Box>
        ),
      },
      {
        field: "quantity",
        headerKey: "finance.nfe.items.quantity",
        width: "160px",
        render: (_, index) => <FormDecimalInput fieldName={`items.${index}.quantity`} grid={false} errorAsIcon />,
      },
      {
        field: "unitPrice",
        headerKey: "finance.nfe.items.unitPrice",
        width: "180px",
        render: (_, index) => <FormCurrencyInput fieldName={`items.${index}.unitPrice`} grid={false} errorAsIcon />,
      },
      {
        field: "total",
        headerKey: "finance.nfe.items.totalPrice",
        width: "140px",
        align: "right",
        render: (row) => {
          const itemTotal = new Decimal(Number(row.quantity) || 0).times(Number(row.unitPrice) || 0);
          return formatCurrency(itemTotal.toDecimalPlaces(2).toString());
        },
      },
      {
        field: "actions",
        headerKey: "",
        width: "50px",
        align: "center",
        render: (_, index) => (
          <IconButton size="small" onClick={() => props.onRemove(index)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        ),
      },
    ];
  }

  return {generateItemsConfig};
}
