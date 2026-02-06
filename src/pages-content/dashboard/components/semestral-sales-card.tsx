"use client";
import {Box, Card, CardContent, CircularProgress, Typography, useTheme} from "@mui/material";
import DateRangeIcon from "@mui/icons-material/DateRange";
import {BarChart} from "@mui/x-charts/BarChart";
import {useTranslate} from "@/src/contexts/translation-context";
import {useTenant} from "@/src/contexts/tenant-context";
import {useApiQuery} from "@/src/hooks/use-api";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {SemestralSalesResponse} from "../dto";

export function SemestralSalesCard() {
  const {translate} = useTranslate();
  const {tenant} = useTenant();
  const theme = useTheme();
  const timeZone = tenant?.time_zone;
  const formatCurrency = useFormatCurrency();
  const primaryColor = theme.palette.primary.main;

  const {data, isLoading} = useApiQuery<SemestralSalesResponse>({
    queryKey: ["dashboard", "sales", "semestral", timeZone],
    route: `/api/dashboard/sales/semestral?timezone=${encodeURIComponent(timeZone!)}`,
    enabled: !!timeZone,
  });

  const labels = data?.months.map((m) => m.label) || [];
  const values = data?.months.map((m) => m.total) || [];

  return (
    <Card sx={{height: "100%"}}>
      <CardContent>
        <Box sx={{display: "flex", alignItems: "center", gap: 1, marginBottom: 2}}>
          <DateRangeIcon color="primary" />
          <Typography variant="h6">{translate("dashboard.semestralSales")}</Typography>
        </Box>

        {isLoading ? (
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
