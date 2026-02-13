import {Box, Chip, Tooltip, useTheme} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ImagePreviewColumn, ActionsColumn, TableButton} from "@/src/components/data-columns";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {Ingredient} from "../types";
import {useIngredientsConstants} from "../constants";
import {IngredientsTableConfigProps} from "./types";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {useTranslate} from "@/src/contexts/translation-context";
import {LinkifyText} from "@/src/components/linkify-text";

export function useIngredientsTableConfig(props: IngredientsTableConfigProps) {
  const {translate} = useTranslate();
  const {unitOfMeasures} = useIngredientsConstants();
  const theme = useTheme();
  const formatCurrency = useFormatCurrency();

  function generateConfig(): DataTableColumn<Ingredient>[] {
    return [
      {
        field: "image",
        headerKey: "ingredients.fields.image",
        width: "60px",
        render: (row) => <ImagePreviewColumn image={row.image} alt={row.name} />,
      },
      {
        field: "name",
        headerKey: "ingredients.fields.name",
        width: "25%",
        render: (row) => (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            {!row.active && <Chip label={translate("ingredients.inactive")} size="small" color="error" />}
            <Tooltip title={row.name} placement="top">
              <Box>{row.name}</Box>
            </Tooltip>
          </Box>
        ),
      },
      {
        field: "description",
        headerKey: "ingredients.fields.description",
        width: "30%",
        render: (row) => (row.description ? <LinkifyText text={row.description} variant="body2" /> : "-"),
      },
      {
        field: "stock",
        headerKey: "ingredients.fields.stock",
        width: "10%",
        align: "left",
        render: (row) => {
          const isLow = Number(row.min_stock || 0) > 0 && Number(row.stock) < Number(row.min_stock);
          return (
            <TableButton onClick={() => props.onStockHistoryClick(row)} color={isLow ? theme.palette.error.main : undefined} minWidth={100}>
              {`${Number(row.stock).toLocaleString("pt-BR")} ${unitOfMeasures[row.unit_of_measure as keyof typeof unitOfMeasures].label}`}
            </TableButton>
          );
        },
      },
      {
        field: "min_stock",
        headerKey: "ingredients.fields.minStock",
        width: "10%",
        align: "left",
        render: (row) => {
          const isLow = Number(row.min_stock || 0) > 0 && Number(row.stock) < Number(row.min_stock);
          return (
            <Box component="span" sx={{color: isLow ? theme.palette.error.main : "inherit"}}>
              {`${Number(row.min_stock || 0).toLocaleString("pt-BR")} ${unitOfMeasures[row.unit_of_measure as keyof typeof unitOfMeasures].label}`}
            </Box>
          );
        },
      },
      {
        field: "lastCost",
        headerKey: "ingredients.fields.lastCost",
        width: "15%",
        render: (row) =>
          row.lastCost ? (
            <TableButton onClick={() => props.onCostClick?.(row)} minWidth={140}>
              {formatCurrency(row.lastCost, 4)} / {unitOfMeasures[row.unit_of_measure as keyof typeof unitOfMeasures].label}
            </TableButton>
          ) : (
            "-"
          ),
      },
      {
        field: "actions",
        headerKey: "global.actions.label",
        width: "180px",
        align: "center",
        render: (row) => (
          <ActionsColumn
            row={row}
            onView={props.onView}
            onEdit={props.onEdit}
            hideEdit={(r) => !r.active}
            onDelete={props.onDelete}
            customActions={[
              {
                icon: () => <SyncAltIcon fontSize="small" />,
                tooltip: () => translate("ingredients.stockChange.title"),
                onClick: props.onStockChange,
                hidden: (r) => !r.active,
              },
              {
                icon: (r) =>
                  r.active ? (
                    <ToggleOnIcon sx={{color: "success.main"}} fontSize="small" />
                  ) : (
                    <ToggleOffIcon sx={{color: "grey.400"}} fontSize="small" />
                  ),
                tooltip: (r) => translate(r.active ? "ingredients.tooltipDeactivate" : "ingredients.tooltipActivate"),
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
