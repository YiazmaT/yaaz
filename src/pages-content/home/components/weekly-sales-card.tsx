"use client";
import {useEffect, useState} from "react";
import {Box, Card, CardContent, CircularProgress, Typography, useTheme} from "@mui/material";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import {BarChart} from "@mui/x-charts/BarChart";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi} from "@/src/hooks/use-api";
import {formatCurrency} from "@/src/utils/format-currency";
import {WeeklySalesResponse} from "../dto";

const timeZone = process.env.TIME_ZONE ?? "America/Sao_Paulo";
export function WeeklySalesCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WeeklySalesResponse | null>(null);
  const {translate} = useTranslate();
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const api = useApi();

  const shortDayNames = [
    translate("dashboard.days.sun"),
    translate("dashboard.days.mon"),
    translate("dashboard.days.tue"),
    translate("dashboard.days.wed"),
    translate("dashboard.days.thu"),
    translate("dashboard.days.fri"),
    translate("dashboard.days.sat"),
  ];

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

  useEffect(() => {
    async function fetchData() {
      const result = await api.fetch<WeeklySalesResponse>("GET", `/api/dashboard/sales/weekly?timezone=${encodeURIComponent(timeZone)}`);
      if (result) {
        setData(result);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Card sx={{height: "100%"}}>
      <CardContent>
        <Box sx={{display: "flex", alignItems: "center", gap: 1, marginBottom: 2}}>
          <CalendarViewWeekIcon color="primary" />
          <Typography variant="h6">{translate("dashboard.weeklySales")}</Typography>
        </Box>

        {loading ? (
          <Box sx={{display: "flex", justifyContent: "center", padding: 4}}>
            <CircularProgress />
          </Box>
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
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
