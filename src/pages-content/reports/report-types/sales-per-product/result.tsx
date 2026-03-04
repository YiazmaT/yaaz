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
import {ImagePreview} from "@/src/components/image-preview";
import {buildName} from "@/src/pages-content/stock/products/utils";
import {SalesPerProductResultProps} from "./types";

export function SalesPerProductResult(props: SalesPerProductResultProps) {
  const {rows} = props.data;
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => ({
        quantitySold: acc.quantitySold + parseFloat(row.quantitySold),
        revenue: acc.revenue + parseFloat(row.revenue),
        profit: acc.profit + parseFloat(row.profit),
      }),
      {quantitySold: 0, revenue: 0, profit: 0},
    );
  }, [rows]);

  function handleDownloadPdf() {
    const params = new URLSearchParams({
      pdf: "true",
      generatedAt: new Date().toISOString(),
      dateFrom: props.filters.dateFrom,
      dateTo: props.filters.dateTo,
    });
    if (props.allProducts) {
      params.set("allProducts", "true");
    } else {
      props.products.forEach((p) => params.append("productIds", p.id));
    }
    window.open(`/api/reports/sales/sales-per-product?${params.toString()}`, "_blank");
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
            {translate("reports.types.salesPerProduct")}
          </Typography>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPdf}>
            {translate("reports.downloadPdf")}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
          {translate("reports.period")}: {moment(props.filters.dateFrom).format("DD/MM/YYYY")} - {moment(props.filters.dateTo).format("DD/MM/YYYY")}
        </Typography>

        <TableContainer component={Paper} sx={{maxHeight: 500}}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}}>{translate("reports.columns.product")}</TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">
                  {translate("reports.columns.salesCount")}
                </TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">
                  {translate("reports.columns.quantitySold")}
                </TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">
                  {translate("reports.columns.revenue")}
                </TableCell>
                <TableCell sx={{fontWeight: 600, backgroundColor: "#fafbfc"}} align="right">
                  {translate("reports.columns.profit")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.productId} hover>
                  <TableCell>
                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                      <ImagePreview url={row.image} alt={row.name} width={32} height={32} borderRadius={4} />
                      <Typography variant="body2">{buildName(row)}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{row.salesCount}</TableCell>
                  <TableCell align="right">{parseFloat(row.quantitySold).toLocaleString("pt-BR")}</TableCell>
                  <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.profit)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">{translate("global.noDataFound")}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {rows.length > 0 && (
              <TableFooter>
                <TableRow sx={{backgroundColor: "#f5f5f5"}}>
                  <TableCell sx={{fontWeight: 600}}>{translate("global.total")}</TableCell>
                  <TableCell align="right" />
                  <TableCell sx={{fontWeight: 600}} align="right">
                    {totals.quantitySold.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">
                    {formatCurrency(totals.revenue)}
                  </TableCell>
                  <TableCell sx={{fontWeight: 600}} align="right">
                    {formatCurrency(totals.profit)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
