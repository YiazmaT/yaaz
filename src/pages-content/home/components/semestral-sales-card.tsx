"use client";
import {useEffect, useState} from "react";
import {Box, Card, CardContent, CircularProgress, Typography, useTheme} from "@mui/material";
import DateRangeIcon from "@mui/icons-material/DateRange";
import {BarChart} from "@mui/x-charts/BarChart";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi} from "@/src/hooks/use-api";
import {formatCurrency} from "@/src/utils/format-currency";
import {SemestralSalesResponse} from "../dto";

const timeZone = process.env.TIME_ZONE ?? "America/Sao_Paulo";
export function SemestralSalesCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SemestralSalesResponse | null>(null);
  const {translate} = useTranslate();
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const api = useApi();

  useEffect(() => {
    async function fetchData() {
      const result = await api.fetch<SemestralSalesResponse>("GET", `/api/dashboard/sales/semestral?timezone=${encodeURIComponent(timeZone)}`);
      if (result) {
        setData(result);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const labels = data?.months.map((m) => m.label) || [];
  const values = data?.months.map((m) => m.total) || [];

  return (
    <Card sx={{height: "100%"}}>
      <CardContent>
        <Box sx={{display: "flex", alignItems: "center", gap: 1, marginBottom: 2}}>
          <DateRangeIcon color="primary" />
          <Typography variant="h6">{translate("dashboard.semestralSales")}</Typography>
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
                    data: labels,
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
