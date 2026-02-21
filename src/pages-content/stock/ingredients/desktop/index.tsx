"use client";
import {Box, Button} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {DataTable} from "@/src/components/data-table";
import {ScreenCard} from "@/src/components/screen-card";
import {useTranslate} from "@/src/contexts/translation-context";
import {Ingredient} from "../types";
import {Form} from "../components/form";
import {AddStockModal} from "../components/add-stock-drawer";
import {CostHistoryModal} from "../components/cost-history-modal";
import {StockChangeModal} from "../components/stock-change-modal";
import {StockHistoryModal} from "../components/stock-history-modal";
import {IngredientsFiltersComponent} from "../components/filters";
import {DesktopViewProps} from "./types";

export function DesktopView(props: DesktopViewProps) {
  const {ingredients} = props;
  const {translate} = useTranslate();

  return (
    <>
      <ScreenCard title="ingredients.title">
        <Box sx={{display: "flex", flexDirection: "column", height: "100%"}}>
          <IngredientsFiltersComponent onFilterChange={ingredients.handleFilterChange} />
          <Box sx={{flex: 1, minHeight: 0}}>
            <DataTable<Ingredient>
              apiRoute="/api/ingredient/paginated-list"
              columns={ingredients.generateConfig()}
              filters={ingredients.filters.showInactives ? {showInactives: "true"} : undefined}
              footerLeftContent={
                <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={ingredients.openStockModal}>
                  {translate("ingredients.addStock")}
                </Button>
              }
              renderOpositeSearch={
                <Button variant="contained" onClick={ingredients.handleCreate}>
                  {translate("global.include")}
                </Button>
              }
            />
          </Box>
        </Box>
      </ScreenCard>

      <Form ingredients={ingredients} imageSize={200} />
      <AddStockModal ingredients={ingredients} />
      {ingredients.costHistoryIngredient && (
        <CostHistoryModal
          open={!!ingredients.costHistoryIngredient}
          onClose={ingredients.closeCostHistory}
          ingredientId={ingredients.costHistoryIngredient.id}
          ingredientName={ingredients.costHistoryIngredient.name}
        />
      )}
      <StockChangeModal item={ingredients.stockChangeItem} onClose={ingredients.closeStockChangeModal} onSuccess={ingredients.refreshTable} />
      {ingredients.stockHistoryItem && (
        <StockHistoryModal
          open={!!ingredients.stockHistoryItem}
          onClose={ingredients.closeStockHistoryModal}
          ingredientId={ingredients.stockHistoryItem.id}
          ingredientName={ingredients.stockHistoryItem.name}
          unitOfMeasure={ingredients.stockHistoryItem.unit_of_measure}
        />
      )}
    </>
  );
}
