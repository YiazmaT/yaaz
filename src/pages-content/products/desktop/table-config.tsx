import {Badge, Box, Chip, Tooltip, useTheme} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ImagePreviewColumn, ActionsColumn, TableButton} from "@/src/components/data-columns";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {Product} from "../types";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {useTranslate} from "@/src/contexts/translation-context";
import {ProductTableConfigProps} from "./types";

export function useProductsTableConfig(props: ProductTableConfigProps) {
  const {translate} = useTranslate();
  const theme = useTheme();
  const formatCurrency = useFormatCurrency();

  function generateConfig(): DataTableColumn<Product>[] {
    return [
      {
        field: "code",
        headerKey: "products.fields.code",
        width: "70px",
        align: "center",
        render: (row) => `#${row.code}`,
      },
      {
        field: "image",
        headerKey: "products.fields.image",
        width: "60px",
        render: (row) => <ImagePreviewColumn image={row.image} alt={row.name} />,
      },
      {
        field: "name",
        headerKey: "products.fields.name",
        width: "25%",
        render: (row) => (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            {!row.active && <Chip label={translate("products.inactive")} size="small" color="error" />}
            <Tooltip title={row.name} placement="top">
              <Box
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  wordBreak: "break-word",
                }}
              >
                {row.name}
              </Box>
            </Tooltip>
          </Box>
        ),
      },
      {
        field: "description",
        headerKey: "products.fields.description",
        width: "40%",
        render: (row) => (
          <Tooltip title={row.description || "-"} placement="top">
            <Box
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
              }}
            >
              {row.description || "-"}
            </Box>
          </Tooltip>
        ),
      },
      {
        field: "price",
        headerKey: "products.fields.price",
        width: "12%",
        render: (row) => formatCurrency(Number(row.price)),
      },
      {
        field: "approximateCost",
        headerKey: "products.fields.approximateCost",
        width: "12%",
        render: (row) => formatCurrency(row.approximateCost ?? 0),
      },
      {
        field: "stock",
        headerKey: "products.fields.stock",
        width: "6%",
        align: "left",
        render: (row) => {
          const isLow = (row.min_stock ?? 0) > 0 && row.stock < (row.min_stock ?? 0);
          return (
            <TableButton onClick={() => props.onStockHistoryClick(row)} color={isLow ? theme.palette.error.main : undefined}>
              {row.stock}
            </TableButton>
          );
        },
      },
      {
        field: "min_stock",
        headerKey: "products.fields.minStock",
        width: "6%",
        align: "left",
        render: (row) => {
          const isLow = (row.min_stock ?? 0) > 0 && row.stock < (row.min_stock ?? 0);
          return (
            <Box component="span" sx={{color: isLow ? theme.palette.error.main : "inherit"}}>
              {row.min_stock ?? 0}
            </Box>
          );
        },
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
                icon: (r) => (
                  <Badge badgeContent={r.files?.length ?? 0} color="primary" max={99}>
                    <AttachFileIcon fontSize="small" />
                  </Badge>
                ),
                tooltip: () => translate("products.files.tooltip"),
                onClick: props.onOpenFiles,
              },
              {
                icon: () => <SyncAltIcon fontSize="small" />,
                tooltip: () => translate("products.stockChange.title"),
                onClick: props.onStockChange,
                hidden: (r) => !r.active,
              },
              {
                icon: (r) =>
                  r.displayLandingPage ? (
                    <StarIcon sx={{color: "warning.main"}} fontSize="small" />
                  ) : (
                    <StarOutlineIcon sx={{color: "grey.400"}} fontSize="small" />
                  ),
                tooltip: (r) => translate(r.displayLandingPage ? "products.landingPage.tooltipRemove" : "products.landingPage.tooltipAdd"),
                onClick: props.onToggleLandingPage,
                hidden: (r) => !r.active,
              },
              {
                icon: (r) =>
                  r.active ? (
                    <ToggleOnIcon sx={{color: "success.main"}} fontSize="small" />
                  ) : (
                    <ToggleOffIcon sx={{color: "grey.400"}} fontSize="small" />
                  ),
                tooltip: (r) => translate(r.active ? "products.tooltipDeactivate" : "products.tooltipActivate"),
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
