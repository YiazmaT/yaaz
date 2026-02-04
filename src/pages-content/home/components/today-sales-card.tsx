"use client";
import {useEffect, useState} from "react";
import {Box, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi} from "@/src/hooks/use-api";
import {formatCurrency} from "@/src/utils/format-currency";
import {TodaySalesResponse} from "../dto";

const timeZone = process.env.TIME_ZONE ?? "America/Sao_Paulo";
export function TodaySalesCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TodaySalesResponse | null>(null);
  const {translate} = useTranslate();
  const api = useApi();

  const today = new Date();
  const todayFormatted = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}`;

  useEffect(() => {
    async function fetchData() {
      const result = await api.fetch<TodaySalesResponse>("GET", `/api/dashboard/sales/today?timezone=${encodeURIComponent(timeZone)}`);
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
          <TodayIcon color="primary" />
          <Typography variant="h6">
            {translate("dashboard.todaySales")} ({todayFormatted})
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{display: "flex", justifyContent: "center", padding: 4}}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Typography variant="h3" fontWeight={700} color="primary">
              {formatCurrency(data?.total || 0)}
            </Typography>
            <Box sx={{display: "flex", gap: 1, paddingTop: 1, marginTop: 1, borderTop: 1, borderColor: "divider"}}>
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
