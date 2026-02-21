"use client";
import {ReactNode} from "react";
import {Box, CardContent, Chip, Fab, IconButton, Tooltip, Typography, useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import {MobileList} from "@/src/components/mobile-list";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {Package, PackageType} from "../types";
import {usePackagesConstants} from "../constants";
import {Form} from "../components/form";
import {AddStockModal} from "../components/add-stock-drawer";
import {StockChangeModal} from "../components/stock-change-modal";
import {PackagesFiltersComponent} from "../components/filters";
import {MobileViewProps} from "./types";
import {buildName} from "../utils";
import {flexGenerator} from "@/src/utils/flex-generator";

export function MobileView(props: MobileViewProps) {
  const {packages} = props;
  const {translate} = useTranslate();
  const {typeOfPackage} = usePackagesConstants();
  const theme = useTheme();

  function renderRow(item: Package, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", gap: 2}}>
          <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5}}>
            <ImagePreview url={item.image} alt={item.name} width={64} height={64} borderRadius={1} />
            {!item.active && <Chip label={translate("packages.inactive")} size="small" color="error" />}
          </Box>
          <Box sx={{...flexGenerator("c"), minWidth: 0}}>
            <Typography variant="subtitle1" fontWeight={600}>
              {buildName(item)}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {item.description || "-"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: Number(item.min_stock || 0) > 0 && Number(item.stock) < Number(item.min_stock) ? theme.palette.error.main : "text.secondary",
              }}
            >
              {`${translate("packages.fields.stock")}: ${Number(item.stock).toLocaleString("pt-BR")} (${item.unity_of_measure?.unity ?? ""})`}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: Number(item.min_stock || 0) > 0 && Number(item.stock) < Number(item.min_stock) ? theme.palette.error.main : "text.secondary",
              }}
            >
              {`${translate("packages.fields.minStock")}: ${Number(item.min_stock || 0).toLocaleString("pt-BR")} (${item.unity_of_measure?.unity ?? ""})`}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            ...flexGenerator("r.center.space-between"),
            marginTop: 1,
            paddingTop: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Chip
            label={item.type === PackageType.product ? typeOfPackage.productPackage.label : typeOfPackage.salePackage.label}
            size="small"
            color={item.type === PackageType.product ? "primary" : "secondary"}
            variant="outlined"
          />
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            {item.active && (
              <Tooltip title={translate("packages.stockChange.title")}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    packages.handleStockChange(item);
                  }}
                >
                  <SyncAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={translate(item.active ? "packages.tooltipDeactivate" : "packages.tooltipActivate")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  packages.handleToggleActive(item);
                }}
              >
                {item.active ? (
                  <ToggleOnIcon sx={{color: "success.main"}} fontSize="small" />
                ) : (
                  <ToggleOffIcon sx={{color: "grey.400"}} fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            {actions}
          </Box>
        </Box>
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <MobileList<Package>
        title="packages.title"
        apiRoute="/api/stock/package/paginated-list"
        renderRow={renderRow}
        onView={packages.handleView}
        onEdit={packages.handleEdit}
        hideEdit={(row) => !row.active}
        onDelete={packages.handleDelete}
        filters={packages.filters.showInactives ? {showInactives: "true"} : undefined}
        headerContent={<PackagesFiltersComponent onFilterChange={packages.handleFilterChange} />}
      />

      <Fab
        color="secondary"
        size="small"
        onClick={packages.openStockModal}
        sx={{
          position: "fixed",
          bottom: 20,
          left: 20,
          zIndex: 20,
        }}
      >
        <Inventory2OutlinedIcon sx={{color: "white"}} />
      </Fab>

      <Fab
        color="primary"
        size="small"
        onClick={packages.handleCreate}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 20,
        }}
      >
        <AddIcon sx={{color: "white"}} />
      </Fab>

      <Form packages={packages} imageSize={150} />
      <AddStockModal packages={packages} />
      <StockChangeModal item={packages.stockChangeItem} onClose={packages.closeStockChangeModal} onSuccess={packages.refreshTable} />
    </Box>
  );
}
