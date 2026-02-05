"use client";
import {useEffect, useRef, useState} from "react";
import {Box, Dialog, DialogContent, DialogTitle, IconButton, Skeleton, Typography, alpha, useTheme} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {LineChart} from "@mui/x-charts/LineChart";
import {useApi} from "@/src/hooks/use-api";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {flexGenerator} from "@/src/utils/flex-generator";
import {CostHistoryModalProps, CostHistoryResponse} from "./types";

export function CostHistoryModal(props: CostHistoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<Date[]>([]);
  const [prices, setPrices] = useState<number[]>([]);
  const {translate} = useTranslate();
  const api = useApi();
  const theme = useTheme();
  const formatCurrency = useFormatCurrency();
  const fetchedRef = useRef<string | null>(null);
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    if (props.open && props.packageId && fetchedRef.current !== props.packageId) {
      fetchedRef.current = props.packageId;
      fetchData();
    }
  }, [props.open, props.packageId]);

  async function fetchData() {
    setLoading(true);
    const result = await api.fetch<CostHistoryResponse>("GET", `/api/package/${props.packageId}/cost-history`);
    if (result?.data) {
      const sortedData = result.data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setDates(sortedData.map((item) => new Date(item.date)));
      setPrices(sortedData.map((item) => item.costPerUnit));
    }
    setLoading(false);
  }

  function handleClose() {
    setDates([]);
    setPrices([]);
    setLoading(true);
    fetchedRef.current = null;
    props.onClose();
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{...flexGenerator("r.center.space-between")}}>
        <Typography variant="h6" component="span">
          {translate("packages.costHistory")} - {props.packageName}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
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
