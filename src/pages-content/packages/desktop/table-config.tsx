import {Box, Chip, Tooltip, useTheme} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ImagePreviewColumn, ActionsColumn, TableButton} from "@/src/components/data-columns";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {Package, PackageType} from "../types";
import {usePackagesConstants} from "../constants";
import {PackagesTableConfigProps} from "./types";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {useTranslate} from "@/src/contexts/translation-context";

export function usePackagesTableConfig(props: PackagesTableConfigProps) {
  const {translate} = useTranslate();
  const {typeOfPackage} = usePackagesConstants();
  const theme = useTheme();
  const formatCurrency = useFormatCurrency();

  function generateConfig(): DataTableColumn<Package>[] {
    return [
      {
        field: "image",
        headerKey: "packages.fields.image",
        width: "60px",
        render: (row) => <ImagePreviewColumn image={row.image} alt={row.name} />,
      },
      {
        field: "name",
        headerKey: "packages.fields.name",
        width: "20%",
        render: (row) => (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            {!row.active && <Chip label={translate("packages.inactive")} size="small" color="error" />}
            <Tooltip title={row.name} placement="top">
              <Box>{row.name}</Box>
            </Tooltip>
          </Box>
        ),
      },
      {
        field: "type",
        headerKey: "packages.fields.type",
        width: "120px",
        render: (row) => (
          <Chip
            label={row.type === PackageType.product ? typeOfPackage.productPackage.label : typeOfPackage.salePackage.label}
            size="small"
            color={row.type === PackageType.product ? "primary" : "secondary"}
            variant="outlined"
          />
        ),
      },
      {
        field: "description",
        headerKey: "packages.fields.description",
        width: "25%",
        render: (row) => row.description || "-",
      },
      {
        field: "stock",
        headerKey: "packages.fields.stock",
        width: "10%",
        align: "left",
        render: (row) => {
          const isLow = Number(row.min_stock || 0) > 0 && Number(row.stock) < Number(row.min_stock);
          return (
            <TableButton onClick={() => props.onStockHistoryClick(row)} color={isLow ? theme.palette.error.main : undefined}>
              {Number(row.stock).toLocaleString("pt-BR")}
            </TableButton>
          );
        },
      },
      {
        field: "min_stock",
        headerKey: "packages.fields.minStock",
        width: "10%",
        align: "left",
        render: (row) => {
          const isLow = Number(row.min_stock || 0) > 0 && Number(row.stock) < Number(row.min_stock);
          return (
            <Box component="span" sx={{color: isLow ? theme.palette.error.main : "inherit"}}>
              {Number(row.min_stock || 0).toLocaleString("pt-BR")}
            </Box>
          );
        },
      },
      {
        field: "lastCost",
        headerKey: "packages.fields.lastCost",
        width: "15%",
        render: (row) =>
          row.lastCost ? (
            <TableButton onClick={() => props.onCostClick?.(row)} minWidth={140}>
              {formatCurrency(row.lastCost, 4)}
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
                tooltip: () => translate("packages.stockChange.title"),
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
                tooltip: (r) => translate(r.active ? "packages.tooltipDeactivate" : "packages.tooltipActivate"),
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
