"use client";
import {Box, Card, CardContent, Typography, useTheme} from "@mui/material";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import {BarChart} from "@mui/x-charts/BarChart";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApiQuery} from "@/src/hooks/use-api";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {WeeklySalesResponse} from "../dto";
import {ChartCardSkeleton} from "./skeletons";

export function WeeklySalesCard() {
  const {translate} = useTranslate();
  const theme = useTheme();
  const formatCurrency = useFormatCurrency();
  const primaryColor = theme.palette.primary.main;

  const shortDayNames = [
    translate("dashboard.days.sun"),
    translate("dashboard.days.mon"),
    translate("dashboard.days.tue"),
    translate("dashboard.days.wed"),
    translate("dashboard.days.thu"),
    translate("dashboard.days.fri"),
    translate("dashboard.days.sat"),
  ];

  const {data, isLoading} = useApiQuery<WeeklySalesResponse>({
    queryKey: ["dashboard", "sales", "weekly"],
    route: "/api/dashboard/sales/weekly",
  });

  function getDayLabels() {
    if (!data?.weekStart) return shortDayNames;

    const weekStart = new Date(data.weekStart);
    return shortDayNames.map((dayName, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${dayName} ${day}/${month}`;
    });
  }

  return (
    <Card sx={{height: "100%"}}>
      <CardContent>
        <Box sx={{display: "flex", alignItems: "center", gap: 1, marginBottom: 2}}>
          <CalendarViewWeekIcon color="primary" />
          <Typography variant="h6">{translate("dashboard.weeklySales")}</Typography>
        </Box>

        {isLoading ? (
          <ChartCardSkeleton />
        ) : (
          <Box>
            <Box sx={{width: "100%", height: 250}}>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: getDayLabels(),
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
                    data: data?.days || [0, 0, 0, 0, 0, 0, 0],
                    color: primaryColor,
                    valueFormatter: (value: number | null) => (value != null ? formatCurrency(value) : ""),
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
