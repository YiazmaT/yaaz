"use client";
import {useMemo} from "react";
import {Box, Button, Card, CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import moment from "moment";
import {useTranslate} from "@/src/contexts/translation-context";
import {formatCurrency} from "@/src/utils/format-currency";
import {SalesSummaryResultProps} from "./types";

export function SalesSummaryResult(props: SalesSummaryResultProps) {
  const {translate} = useTranslate();

  const totals = useMemo(() => {
    return props.data.reduce(
      (acc, row) => ({
        totalSales: acc.totalSales + parseFloat(row.totalSales),
        transactionCount: acc.transactionCount + row.transactionCount,
        cash: acc.cash + parseFloat(row.cash),
        credit: acc.credit + parseFloat(row.credit),
        debit: acc.debit + parseFloat(row.debit),
        pix: acc.pix + parseFloat(row.pix),
        iFood: acc.iFood + parseFloat(row.iFood),
      }),
      {totalSales: 0, transactionCount: 0, cash: 0, credit: 0, debit: 0, pix: 0, iFood: 0}
    );
  }, [props.data]);

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
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("reports.columns.totalSales")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("reports.columns.transactions")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("reports.columns.averageTicket")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("global.cash")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("global.credit")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("global.debit")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("global.pix")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("global.iFood")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.data.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{moment(row.date).format("DD/MM/YYYY")}</TableCell>
                  <TableCell align="right">{formatCurrency(row.totalSales)}</TableCell>
                  <TableCell align="right">{row.transactionCount}</TableCell>
                  <TableCell align="right">{formatCurrency(row.averageTicket)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.cash)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.credit)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.debit)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.pix)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.iFood)}</TableCell>
                </TableRow>
              ))}
              {props.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="text.secondary">{translate("global.noDataFound")}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {props.data.length > 0 && (
              <TableFooter>
                <TableRow sx={{backgroundColor: "#f5f5f5"}}>
                  <TableCell sx={{fontWeight: 600}}>{translate("global.total")}</TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">{formatCurrency(totals.totalSales)}</TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">{totals.transactionCount}</TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">{formatCurrency(averageTicket)}</TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">{formatCurrency(totals.cash)}</TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">{formatCurrency(totals.credit)}</TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">{formatCurrency(totals.debit)}</TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">{formatCurrency(totals.pix)}</TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">{formatCurrency(totals.iFood)}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
