"use client";
import {Box, Card, CardContent, Typography} from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApiQuery} from "@/src/hooks/use-api";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {TodaySalesResponse} from "../dto";
import {TodaySalesCardSkeleton} from "./skeletons";

export function TodaySalesCard() {
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();

  const today = new Date();
  const todayFormatted = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}`;

  const {data, isLoading} = useApiQuery<TodaySalesResponse>({
    queryKey: ["dashboard", "sales", "today"],
    route: "/api/dashboard/sales/today",
  });

  return (
    <Card sx={{height: "100%"}}>
      <CardContent>
        <Box sx={{display: "flex", alignItems: "center", gap: 1, marginBottom: 2}}>
          <TodayIcon color="primary" />
          <Typography variant="h6">
            {translate("dashboard.todaySales")} ({todayFormatted})
          </Typography>
        </Box>

        {isLoading ? (
          <TodaySalesCardSkeleton />
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
