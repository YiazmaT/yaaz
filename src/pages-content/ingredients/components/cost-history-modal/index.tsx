"use client";
import {Box, Dialog, DialogContent, DialogTitle, IconButton, Skeleton, Typography, alpha, useTheme} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {LineChart} from "@mui/x-charts/LineChart";
import {useApiQuery} from "@/src/hooks/use-api";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {flexGenerator} from "@/src/utils/flex-generator";
import {CostHistoryItem, CostHistoryModalProps} from "./types";

export function CostHistoryModal(props: CostHistoryModalProps) {
  const {translate} = useTranslate();
  const theme = useTheme();
  const formatCurrency = useFormatCurrency();
  const primaryColor = theme.palette.primary.main;

  const {data: result, isLoading} = useApiQuery<CostHistoryItem[]>({
    queryKey: ["cost-history", "ingredient", props.ingredientId],
    route: `/api/ingredient/${props.ingredientId}/cost-history`,
    enabled: props.open && !!props.ingredientId,
  });

  const sortedData = result ? [...result].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  const dates = sortedData.map((item) => new Date(item.date));
  const prices = sortedData.map((item) => item.costPerUnit);

  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{...flexGenerator("r.center.space-between")}}>
        <Typography variant="h6" component="span">
          {translate("ingredients.costHistory")} - {props.ingredientName}
        </Typography>
        <IconButton onClick={props.onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{...flexGenerator("c"), gap: 2, padding: 2}}>
            <Skeleton variant="rectangular" height={300} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        ) : dates.length === 0 ? (
          <Box sx={{...flexGenerator("r.center.center"), padding: 4}}>
            <Typography color="text.secondary">{translate("global.noDataFound")}</Typography>
          </Box>
        ) : (
          <Box sx={{width: "100%", height: 350}}>
            <LineChart
              xAxis={[
                {
                  scaleType: "point",
                  data: dates,
                  valueFormatter: (date: Date) => date.toLocaleDateString("pt-BR", {day: "2-digit", month: "2-digit"}),
                },
              ]}
              yAxis={[
                {
                  width: 100,
                  valueFormatter: (value: number | null) => (value != null ? formatCurrency(value, 4) : ""),
                },
              ]}
              series={[
                {
                  data: prices,
                  color: primaryColor,
                  valueFormatter: (value: number | null) => (value != null ? formatCurrency(value, 4) : ""),
                  area: true,
                  showMark: true,
                },
              ]}
              height={350}
              sx={{
                "& .MuiAreaElement-root": {
                  fill: alpha(primaryColor, 0.2),
                },
                "& .MuiLineElement-root": {
                  strokeWidth: 2,
                },
                "& .MuiMarkElement-root": {
                  fill: primaryColor,
                  stroke: "white",
                  strokeWidth: 2,
                },
              }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
