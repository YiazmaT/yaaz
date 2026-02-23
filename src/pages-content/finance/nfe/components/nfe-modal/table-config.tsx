import {Box, IconButton, Typography} from "@mui/material";
import Decimal from "decimal.js";
import DeleteIcon from "@mui/icons-material/Delete";
import {CoreTableColumn} from "@/src/components/core-table/types";
import {FormDecimalInput} from "@/src/components/form-fields/decimal-input";
import {FormCurrencyInput} from "@/src/components/form-fields/currency-input";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {NfeItemsTableConfigProps} from "../../desktop/types";
import {NfeFormItem} from "../../form-config";

export function useNfeItemsTableConfig(props: NfeItemsTableConfigProps) {
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();

  const itemTypeLabels: Record<string, string> = {
    ingredient: translate("global.ingredients"),
    product: translate("global.products"),
    package: translate("global.packages"),
  };

  function generateItemsConfig(isDetails: boolean): CoreTableColumn<NfeFormItem>[] {
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
        render: (_, index) => {
          if (isDetails) return <></>;
          return (
            <IconButton size="small" onClick={() => props.onRemove(index)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          );
        },
      },
    ];
  }

  return {generateItemsConfig};
}
