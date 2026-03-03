import {ReactNode} from "react";
import {Box, Divider, Typography} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {useTranslate} from "@/src/contexts/translation-context";
import {AuditLog, AuditTranslateFn} from "../types";

const ROUTE_ADD_STOCK = "/api/stock/ingredient/add-stock";

const REASON_LABELS: Record<string, string> = {
  stolen: "ingredients.stockChange.reasons.stolen",
  expired: "ingredients.stockChange.reasons.expired",
  damaged: "ingredients.stockChange.reasons.damaged",
  spillage: "ingredients.stockChange.reasons.spillage",
  found: "ingredients.stockChange.reasons.found",
  inventory_correction: "ingredients.stockChange.reasons.inventoryCorrection",
  other: "ingredients.stockChange.reasons.other",
};

function StockMovementRow(props: {
  name?: string;
  code?: string | number;
  previousStock: string | number;
  newStock: string | number;
  extra?: ReactNode;
}) {
  const prevNum = Number(props.previousStock);
  const newNum = Number(props.newStock);
  const delta = newNum - prevNum;
  const deltaColor = delta > 0 ? "success.main" : delta < 0 ? "error.main" : "text.secondary";
  const sign = delta > 0 ? "+" : "";
  const deltaStr = `(${sign}${delta.toFixed(2)})`;

  return (
    <Box sx={{display: "flex", flexDirection: "column", gap: 0.25}}>
      {props.name && (
        <Box sx={{display: "flex", gap: 0.5, alignItems: "baseline"}}>
          <Typography variant="caption" fontWeight={600}>
            {props.name}
          </Typography>
          {props.code !== undefined && (
            <Typography variant="caption" color="text.secondary">
              ({props.code})
            </Typography>
          )}
        </Box>
      )}
      <Box sx={{display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap"}}>
        <Typography variant="caption" sx={{fontFamily: "monospace"}}>
          {prevNum.toFixed(2)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          →
        </Typography>
        <Typography variant="caption" sx={{fontFamily: "monospace"}}>
          {newNum.toFixed(2)}
        </Typography>
        <Typography variant="caption" fontWeight={700} color={deltaColor} sx={{fontFamily: "monospace"}}>
          {deltaStr}
        </Typography>
      </Box>
      {props.extra}
    </Box>
  );
}

function renderAddStock(content: any, translate: AuditTranslateFn): ReactNode {
  const items: any[] = content?.items ?? [];
  const updated: any[] = content?.updated ?? [];

  return (
    <Box sx={{display: "flex", flexDirection: "column", py: 0.5}}>
      {items.map((item, i) => {
        const ingredient = updated[i];
        const newNum = Number(ingredient?.stock ?? 0);
        const quantity = Number(item.quantity ?? 0);
        const previousNum = newNum - quantity;
        const extra =
          item.cost != null ? (
            <Typography variant="caption" color="text.secondary">
              {translate("ingredients.fields.cost")}: {item.cost}
            </Typography>
          ) : null;

        return (
          <Box key={item.ingredientId ?? i}>
            {i > 0 && <Divider sx={{my: 0.75}} />}
            <StockMovementRow
              name={ingredient?.name}
              code={ingredient?.code}
              previousStock={previousNum}
              newStock={newNum}
              extra={extra}
            />
          </Box>
        );
      })}
    </Box>
  );
}

function renderStockChange(content: any, translate: AuditTranslateFn): ReactNode {
  const reasonKey = content?.reason ? (REASON_LABELS[content.reason] ?? null) : null;

  const extra = (
    <Box sx={{display: "flex", flexDirection: "column", gap: 0.1}}>
      {reasonKey && (
        <Typography variant="caption" color="text.secondary">
          {translate("ingredients.stockChange.reason")}: {translate(reasonKey)}
        </Typography>
      )}
      {content?.comment && (
        <Typography variant="caption" color="text.secondary">
          {translate("ingredients.stockChange.comment")}: {content.comment}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{py: 0.5}}>
      <StockMovementRow
        name={content?.ingredientName}
        code={content?.ingredientCode}
        previousStock={content?.previousStock ?? 0}
        newStock={content?.newStock ?? 0}
        extra={extra}
      />
    </Box>
  );
}

export function getIngredientStockColumns(translate: AuditTranslateFn): DataTableColumn<AuditLog>[] {
  return [
    {
      field: "stock",
      headerKey: "ingredients.fields.stock",
      width: "auto",
      render: (row) =>
        row.route === ROUTE_ADD_STOCK
          ? renderAddStock(row.content, translate)
          : renderStockChange(row.content, translate),
    },
  ];
}

export function IngredientStockContent(props: {content: any}) {
  const {translate} = useTranslate();
  const isAddStock = Array.isArray(props.content?.items);

  return isAddStock ? renderAddStock(props.content, translate) : renderStockChange(props.content, translate);
}
