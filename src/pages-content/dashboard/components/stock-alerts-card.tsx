"use client";
import {Box, Card, CardContent, CircularProgress, Typography, useTheme} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApiQuery} from "@/src/hooks/use-api";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {formatDate} from "@/src/utils/format-date";
import {StockAlertsResponse, StockAlertItem, BillAlertItem, BillsAlertsResponse} from "../dto";
import {buildName} from "@/src/pages-content/stock/products/utils";

export function StockAlertsCard() {
  const {translate} = useTranslate();
  const theme = useTheme();

  const {data: stockData, isLoading: stockLoading} = useApiQuery<StockAlertsResponse>({
    queryKey: ["dashboard", "stock-alerts"],
    route: "/api/dashboard/stock-alerts",
  });

  const {data: billsData, isLoading: billsLoading} = useApiQuery<BillsAlertsResponse>({
    queryKey: ["dashboard", "bills-alerts"],
    route: "/api/dashboard/bills-alerts",
  });

  const isLoading = stockLoading || billsLoading;

  const hasBillAlerts = billsData && (billsData.overdue.length > 0 || billsData.dueToday.length > 0);
  const hasStockAlerts = stockData && (stockData.products.length > 0 || stockData.ingredients.length > 0 || stockData.packages.length > 0);
  const hasAlerts = hasBillAlerts || hasStockAlerts;

  return (
    <Card sx={{flex: 3, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0}}>
      <CardContent sx={{flex: 1, display: "flex", flexDirection: "column", overflow: "hidden"}}>
        <Box sx={{display: "flex", alignItems: "center", gap: 1, marginBottom: 2}}>
          <WarningAmberIcon sx={{color: hasAlerts ? theme.palette.error.main : "primary.main"}} />
          <Typography variant="h6" sx={{color: hasAlerts ? theme.palette.error.main : undefined}}>
            {translate("dashboard.stockAlerts")}
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{display: "flex", justifyContent: "center", padding: 4}}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{flex: 1, display: "flex", flexDirection: "column", overflow: "hidden"}}>
            {hasAlerts ? (
              <Box sx={{flex: 1, overflowY: "auto"}}>
                {hasBillAlerts && (
                  <Box sx={{marginBottom: 2}}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{marginBottom: 1}}>
                      {translate("dashboard.billsAlerts")}
                    </Typography>
                    <BillAlertSection title={translate("dashboard.billsOverdue")} items={billsData!.overdue} color={theme.palette.error.main} />
                    <BillAlertSection title={translate("dashboard.billsDueToday")} items={billsData!.dueToday} color={theme.palette.warning.main} />
                  </Box>
                )}
                {hasStockAlerts && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} sx={{marginBottom: 1}}>
                      {translate("dashboard.minStock")}
                    </Typography>
                    <AlertSection title={translate("global.products")} items={stockData!.products} />
                    <AlertSection title={translate("global.ingredients")} items={stockData!.ingredients} />
                    <AlertSection title={translate("global.packages")} items={stockData!.packages} />
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {translate("dashboard.noStockAlerts")}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function BillAlertSection(props: {title: string; items: BillAlertItem[]; color: string}) {
  const theme = useTheme();
  const formatCurrency = useFormatCurrency();

  if (props.items.length === 0) return null;

  return (
    <Box sx={{marginBottom: 1.5}}>
      <Typography variant="subtitle2" fontWeight={600} sx={{marginBottom: 0.5, color: props.color}}>
        {props.title}
      </Typography>
      {props.items.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: 0.25,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{flex: 1, minWidth: 0}}>
            <Typography variant="body2" noWrap>
              {item.description}
            </Typography>
            {item.category && (
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {item.category.name}
              </Typography>
            )}
          </Box>
          <Box sx={{whiteSpace: "nowrap", marginLeft: 1, textAlign: "right"}}>
            <Typography variant="body2" fontWeight={500} sx={{color: props.color}}>
              {formatCurrency(String(item.amount))}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {formatDate(item.due_date)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function AlertSection(props: {title: string; items: StockAlertItem[]}) {
  const theme = useTheme();

  if (props.items.length === 0) return null;

  return (
    <Box sx={{marginBottom: 1.5}}>
      <Typography variant="subtitle2" fontWeight={600} sx={{marginBottom: 0.5}}>
        {props.title}
      </Typography>
      {props.items.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: 0.25,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" noWrap sx={{flex: 1, minWidth: 0}}>
            {buildName(item)}
          </Typography>
          <Box component="span" sx={{whiteSpace: "nowrap", marginLeft: 1, fontWeight: 500}}>
            <Typography component="span" variant="body2" sx={{color: theme.palette.error.main, fontWeight: 500}}>
              {item.stock}
            </Typography>
            <Typography component="span" variant="body2" sx={{fontWeight: 500}}>
              {" / "}
              {item.min_stock}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
