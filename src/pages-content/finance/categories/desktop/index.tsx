"use client";
import {Box, Button} from "@mui/material";
import {DataTable} from "@/src/components/data-table";
import {useTranslate} from "@/src/contexts/translation-context";
import {CategoryForm} from "../components/form";
import {CategoriesFiltersComponent} from "../components/filters";
import {useCategories} from "../use-categories";
import {FinanceCategory} from "../types";

export function CategoriesDesktop() {
  const {translate} = useTranslate();
  const categories = useCategories();

  return (
    <>
      <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
        <CategoriesFiltersComponent onFilterChange={categories.handleFilterChange} />
        <Box sx={{flex: 1, minHeight: 0}}>
          <DataTable<FinanceCategory>
            apiRoute="/api/finance/category/paginated-list"
            columns={categories.generateConfig()}
            filters={categories.filters.showInactives ? {showInactives: "true"} : undefined}
            renderOpositeSearch={
              <Button variant="contained" onClick={categories.handleCreate}>
                {translate("global.include")}
              </Button>
            }
          />
        </Box>
      </Box>
      <CategoryForm categories={categories} />
    </>
  );
}
