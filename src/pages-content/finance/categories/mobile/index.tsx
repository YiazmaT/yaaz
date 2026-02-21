"use client";
import {ReactNode} from "react";
import {Box, CardContent, Chip, Fab, IconButton, Tooltip, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {MobileList} from "@/src/components/mobile-list";
import {useTranslate} from "@/src/contexts/translation-context";
import {CategoryForm} from "../components/form";
import {CategoriesFiltersComponent} from "../components/filters";
import {useCategories} from "../use-categories";
import {FinanceCategory} from "../types";

export function CategoriesMobile() {
  const {translate} = useTranslate();
  const categories = useCategories();

  function renderRow(item: FinanceCategory, actions: ReactNode) {
    return (
      <CardContent sx={{padding: 2, "&:last-child": {paddingBottom: 2}}}>
        <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            {!item.active && <Chip label={translate("finance.categories.inactive")} size="small" color="error" />}
            <Typography variant="subtitle1" fontWeight={600}>
              {item.name}
            </Typography>
          </Box>
          <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
            <Tooltip title={translate(item.active ? "finance.categories.tooltipDeactivate" : "finance.categories.tooltipActivate")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  categories.handleToggleActive(item);
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
      <MobileList<FinanceCategory>
        title="finance.categories.title"
        apiRoute="/api/finance/category/paginated-list"
        renderRow={renderRow}
        onEdit={categories.handleEdit}
        hideEdit={(row) => !row.active}
        filters={categories.filters.showInactives ? {showInactives: "true"} : undefined}
        headerContent={<CategoriesFiltersComponent onFilterChange={categories.handleFilterChange} />}
      />
      <Fab color="primary" size="small" onClick={categories.handleCreate} sx={{position: "fixed", bottom: 20, right: 20, zIndex: 20}}>
        <AddIcon sx={{color: "white"}} />
      </Fab>
      <CategoryForm categories={categories} />
    </Box>
  );
}
