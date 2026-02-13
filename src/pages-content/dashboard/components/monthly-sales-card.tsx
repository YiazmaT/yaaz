"use client";
import {Box, Card, CardContent, CircularProgress, Typography, useTheme} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {LineChart} from "@mui/x-charts/LineChart";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApiQuery} from "@/src/hooks/use-api";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {MonthlySalesResponse} from "../dto";

export function MonthlySalesCard() {
  const {translate} = useTranslate();
  const theme = useTheme();
  const formatCurrency = useFormatCurrency();
  const primaryColor = theme.palette.primary.main;

  const currentMonth = new Date().toLocaleString("pt-BR", {month: "long"});
  const currentMonthCapitalized = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  const {data, isLoading} = useApiQuery<MonthlySalesResponse>({
    queryKey: ["dashboard", "sales", "monthly"],
    route: "/api/dashboard/sales/monthly",
  });

  const days = data?.days.map((d) => d.day) || [];
  const values = data?.days.map((d) => d.total) || [];

  return (
    <Card sx={{height: "100%"}}>
      <CardContent>
        <Box sx={{display: "flex", alignItems: "center", gap: 1, marginBottom: 2}}>
          <CalendarMonthIcon color="primary" />
          <Typography variant="h6">
            {translate("dashboard.monthlySales")} ({currentMonthCapitalized})
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{display: "flex", justifyContent: "center", padding: 4}}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Box sx={{width: "100%", height: 250}}>
              <LineChart
                xAxis={[
                  {
                    scaleType: "point",
                    data: days,
                    valueFormatter: (value: number) => `${value}`,
                  },
                ]}
                yAxis={[
                  {
                    width: 100,
                    valueFormatter: (value: number | null) => (value != null ? formatCurrency(value) : ""),
                  },
                ]}
                series={[
                  {
                    data: values,
                    color: primaryColor,
                    valueFormatter: (value: number | null) => (value != null ? formatCurrency(value) : ""),
                    area: true,
                  },
                ]}
                height={250}
              />
            </Box>
            <Box sx={{display: "flex", gap: 1, paddingTop: 1, borderTop: 1, borderColor: "divider"}}>
              <Typography variant="body2" color="text.secondary">
                {translate("dashboard.salesQuantity")}:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {data?.count || 0}
              </Typography>
            </Box>
            <Box sx={{display: "flex", gap: 1, paddingTop: 1}}>
              <Typography variant="body2" color="text.secondary">
                {translate("dashboard.averageTicket")}:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatCurrency(data?.averageTicket || 0)}
              </Typography>
            </Box>
            <Box sx={{display: "flex", gap: 1, paddingTop: 1}}>
              <Typography variant="body2" color="text.secondary">
                {translate("dashboard.approximateCost")}:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatCurrency(data?.approximateCost || 0)}
              </Typography>
            </Box>
            <Box sx={{display: "flex", gap: 1, paddingTop: 1}}>
              <Typography variant="body2" color="text.secondary">
                {translate("dashboard.approximateProfit")}:
              </Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">
                {formatCurrency(data?.approximateProfit || 0)}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
