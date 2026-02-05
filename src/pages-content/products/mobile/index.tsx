"use client";
import {ReactNode, useRef} from "react";
import {Box, CardContent, Chip, Fab, IconButton, Tooltip, Typography, useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import {MobileList} from "@/src/components/mobile-list";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {flexGenerator} from "@/src/utils/flex-generator";
import {Product} from "../types";
import {Form} from "../components/form";
import {AddStockDrawer} from "../components/add-stock-drawer";
import {AddStockDrawerRef} from "../components/add-stock-drawer/types";
import {StockChangeModal} from "../components/stock-change-modal";
import {ProductsFiltersComponent} from "../components/filters";
import {MobileViewProps} from "./types";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

export function MobileView(props: MobileViewProps) {
  const {products} = props;
  const {translate} = useTranslate();
  const theme = useTheme();
  const formatCurrency = useFormatCurrency();
  const stockDrawerRef = useRef<AddStockDrawerRef>(null);

  function renderRow(item: Product, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", gap: 2}}>
          <ImagePreview url={item.image} alt={item.name} width={64} height={64} borderRadius={1} />
          <Box sx={{flex: 1, minWidth: 0, ...flexGenerator("c")}}>
            <Box sx={{...flexGenerator("r.sb.c")}}>
              <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
                {!item.active && <Chip label={translate("products.inactive")} size="small" color="error" />}
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                  {item.name}
                </Typography>
              </Box>
              {item.displayLandingPage ? (
                <StarIcon sx={{color: "warning.main", fontSize: 18}} />
              ) : (
                <StarOutlineIcon sx={{color: "grey.400", fontSize: 18}} />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" noWrap>
              {item.description || "-"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {translate("products.fields.price")}: {formatCurrency(item.price)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {translate("products.fields.approximateCost")}: {formatCurrency(item.approximateCost ?? 0)}
            </Typography>
            <Typography
              variant="caption"
              sx={{color: (item.min_stock ?? 0) > 0 && item.stock < (item.min_stock ?? 0) ? theme.palette.error.main : "text.secondary"}}
            >
              {`${translate("products.fields.stock")}: ${item.stock}`}
            </Typography>
            <Typography
              variant="caption"
              sx={{color: (item.min_stock ?? 0) > 0 && item.stock < (item.min_stock ?? 0) ? theme.palette.error.main : "text.secondary"}}
            >
              {`${translate("products.fields.minStock")}: ${item.min_stock ?? 0}`}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1,
            marginTop: 1,
            paddingTop: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          {item.active && (
            <Tooltip title={translate("products.stockChange.title")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  products.handleStockChange(item);
                }}
              >
                <SyncAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {item.active && (
            <Tooltip title={translate(item.displayLandingPage ? "products.landingPage.tooltipRemove" : "products.landingPage.tooltipAdd")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  products.handleToggleLandingPage(item);
                }}
              >
                {item.displayLandingPage ? (
                  <StarIcon sx={{color: "warning.main"}} fontSize="small" />
                ) : (
                  <StarOutlineIcon sx={{color: "grey.400"}} fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={translate(item.active ? "products.tooltipDeactivate" : "products.tooltipActivate")}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                products.handleToggleActive(item);
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
      </CardContent>
    );
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
      <Box sx={{px: 2, pt: 2}}>
        <ProductsFiltersComponent onFilterChange={products.handleFilterChange} />
      </Box>
      <MobileList<Product>
        key={products.tableKey}
        title="products.title"
        apiRoute="/api/product/paginated-list"
        renderRow={renderRow}
        onView={products.handleView}
        onEdit={products.handleEdit}
        hideEdit={(row) => !row.active}
        onDelete={products.handleDelete}
        filters={products.filters.showInactives ? {showInactives: "true"} : undefined}
      />

      <Fab
        color="secondary"
        size="small"
        onClick={() => stockDrawerRef.current?.open()}
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
        onClick={products.handleCreate}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 20,
        }}
      >
        <AddIcon sx={{color: "white"}} />
      </Fab>

      <Form products={products} imageSize={150} />
      <AddStockDrawer ref={stockDrawerRef} onSuccess={products.refreshTable} />
      <StockChangeModal item={products.stockChangeItem} onClose={products.closeStockChangeModal} onSuccess={products.refreshTable} />
    </Box>
  );
}
