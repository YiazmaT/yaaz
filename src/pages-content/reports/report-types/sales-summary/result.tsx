"use client";
import {useMemo} from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import moment from "moment";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {SalesSummaryResultProps} from "./types";

export function SalesSummaryResult(props: SalesSummaryResultProps) {
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();
  const {paymentMethods, rows} = props.data;

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const byPm: Record<string, number> = {...acc.byPaymentMethod};
        paymentMethods.forEach((pm) => {
          byPm[pm] = (byPm[pm] || 0) + parseFloat(row.byPaymentMethod[pm] || "0");
        });
        return {
          totalSales: acc.totalSales + parseFloat(row.totalSales),
          transactionCount: acc.transactionCount + row.transactionCount,
          byPaymentMethod: byPm,
        };
      },
      {
        totalSales: 0,
        transactionCount: 0,
        byPaymentMethod: Object.fromEntries(paymentMethods.map((pm) => [pm, 0])),
      },
    );
  }, [rows, paymentMethods]);

  const averageTicket = totals.transactionCount > 0 ? totals.totalSales / totals.transactionCount : 0;

  function handleDownloadPdf() {
    const params = new URLSearchParams();
    params.append("data", JSON.stringify(props.data));
    params.append("generatedAt", new Date().toISOString());
    params.append("dateFrom", props.filters.dateFrom);
    params.append("dateTo", props.filters.dateTo);

    window.open(`/api/reports/sales/sales-summary/pdf?${params.toString()}`, "_blank");
  }

  return (
    <Card
      sx={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        borderRadius: 2,
        transition: "box-shadow 0.3s ease",
        "&:hover": {boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)"},
      }}
    >
      <CardContent sx={{p: 3}}>
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1}}>
          <Typography variant="h6" sx={{fontWeight: 600}}>
            {translate("reports.types.salesSummary")}
          </Typography>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPdf}>
            {translate("reports.downloadPdf")}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
          {translate("reports.period")}: {moment(props.filters.dateFrom).format("DD/MM/YYYY")} - {moment(props.filters.dateTo).format("DD/MM/YYYY")}
        </Typography>

        <TableContainer component={Paper} sx={{maxHeight: 400}}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}}>{translate("reports.columns.date")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">
                  {translate("reports.columns.totalSales")}
                </TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">
                  {translate("reports.columns.transactions")}
                </TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">
                  {translate("reports.columns.averageTicket")}
                </TableCell>
                {paymentMethods.map((pm) => (
                  <TableCell key={pm} sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">
                    {pm}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{moment(row.date).format("DD/MM/YYYY")}</TableCell>
                  <TableCell align="right">{formatCurrency(row.totalSales)}</TableCell>
                  <TableCell align="right">{row.transactionCount}</TableCell>
                  <TableCell align="right">{formatCurrency(row.averageTicket)}</TableCell>
                  {paymentMethods.map((pm) => (
                    <TableCell key={pm} align="right">
                      {formatCurrency(row.byPaymentMethod[pm] || "0")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4 + paymentMethods.length} align="center">
                    <Typography color="text.secondary">{translate("global.noDataFound")}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {rows.length > 0 && (
              <TableFooter>
                <TableRow sx={{backgroundColor: "#f5f5f5"}}>
                  <TableCell sx={{fontWeight: 600}}>{translate("global.total")}</TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">
                    {formatCurrency(totals.totalSales)}
                  </TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">
                    {totals.transactionCount}
                  </TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">
                    {formatCurrency(averageTicket)}
                  </TableCell>
                  {paymentMethods.map((pm) => (
                    <TableCell key={pm} sx={{fontWeight: 600}} align="right">
                      {formatCurrency(totals.byPaymentMethod[pm] || 0)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
