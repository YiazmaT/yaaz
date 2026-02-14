"use client";
import {Box, Button} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {useTranslate} from "@/src/contexts/translation-context";
import {FinanceCategory} from "../../types";
import {CategoryForm} from "./form";
import {CategoriesFiltersComponent} from "./filters";
import {useCategories} from "./use-categories";

export function CategoriesDesktop() {
  const {translate} = useTranslate();
  const categories = useCategories();

  return (
    <>
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <CategoriesFiltersComponent onFilterChange={categories.handleFilterChange} />
          <Button variant="contained" onClick={categories.handleCreate}>
            {translate("global.include")}
          </Button>
        </Box>
        <Box sx={{flex: 1, minHeight: 0}}>
          <DataTable<FinanceCategory>
            apiRoute="/api/finance/category/paginated-list"
            columns={categories.generateConfig()}
            filters={categories.filters.showInactives ? {showInactives: "true"} : undefined}
          />
        </Box>
      </Box>
      <CategoryForm categories={categories} />
    </>
  );
}
