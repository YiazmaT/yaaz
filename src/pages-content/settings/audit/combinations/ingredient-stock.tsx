import {ReactNode} from "react";
import {Box, Divider, Typography} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {AuditLog, AuditFormatCurrencyFn, AuditTranslateFn} from "../types";

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
  image?: string | null;
  unity?: string;
  previousStock: string | number;
  newStock: string | number;
  extra?: ReactNode;
}) {
  const prevNum = Number(props.previousStock);
  const newNum = Number(props.newStock);
  const delta = newNum - prevNum;
  const deltaColor = delta > 0 ? "success.main" : delta < 0 ? "error.main" : "text.secondary";
  const sign = delta > 0 ? "+" : "";
  const deltaStr = `(${sign}${Number(delta).toLocaleString("pt-BR")})`;

  return (
    <Box sx={{display: "flex", gap: 1.5, alignItems: "flex-start", py: 0.5}}>
      <ImagePreview url={props.image ?? null} width={40} height={40} alt={props.name ?? ""} borderRadius={6} />
      <Box sx={{display: "flex", flexDirection: "column", gap: 0.25}}>
        {props.name && (
          <Box sx={{display: "flex", gap: 0.5, alignItems: "baseline"}}>
            {props.code !== undefined && (
              <Typography variant="caption" color="text.secondary">
                (#{props.code})
              </Typography>
            )}
            <Typography variant="caption" fontWeight={600}>
              {props.name}
            </Typography>
          </Box>
        )}
        <Box sx={{display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap"}}>
          <Typography variant="caption" sx={{fontFamily: "monospace"}}>
            {Number(prevNum).toLocaleString("pt-BR")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            →
          </Typography>
          <Typography variant="caption" sx={{fontFamily: "monospace"}}>
            {Number(newNum).toLocaleString("pt-BR")}
          </Typography>
          {props.unity && (
            <Typography variant="caption" color="text.secondary">
              {props.unity}
            </Typography>
          )}
          <Typography variant="caption" fontWeight={700} color={deltaColor} sx={{fontFamily: "monospace"}}>
            {deltaStr}
          </Typography>
        </Box>
        {props.extra}
      </Box>
    </Box>
  );
}

function renderAddStock(content: any, translate: AuditTranslateFn, formatCurrency?: AuditFormatCurrencyFn): ReactNode {
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
          item.cost != null && formatCurrency ? (
            <Typography variant="caption" color="text.secondary">
              {translate("ingredients.fields.cost")}: {formatCurrency(item.cost)}
            </Typography>
          ) : null;

        return (
          <Box key={item.ingredientId ?? i}>
            {i > 0 && <Divider sx={{my: 0.75}} />}
            <StockMovementRow
              name={ingredient?.name}
              code={ingredient?.code}
              image={ingredient?.image}
              unity={ingredient?.unity_of_measure?.unity}
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
        image={content?.ingredientImage}
        unity={content?.ingredientUnity}
        previousStock={content?.previousStock ?? 0}
        newStock={content?.newStock ?? 0}
        extra={extra}
      />
    </Box>
  );
}

function renderNfeLaunch(content: any, translate: AuditTranslateFn, formatCurrency?: AuditFormatCurrencyFn): ReactNode {
  const nfeItems: any[] = content?.nfeItems ?? [];
  const nfeCode = content?.nfeCode;

  return (
    <Box sx={{display: "flex", flexDirection: "column", py: 0.5}}>
      {nfeCode && (
        <Typography variant="caption" color="text.secondary" sx={{mb: 0.75}}>
          {translate("finance.nfe.title")} #{nfeCode}
        </Typography>
      )}
      {nfeItems.map((item, i) => {
        const extra =
          item.cost != null && formatCurrency ? (
            <Typography variant="caption" color="text.secondary">
              {translate("ingredients.fields.cost")}: {formatCurrency(item.cost)}
            </Typography>
          ) : null;

        return (
          <Box key={item.ingredientId ?? i}>
            {i > 0 && <Divider sx={{my: 0.75}} />}
            <StockMovementRow
              name={item.name}
              code={item.code}
              image={item.image}
              unity={item.unity}
              previousStock={item.previousStock ?? 0}
              newStock={item.newStock ?? 0}
              extra={extra}
            />
          </Box>
        );
      })}
    </Box>
  );
}

export function getIngredientStockColumns(
  translate: AuditTranslateFn,
  formatCurrency?: AuditFormatCurrencyFn,
): DataTableColumn<AuditLog>[] {
  return [
    {
      field: "stock",
      headerKey: "ingredients.fields.stock",
      width: "auto",
      render: (row) => {
        if (row.route === ROUTE_ADD_STOCK) return renderAddStock(row.content, translate, formatCurrency);
        if (Array.isArray(row.content?.nfeItems)) return renderNfeLaunch(row.content, translate, formatCurrency);
        return renderStockChange(row.content, translate);
      },
    },
  ];
}

export function IngredientStockContent(props: {content: any}) {
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();
  if (Array.isArray(props.content?.items)) return renderAddStock(props.content, translate, formatCurrency);
  if (Array.isArray(props.content?.nfeItems)) return renderNfeLaunch(props.content, translate, formatCurrency);
  return renderStockChange(props.content, translate);
}
