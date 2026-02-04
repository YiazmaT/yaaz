"use client";
import {Box, Button, Card, CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import {useTranslate} from "@/src/contexts/translation-context";
import {formatCurrency} from "@/src/utils/format-currency";
import {ProfitMarginResultProps} from "./types";

export function ProfitMarginResult(props: ProfitMarginResultProps) {
  const {translate} = useTranslate();

  function handleDownloadPdf() {
    const params = new URLSearchParams();
    params.append("data", JSON.stringify(props.data));
    params.append("generatedAt", new Date().toISOString());
    params.append("dateFrom", props.filters.dateFrom);
    params.append("dateTo", props.filters.dateTo);

    window.open(`/api/reports/sales/profit-margin/pdf?${params.toString()}`, "_blank");
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
        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
          <Typography variant="h6" sx={{fontWeight: 600}}>
            {translate("reports.types.profitMargin")}
          </Typography>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPdf}>
            {translate("reports.downloadPdf")}
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{maxHeight: 400}}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}}>{translate("reports.columns.product")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("reports.columns.quantitySold")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("reports.columns.revenue")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("reports.columns.cost")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("reports.columns.profit")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">{translate("reports.columns.margin")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.data.map((row) => (
                <TableRow key={row.productId} hover>
                  <TableCell>{row.productName}</TableCell>
                  <TableCell align="right">{row.quantitySold}</TableCell>
                  <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.cost)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.profit)}</TableCell>
                  <TableCell align="right">{row.marginPercent}%</TableCell>
                </TableRow>
              ))}
              {props.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">{translate("global.noDataFound")}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
