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
import {Ingredient} from "../types";
import {Form} from "../components/form";
import {AddStockModal} from "../components/add-stock-drawer";
import {StockChangeModal} from "../components/stock-change-modal";
import {IngredientsFiltersComponent} from "../components/filters";
import {MobileViewProps} from "./types";
import {buildName} from "../utils";
import {flexGenerator} from "@/src/utils/flex-generator";
import {LinkifyText} from "@/src/components/linkify-text";

export function MobileView(props: MobileViewProps) {
  const {ingredients} = props;
  const {translate} = useTranslate();
  const theme = useTheme();

  function renderRow(item: Ingredient, actions: ReactNode) {
    const unit_of_measure = ingredients.unitOfMeasures[item.unit_of_measure as keyof typeof ingredients.unitOfMeasures].label;
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", gap: 2}}>
          <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5}}>
            <ImagePreview url={item.image} alt={item.name} width={64} height={64} borderRadius={1} />
            {!item.active && <Chip label={translate("ingredients.inactive")} size="small" color="error" />}
          </Box>
          <Box sx={{...flexGenerator("c"), minWidth: 0, overflow: "hidden"}}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {buildName(item)}
            </Typography>
            {item.description ? (
              <LinkifyText text={item.description} variant="body2" color="text.secondary" />
            ) : (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{
                color: Number(item.min_stock || 0) > 0 && Number(item.stock) < Number(item.min_stock) ? theme.palette.error.main : "text.secondary",
              }}
            >
              {`${translate("ingredients.fields.stock")}: ${Number(item.stock).toLocaleString("pt-BR")} ${unit_of_measure}`}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: Number(item.min_stock || 0) > 0 && Number(item.stock) < Number(item.min_stock) ? theme.palette.error.main : "text.secondary",
              }}
            >
              {`${translate("ingredients.fields.minStock")}: ${Number(item.min_stock || 0).toLocaleString("pt-BR")} ${unit_of_measure}`}
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
            <Tooltip title={translate("ingredients.stockChange.title")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  ingredients.handleStockChange(item);
                }}
              >
                <SyncAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={translate(item.active ? "ingredients.tooltipDeactivate" : "ingredients.tooltipActivate")}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                ingredients.handleToggleActive(item);
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
      <MobileList<Ingredient>
        title="ingredients.title"
        apiRoute="/api/ingredient/paginated-list"
        renderRow={renderRow}
        onView={ingredients.handleView}
        onEdit={ingredients.handleEdit}
        hideEdit={(row) => !row.active}
        onDelete={ingredients.handleDelete}
        filters={ingredients.filters.showInactives ? {showInactives: "true"} : undefined}
        headerContent={<IngredientsFiltersComponent onFilterChange={ingredients.handleFilterChange} />}
      />

      <Fab
        color="secondary"
        size="small"
        onClick={ingredients.openStockModal}
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
        onClick={ingredients.handleCreate}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 20,
        }}
      >
        <AddIcon sx={{color: "white"}} />
      </Fab>

      <Form ingredients={ingredients} imageSize={150} />
      <AddStockModal ingredients={ingredients} />
      <StockChangeModal item={ingredients.stockChangeItem} onClose={ingredients.closeStockChangeModal} onSuccess={ingredients.refreshTable} />
    </Box>
  );
}
