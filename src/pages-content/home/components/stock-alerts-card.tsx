"use client";
import {useEffect, useState} from "react";
import {Box, Card, CardContent, CircularProgress, Typography, useTheme} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi} from "@/src/hooks/use-api";
import {StockAlertsResponse, StockAlertItem} from "../dto";

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
            {item.name}
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

export function StockAlertsCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StockAlertsResponse | null>(null);
  const {translate} = useTranslate();
  const api = useApi();
  const theme = useTheme();

  useEffect(() => {
    async function fetchData() {
      const result = await api.fetch<StockAlertsResponse>("GET", "/api/dashboard/stock-alerts");
      if (result) {
        setData(result);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const hasAlerts = data && (data.products.length > 0 || data.ingredients.length > 0 || data.packages.length > 0);

  return (
    <Card sx={{height: "100%"}}>
      <CardContent>
        <Box sx={{display: "flex", alignItems: "center", gap: 1, marginBottom: 2}}>
          <WarningAmberIcon sx={{color: hasAlerts ? theme.palette.error.main : "primary.main"}} />
          <Typography variant="h6" sx={{color: hasAlerts ? theme.palette.error.main : undefined}}>
            {translate("dashboard.stockAlerts")}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{display: "flex", justifyContent: "center", padding: 4}}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {hasAlerts ? (
              <>
                <Typography variant="subtitle1" fontWeight={600} sx={{marginBottom: 1}}>
                  {translate("dashboard.minStock")}
                </Typography>
                <Box sx={{maxHeight: 200, overflowY: "auto"}}>
                  <AlertSection title={translate("global.products")} items={data!.products} />
                  <AlertSection title={translate("global.ingredients")} items={data!.ingredients} />
                  <AlertSection title={translate("global.packages")} items={data!.packages} />
                </Box>
              </>
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
